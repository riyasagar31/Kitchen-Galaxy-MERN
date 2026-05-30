import { useEffect, useMemo, useState } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiEye, FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

export default function ManageProduct() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  // Form handling
  const [form, setForm] = useState({
    name: '', price: 0, stock: 0, categoryId: '',
    subCategoryId: '', brandId: '', description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [errors, setErrors] = useState({ name: false, categoryId: false });
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const token = localStorage.getItem('token');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const load = async () => {
    try {
      const [pRes, cRes, sRes, bRes] = await Promise.all([
        axios.get(`${API_URL}/seller/products`, { headers }),
        axios.get(`${API_URL}/categories`, { headers }),
        axios.get(`${API_URL}/subcategories`, { headers }),
        axios.get(`${API_URL}/brands`, { headers })
      ]);
      setProducts(pRes.data.products || []);
      setCategories(cRes.data.categories || []);
      setSubCategories(sRes.data.subCategories || []);
      setBrands(bRes.data || []);
    } catch (err) {
      console.error("Failed to load", err);
      toast.error("Failed to load data");
    }
  };

  useEffect(() => { load(); }, []);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subCategory?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Pagination Calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedItems = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async () => {
    const newErrors = {
      name: !form.name.trim(),
      categoryId: !form.categoryId
    };

    if (newErrors.name || newErrors.categoryId) {
      setErrors(newErrors);
      if (newErrors.name && newErrors.categoryId) return toast.error('Name and Category are required');
      if (newErrors.name) return toast.error('Name is required');
      if (newErrors.categoryId) return toast.error('Category is required');
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('stock', form.stock);
      formData.append('categoryId', form.categoryId);
      formData.append('brandId', form.brandId);
      formData.append('description', form.description);
      if (form.subCategoryId) formData.append('subCategoryId', form.subCategoryId);
      if (imageFile) formData.append('image', imageFile);

      if (editId) {
        await axios.patch(`${API_URL}/seller/products/${editId}`, formData, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Product updated successfully");
      } else {
        await axios.post(`${API_URL}/seller/products`, formData, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Product added successfully");
      }

      handleCancel();
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (p) => {
    setEditId(p._id);
    setForm({
      name: p.name,
      price: p.price,
      stock: p.stock,
      categoryId: p.category?._id || p.category || '',
      subCategoryId: p.subCategory?._id || p.subCategory || '',
      brandId: p.brand?._id || p.brand || '',
      description: p.description || ''
    });
    setShowCreate(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await axios.delete(`${API_URL}/seller/products/${id}`, { headers });
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success("Deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const handleCancel = () => {
    setShowCreate(false);
    setEditId(null);
    setForm({ name: '', price: 0, stock: 0, categoryId: '', subCategoryId: '', brandId: '', description: '' });
    setImageFile(null);
    setErrors({ name: false, categoryId: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h3 className="text-2xl font-bold text-gray-800">Manage My Products</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, brand, category..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[#ff5252] outline-none transition-all shadow-sm bg-white"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button
            className="flex items-center px-6 py-2 bg-[#ff5252] text-white rounded-xl hover:bg-[#ff1744] transition font-bold text-sm shadow-md active:scale-95 whitespace-nowrap w-full sm:w-auto"
            onClick={() => { setEditId(null); setShowCreate(true); }}
          >
            <FiPlus className="mr-2" strokeWidth={3} /> New Product
          </button>
        </div>
      </div>

      {/* Main Product Table */}
      <div className="bg-white shadow-sm overflow-hidden rounded-md border border-gray-100">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-[#f8f9fa]">
            <tr>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">IMAGE</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">NAME</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">BRAND</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">PRICE (₹)</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">STOCK</th>
              <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-400 italic">
                  {searchQuery ? `No products matching "${searchQuery}"` : "No products found."}
                </td>
              </tr>
            ) : paginatedItems.map(p => (
              <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                    <img
                      src={`http://localhost:5000${p.images?.[0] || p.image}`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{p.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{p.brand?.name || '-'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">₹{Number(p.price).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                  <button onClick={() => setViewProduct(p)} className="text-[#ff5252] hover:animate-pulse transition-all p-1" title="View">
                    <FiEye size={18} />
                  </button>
                  <button onClick={() => openEdit(p)} className="text-[#ff5252] hover:animate-pulse transition-all p-1" title="Edit">
                    <FiEdit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="text-[#ff5252] hover:text-red-700 transition-all p-1" title="Delete">
                    <FiTrash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <p className="text-xs text-gray-400 font-medium tracking-tight">
              Showing <span className="text-gray-700 font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="text-gray-700 font-bold">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of <span className="text-gray-700 font-bold">{filteredProducts.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-gray-200 disabled:opacity-30 hover:bg-white text-[#ff5252] transition-all bg-white shadow-xs"
              >
                <FiChevronLeft size={16} />
              </button>
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest px-2">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-gray-200 disabled:opacity-30 hover:bg-white text-[#ff5252] transition-all bg-white shadow-xs"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal - Re-Designed to Match Screenshot */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center p-4 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg w-full max-w-[720px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">{editId ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={handleCancel} className="text-gray-300 hover:text-gray-600 p-1 transition-colors">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Row 1 */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Name</label>
                <input
                  type="text"
                  className={`w-full border ${errors.name ? 'border-red-500 bg-red-50/10' : 'border-gray-200'} rounded-md p-2.5 text-sm text-gray-800 focus:ring-1 ${errors.name ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-[#ff5252] focus:border-[#ff5252]'} outline-none transition-all placeholder:text-gray-300`}
                  value={form.name}
                  onChange={e => {
                    setForm({ ...form, name: e.target.value });
                    if (errors.name) setErrors(prev => ({ ...prev, name: false }));
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Price (₹)</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-md p-2.5 text-sm text-gray-800 focus:ring-1 focus:ring-[#ff5252] focus:border-[#ff5252] outline-none transition-all"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                />
              </div>

              {/* Row 2 */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Stock</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-md p-2.5 text-sm text-gray-800 focus:ring-1 focus:ring-[#ff5252] focus:border-[#ff5252] outline-none transition-all"
                  value={form.stock}
                  onChange={e => setForm({ ...form, stock: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Category</label>
                <select
                  className={`w-full border ${errors.categoryId ? 'border-red-500 bg-red-50/10' : 'border-gray-200'} rounded-md p-2.5 text-sm text-gray-800 focus:ring-1 ${errors.categoryId ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-[#ff5252] focus:border-[#ff5252]'} outline-none transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_10px_center]`}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '16px' }}
                  value={form.categoryId}
                  onChange={e => {
                    setForm({ ...form, categoryId: e.target.value, subCategoryId: '' });
                    if (errors.categoryId) setErrors(prev => ({ ...prev, categoryId: false }));
                  }}
                >
                  <option value="">Choose Category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              {/* Row 3 */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">SubCategory</label>
                <select
                  className="w-full border border-gray-200 rounded-md p-2.5 text-sm text-gray-800 focus:ring-1 focus:ring-[#ff5252] focus:border-[#ff5252] outline-none transition-all disabled:bg-gray-50 appearance-none bg-no-repeat bg-[right_10px_center]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '16px' }}
                  value={form.subCategoryId}
                  disabled={!form.categoryId}
                  onChange={e => setForm({ ...form, subCategoryId: e.target.value })}
                >
                  <option value="">Choose SubCategory</option>
                  {subCategories.filter(s => (s.category?._id || s.category) === form.categoryId).map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Product Image</label>
                <div className="flex items-center gap-4 py-1">
                  <label className="cursor-pointer bg-[#eceff1] hover:bg-[#cfd8dc] text-gray-700 px-4 py-2 rounded-md text-xs font-bold transition-colors">
                    Choose File
                    <input type="file" className="hidden" onChange={e => setImageFile(e.target.files[0])} />
                  </label>
                  <span className="text-xs text-gray-400 truncate max-w-[150px]">
                    {imageFile ? imageFile.name : 'No file chosen'}
                  </span>
                </div>
              </div>

              {/* Row 4 - Keeping Brand as a field but styled differently */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Brand</label>
                <select
                  className="w-full border border-gray-200 rounded-md p-2.5 text-sm text-gray-800 focus:ring-1 focus:ring-[#ff5252] focus:border-[#ff5252] outline-none transition-all appearance-none bg-no-repeat bg-[right_10px_center]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '16px' }}
                  value={form.brandId}
                  onChange={e => setForm({ ...form, brandId: e.target.value })}
                >
                  <option value="">Select a Brand</option>
                  {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-700">Description</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-200 rounded-md p-2.5 text-sm text-gray-800 focus:ring-1 focus:ring-[#ff5252] focus:border-[#ff5252] outline-none transition-all resize-none"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-[#f8f9fa] flex justify-end gap-3 border-t border-gray-100">
              <button
                className="px-6 py-2 bg-[#eceff1] text-gray-500 rounded-md font-bold text-xs uppercase tracking-tight hover:bg-[#cfd8dc] hover:text-gray-700 transition-all"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-[#ff5252] text-white rounded-md font-bold text-xs uppercase tracking-tight hover:bg-[#ff1744] transition-all disabled:opacity-50"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (editId ? 'Saving...' : 'Adding...') : (editId ? 'Save Changes' : 'Add Product')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Product Modal - Simplified */}
      {viewProduct && (
        <div className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center p-4 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Product Preview</h3>
              <button onClick={() => setViewProduct(null)} className="text-gray-300 hover:text-gray-600 p-1">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2 aspect-square rounded-md overflow-hidden bg-gray-50 border border-gray-100">
                <img
                  src={`http://localhost:5000${viewProduct.images?.[0] || viewProduct.image}`}
                  className="w-full h-full object-cover"
                  alt={viewProduct.name}
                />
              </div>

              <div className="w-full md:w-1/2 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{viewProduct.name}</h2>
                  <p className="text-[#ff5252] text-lg font-bold mt-1">₹{viewProduct.price.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-2 rounded-md">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Stock</p>
                    <p className="text-sm font-bold text-gray-700">{viewProduct.stock} units</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-md">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Brand</p>
                    <p className="text-sm font-bold text-gray-700">{viewProduct.brand?.name || 'Generic'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Category Paths</p>
                  <p className="text-sm text-gray-600 font-medium">
                    {viewProduct.category?.name} {viewProduct.subCategory?.name && `→ ${viewProduct.subCategory.name}`}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Description</p>
                  <p className="text-sm text-gray-500 leading-relaxed italic">
                    {viewProduct.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#f8f9fa] flex justify-end">
              <button
                onClick={() => setViewProduct(null)}
                className="px-8 py-2 bg-[#ff5252] text-white rounded-md font-bold text-xs uppercase tracking-tight hover:bg-[#ff1744] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
