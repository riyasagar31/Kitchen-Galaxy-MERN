import React, { useEffect, useState, useMemo } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiEye, FiSearch, FiChevronLeft, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';
const THEME_COLOR = '#ff5252';

export default function AdminSubCategories() {
    const navigate = useNavigate();
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: '', categoryId: '' });
    const [isEditing, setIsEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [viewedSub, setViewedSub] = useState(null);

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const token = localStorage.getItem('token');
    const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

    const load = async () => {
        try {
            const [subRes, catRes] = await Promise.all([
                axios.get(`${API_URL}/subcategories`, { headers }),
                axios.get(`${API_URL}/categories`, { headers })
            ]);
            setSubCategories(subRes.data.subCategories || []);
            setCategories(catRes.data.categories || []);
        } catch (err) {
            toast.error("Failed to load data");
        }
    };

    useEffect(() => { load(); }, []);

    // Filter Logic
    const filteredSubCategories = useMemo(() => {
        return subCategories.filter(sub => {
            const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategoryFilter === '' || sub.category?._id === selectedCategoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [subCategories, searchQuery, selectedCategoryFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredSubCategories.length / itemsPerPage);
    const paginatedSubs = filteredSubCategories.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleToggleView = (sub) => {
        if (viewedSub?._id === sub._id) {
            setViewedSub(null);
        } else {
            setViewedSub(sub);
        }
    };

    const handleSubmit = async () => {
        if (!form.name.trim() || !form.categoryId) return toast.error('Name and Category are required');

        try {
            if (isEditing) {
                await axios.patch(`${API_URL}/subcategories/${isEditing}`, form, { headers });
                toast.success('Updated successfully');
            } else {
                await axios.post(`${API_URL}/subcategories`, form, { headers });
                toast.success('Created successfully');
            }
            resetForm();
            load();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this subcategory?')) return;
        try {
            await axios.delete(`${API_URL}/subcategories/${id}`, { headers });
            setSubCategories(prev => prev.filter(s => s._id !== id));
            toast.success('Deleted successfully');
            if (viewedSub?._id === id) setViewedSub(null);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Delete failed');
        }
    };

    const openEdit = (sub) => {
        setIsEditing(sub._id);
        setForm({ name: sub.name, categoryId: sub.category?._id || '' });
        setShowForm(true);
    };

    const resetForm = () => {
        setForm({ name: '', categoryId: '' });
        setIsEditing(null);
        setShowForm(false);
    };

    return (
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">

        {/* BACK BUTTON SECTION */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/admin')}
             className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors" >
              <FiArrowLeft size={20} />
              <span>Back to Dashboard</span>
          </button>
        </div>

            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">Sub-Categories</h3>
                    <p className="text-sm text-gray-500">Link sub-items to parent categories</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search Bar */}
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Search sub-category..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                            style={{ '--tw-ring-color': THEME_COLOR }}
                            value={searchQuery}
                            onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        className="border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{ '--tw-ring-color': THEME_COLOR }}
                        value={selectedCategoryFilter}
                        onChange={(e) => {setSelectedCategoryFilter(e.target.value); setCurrentPage(1);}}
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>

                    <button 
                        style={{ backgroundColor: THEME_COLOR }}
                        className="inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-lg text-white shadow-lg shadow-red-100 hover:brightness-110 active:scale-95 transition-all"
                        onClick={() => { resetForm(); setShowForm(true); }}
                    >
                        <FiPlus className="mr-2 stroke-[3px]" /> New SubCategory
                    </button>
                </div>
            </div>

            {/* Form Section (Create Only) */}
            {showForm && !isEditing && (
                <div className="mb-8 bg-gray-50 p-5 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="font-bold text-gray-700 mb-4 uppercase tracking-wider text-xs">Create SubCategory</div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SubCategory Name</label>
                            <input
                                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 transition-all"
                                style={{ '--tw-ring-color': THEME_COLOR }}
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Basmati Rice"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parent Category</label>
                            <select
                                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 transition-all"
                                style={{ '--tw-ring-color': THEME_COLOR }}
                                value={form.categoryId}
                                onChange={e => setForm({ ...form, categoryId: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800" onClick={resetForm}>Cancel</button>
                        <button
                            style={{ backgroundColor: THEME_COLOR }}
                            className="px-6 py-2.5 rounded-lg text-sm font-bold text-white shadow-md hover:brightness-110 transition-all"
                            onClick={handleSubmit}
                        >
                            Create SubCategory
                        </button>
                    </div>
                </div>
            )}

            {/* Table Section */}
            <div className="overflow-hidden border border-gray-100 rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">SubCategory</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Parent Category</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {paginatedSubs.length === 0 ? (
                            <tr><td colSpan="3" className="px-6 py-10 text-center text-gray-400 italic">No subcategories found.</td></tr>
                        ) : paginatedSubs.map(sub => (
                            <React.Fragment key={sub._id}>
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="bg-gray-100 px-2.5 py-1 rounded-full text-xs font-semibold">{sub.category?.name || 'Uncategorized'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                                        <button style={{ color: THEME_COLOR }} className="p-2 rounded-full hover:bg-red-50 transition-all" onClick={() => handleToggleView(sub)}><FiEye size={18} /></button>
                                        <button style={{ color: THEME_COLOR }} className="p-2 rounded-full hover:bg-red-50 transition-all" onClick={() => openEdit(sub)}><FiEdit2 size={18} /></button>
                                        <button style={{ color: THEME_COLOR }} className="p-2 rounded-full hover:bg-red-50 transition-all" onClick={() => handleDelete(sub._id)}><FiTrash2 size={18} /></button>
                                    </td>
                                </tr>
                                {/* Inline Edit Form */}
                                {isEditing === sub._id && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 bg-gray-50/30">
                                            <div className="p-5 bg-white border-2 rounded-xl shadow-lg animate-in zoom-in-95 duration-200" style={{ borderColor: THEME_COLOR }}>
                                                <div className="font-bold text-gray-700 mb-4 uppercase tracking-wider text-xs">Edit SubCategory</div>
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SubCategory Name</label>
                                                        <input
                                                            className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 transition-all"
                                                            style={{ '--tw-ring-color': THEME_COLOR }}
                                                            value={form.name}
                                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parent Category</label>
                                                        <select
                                                            className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 transition-all"
                                                            style={{ '--tw-ring-color': THEME_COLOR }}
                                                            value={form.categoryId}
                                                            onChange={e => setForm({ ...form, categoryId: e.target.value })}
                                                        >
                                                            {categories.map(c => (
                                                                <option key={c._id} value={c._id}>{c.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="mt-6 flex justify-end space-x-3">
                                                    <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800" onClick={resetForm}>Cancel</button>
                                                    <button
                                                        style={{ backgroundColor: THEME_COLOR }}
                                                        className="px-6 py-2.5 rounded-lg text-sm font-bold text-white shadow-md hover:brightness-110 transition-all"
                                                        onClick={handleSubmit}
                                                    >
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {/* Inline View Details */}
                                {viewedSub?._id === sub._id && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 bg-gray-50/30">
                                            <div className="p-6 rounded-xl border-l-4 shadow-md bg-white animate-in slide-in-from-left-2 duration-300"
                                                style={{ borderColor: THEME_COLOR }}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">SubCategory Details</span>
                                                        <h4 className="text-2xl font-bold mt-1" style={{ color: THEME_COLOR }}>{sub.name}</h4>
                                                        <div className="mt-3 flex items-center space-x-2">
                                                            <span className="text-xs font-bold text-gray-400 uppercase">Belongs to:</span>
                                                            <span className="text-sm font-semibold text-gray-700">{sub.category?.name || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <button className="p-1 hover:rotate-90 transition-transform duration-300" style={{ color: THEME_COLOR }} onClick={() => setViewedSub(null)}>
                                                        <FiPlus className="rotate-45" size={24} />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 border-t pt-4">
                    <p className="text-sm text-gray-600">
                        Showing {Math.min(filteredSubCategories.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredSubCategories.length, currentPage * itemsPerPage)} of {filteredSubCategories.length} items
                    </p>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                        >
                            <FiChevronLeft />
                        </button>
                        <div className="flex items-center px-4 text-sm font-medium">
                            Page {currentPage} of {totalPages}
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-md border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}