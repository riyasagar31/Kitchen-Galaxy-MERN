import React, { useEffect, useMemo, useState } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiEye, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';
const THEME_COLOR = '#ff5252';

export default function AdminCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [expandedEditId, setExpandedEditId] = useState(null);
  const [viewedCategory, setViewedCategory] = useState(null);
  const [editForm, setEditForm] = useState({ name: '' });
  const [createForm, setCreateForm] = useState({ name: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem('token');
  const config = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  const load = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/categories`, config);
      setCategories(res.data.categories || []);
    } catch (err) {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggleView = (category) => {
    // If clicking the same one, close it. Otherwise, open the new one.
    if (viewedCategory?._id === category._id) {
      setViewedCategory(null);
    } else {
      setViewedCategory(category);
    }
  };

  const createCategory = async () => {
    if (!createForm.name.trim()) return toast.error('Name is required');
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/admin/categories`, createForm, config);
      if (res.data.success) {
        toast.success('Category created successfully');
        setShowCreate(false);
        setCreateForm({ name: '' });
        load();
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Creation failed';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/admin/categories/${id}`, config);
      if (res.data.category) {
        setEditForm({ name: res.data.category.name });
        setExpandedEditId(id);
      }
    } catch (err) {
      toast.error("Failed to fetch details");
    }
  };

  const saveEdit = async (id) => {
    try {
      await axios.patch(`${API_URL}/admin/categories/${id}`, editForm, config);
      setExpandedEditId(null);
      toast.success("Category updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      const res = await axios.delete(`${API_URL}/admin/categories/${id}`, config);
      if (res.data.success) {
        toast.success("Category removed");
        load();
        if (expandedEditId === id) setExpandedEditId(null);
        if (viewedCategory?._id === id) setViewedCategory(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Product Categories</h3>
          <p className="text-sm text-gray-500">Manage your store inventory classifications</p>
        </div>
        <button
          style={{ backgroundColor: THEME_COLOR }}
          className="inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-lg text-white shadow-lg shadow-red-200 hover:brightness-110 active:scale-95 transition-all"
          onClick={() => setShowCreate(!showCreate)}
        >
          <FiPlus className="mr-2 stroke-[3px]" /> {showCreate ? 'Cancel' : 'Add New'}
        </button>
      </div>

      {/* Create Section */}
      {showCreate && (
        <div className="mb-8 bg-gray-50 p-5 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-4 duration-300">
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-4">Create New Category</h4>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 transition-all"
                style={{ '--tw-ring-color': THEME_COLOR }}
                value={createForm.name}
                onChange={e => setCreateForm({ name: e.target.value })}
                disabled={isSubmitting}
                placeholder="e.g. Kitchen Appliances"
              />
            </div>
            <button
              style={{ backgroundColor: THEME_COLOR }}
              className={`px-8 py-3 rounded-lg text-sm font-bold text-white shadow-md transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'}`}
              onClick={createCategory}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="overflow-hidden border border-gray-100 rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Category Name</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {categories.length > 0 ? categories.map(c => (
              <React.Fragment key={c._id}>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{c.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-4">
                    <button
                      style={{ color: THEME_COLOR }}
                      className="p-2 rounded-full hover:bg-red-50 transition-all active:scale-90"
                      onClick={() => handleToggleView(c)}
                      title="Quick View"
                    >
                      <FiEye size={18} />
                    </button>
                    <button
                      style={{ color: THEME_COLOR }}
                      className="p-2 rounded-full hover:bg-red-50 transition-all active:scale-90"
                      onClick={() => openEdit(c._id)}
                      title="Modify"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      style={{ color: THEME_COLOR }}
                      className="p-2 rounded-full hover:bg-red-50 transition-all active:scale-90"
                      onClick={() => handleDelete(c._id)}
                      title="Remove"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
                {/* Inline Edit Form */}
                {expandedEditId === c._id && (
                  <tr>
                    <td colSpan="2" className="px-6 py-4 bg-gray-50/30">
                      <div className="p-5 bg-white border-2 rounded-xl shadow-lg animate-in zoom-in-95 duration-200" style={{ borderColor: THEME_COLOR }}>
                        <h4 className="text-sm font-black mb-3 uppercase tracking-tighter" style={{ color: THEME_COLOR }}>Edit Category Name</h4>
                        <div className="flex gap-2">
                          <input
                            className="flex-1 border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 shadow-sm text-sm"
                            style={{ '--tw-ring-color': THEME_COLOR }}
                            value={editForm.name}
                            onChange={(e) => setEditForm({ name: e.target.value })}
                          />
                          <button
                            style={{ backgroundColor: THEME_COLOR }}
                            className="text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:brightness-110"
                            onClick={() => saveEdit(c._id)}
                          >
                            Update
                          </button>
                          <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200" onClick={() => setExpandedEditId(null)}>Cancel</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {/* Inline View Details */}
                {viewedCategory?._id === c._id && (
                  <tr>
                    <td colSpan="2" className="px-6 py-4 bg-gray-50/30">
                      <div className="p-6 rounded-xl border-l-4 shadow-md bg-white animate-in slide-in-from-left-2 duration-300"
                        style={{ borderColor: THEME_COLOR }}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Viewing Details</span>
                            <h4 className="text-2xl font-bold mt-1" style={{ color: THEME_COLOR }}>{c.name}</h4>
                            <p className="text-sm text-gray-500 mt-2">
                              Created on: {new Date(c.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            className="p-1 hover:rotate-90 transition-transform duration-300"
                            style={{ color: THEME_COLOR }}
                            onClick={() => setViewedCategory(null)}
                          >
                            <FiPlus className="rotate-45" size={24} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )) : (
              <tr>
                <td colSpan="2" className="px-6 py-10 text-center text-sm text-gray-400 italic">No categories available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}