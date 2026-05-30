import React, { useState, useEffect, useMemo } from 'react';
import { brandService } from '../../services/brandService';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch,
  FiChevronLeft, FiChevronRight, FiArrowLeft, FiUpload
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function AdminBrands() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
    logo: null
  });
  const [preview, setPreview] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const data = await brandService.getBrands();
      setBrands(data);
    } catch (err) {
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  // Search and Filter Logic
  const filteredBrands = useMemo(() => {
    return brands.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === '' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [brands, searchQuery, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    if (formData.description) data.append('description', formData.description);
    data.append('status', formData.status);
    if (formData.logo instanceof File) {
      data.append('logo', formData.logo);
    }

    try {
      if (editingBrand) {
        await brandService.updateBrand(editingBrand._id, data);
        toast.success("Brand updated!");
      } else {
        await brandService.createBrand(data);
        toast.success("Brand created!");
      }
      closeModal();
      fetchBrands();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this brand?")) {
      try {
        await brandService.deleteBrand(id);
        toast.success("Brand deleted");
        fetchBrands();
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBrand(null);
    setFormData({ name: '', description: '', status: 'active', logo: null });
    setPreview(null);
  };

  const openEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      status: brand.status,
      logo: null
    });
    setPreview(brand.logo ? `http://localhost:5000${brand.logo}` : null);
    setShowModal(true);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 min-h-screen">

      {/* BACK BUTTON SECTION */}
      <div className="mb-6">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors" >
          <FiArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Header with Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Brand Management</h3>
          <p className="text-sm text-gray-500">Manage product manufacturers and labels</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search brands..."
              className="pl-10 pr-4 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#ff5252] focus:outline-none"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>

          {/* Status Filter */}
          <select
            className="border border-gray-300 rounded-md py-1.5 px-2 text-sm focus:outline-none"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#ff5252] text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-black transition-all"
          >
            <FiPlus /> Add Brand
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedBrands.length > 0 ? (
              paginatedBrands.map((brand) => (
                <tr key={brand._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center">
                      {brand.logo ? (
                        <img className="h-full w-full object-contain" src={`http://localhost:5000${brand.logo}`} alt={brand.name} />
                      ) : (
                        <span className="text-[10px] text-gray-300 font-bold uppercase">No Logo</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{brand.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${brand.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {brand.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button
                      onClick={() => openEdit(brand)}
                      className="text-[#ff5252] hover:text-black transition-colors"
                      title="Edit Brand"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(brand._id)}
                      className="text-[#ff5252] hover:text-black transition-colors"
                      title="Delete Brand"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-400">No brands found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 border-t pt-4">
          <p className="text-sm text-gray-600">
            Showing {Math.min(filteredBrands.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredBrands.length, currentPage * itemsPerPage)} of {filteredBrands.length} brands
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

      {/* MODAL OVERLAY */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{editingBrand ? 'Edit Brand' : 'Add New Brand'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Brand Name</label>
                <input
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#ff5252] outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#ff5252] outline-none"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Brand Logo</label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                    {preview ? (
                      <img src={preview} alt="Preview" className="h-full w-full object-contain" />
                    ) : (
                      <FiUpload className="text-gray-300" size={20} />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="logo-upload"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData({ ...formData, logo: file });
                        setPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  <label
                    htmlFor="logo-upload"
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-all"
                  >
                    Change Logo
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[#ff5252] text-white rounded-md text-sm font-bold hover:bg-black transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}