import { useEffect, useMemo, useState } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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

  // Pagination Calculation
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.categoryId) {
      return alert('Name and Category are required');
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
        toast.success("Updated successfully");
      } else {
        await axios.post(`${API_URL}/seller/products`, formData, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Created successfully");
      }

      handleCancel();
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
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
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  const handleCancel = () => {
    setShowCreate(false);
    setEditId(null);
    setForm({ name: '', price: 0, stock: 0, categoryId: '', subCategoryId: '', brandId: '', description: '' });
    setImageFile(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Manage My Products</h3>
        <button
          className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition"
          onClick={() => { setEditId(null); setShowCreate(true); }}
        >
          <FiPlus className="mr-2" /> New Product
        </button>
      </div>

      {/* Main Product Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No products found.</td>
              </tr>
            ) : paginatedProducts.map(p => (
              <tr key={p._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={`http://localhost:5000${p.images?.[0] || p.image}`}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover border"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.brand?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">₹{Number(p.price).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => setViewProduct(p)} className="text-primary hover:text-primary-hover mr-4" title="View">
                    <FiEye size={18} />
                  </button>
                  <button onClick={() => openEdit(p)} className="text-primary hover:text-primary-hover mr-4" title="Edit">
                    <FiEdit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="text-red-600 hover:text-red-900" title="Delete">
                    <FiTrash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button onClick={() => setCurrentPage(c => Math.max(1, c - 1))} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Previous</button>
              <button onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Next</button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </p>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button onClick={() => setCurrentPage(c => Math.max(1, c - 1))} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <FiChevronLeft />
                </button>
                <button onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <FiChevronRight />
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{editId ? 'Edit Product' : 'Create Product'}</h3>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-500"><FiX size={24} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">Brand</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" value={form.brandId} onChange={e => setForm({ ...form, brandId: e.target.value })}>
                  <option value="">Select brand</option>
                  {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value, subCategoryId: '' })}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">SubCategory</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border disabled:bg-gray-100"
                  value={form.subCategoryId}
                  disabled={!form.categoryId}
                  onChange={e => setForm({ ...form, subCategoryId: e.target.value })}
                >
                  <option value="">Select subcategory</option>
                  {subCategories.filter(s => (s.category?._id || s.category) === form.categoryId).map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Product Image</label>
                <input type="file" className="mt-1 block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-primary-hover hover:file:bg-indigo-100" onChange={e => setImageFile(e.target.files[0])} />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300" onClick={handleCancel}>Cancel</button>
              <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:bg-indigo-400" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (editId ? 'Save Changes' : 'Create Product')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Product Modal (Restored Pattern) */}
      {viewProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Product Details</h3>
              <button onClick={() => setViewProduct(null)} className="text-gray-400 hover:text-gray-500"><FiX size={24} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <img src={`http://localhost:5000${viewProduct.images?.[0] || viewProduct.image}`} className="w-full h-64 object-cover rounded-md border" alt="" />
              </div>
              <div className="col-span-1 space-y-4">
                <div><label className="block text-xs font-bold text-gray-400 uppercase">Name</label><p className="text-lg font-semibold text-gray-900">{viewProduct.name}</p></div>
                <div><label className="block text-xs font-bold text-gray-400 uppercase">Price</label><p className="text-lg text-primary font-bold">₹{viewProduct.price}</p></div>
                <div><label className="block text-xs font-bold text-gray-400 uppercase">Brand</label><p className="text-gray-900">{viewProduct.brand?.name || '-'}</p></div>
                <div><label className="block text-xs font-bold text-gray-400 uppercase">Stock</label><p className="text-gray-900">{viewProduct.stock} units</p></div>
                <div><label className="block text-xs font-bold text-gray-400 uppercase">Category</label><p className="text-gray-900">{viewProduct.category?.name} {viewProduct.subCategory ? `> ${viewProduct.subCategory.name}` : ''}</p></div>
                <div><label className="block text-xs font-bold text-gray-400 uppercase">Description</label><p className="text-sm text-gray-600 leading-relaxed">{viewProduct.description || 'No description provided.'}</p></div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300" onClick={() => setViewProduct(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}