// src/pages/admin/AdminProducts.jsx
import React, { useEffect, useMemo, useRef, useState, Fragment } from 'react';
import { FiEye, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight, FiArrowLeft, FiDownload, FiPlus, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sellerQuery, setSellerQuery] = useState('');
  const [sellerSuggestions, setSellerSuggestions] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Inline rows
  const [expandedViewId, setExpandedViewId] = useState(null);
  const [expandedEditId, setExpandedEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '', // New
    price: 0,
    stock: 0,
    category: '',
    subCategory: '', // New
    brand: '', // New
    visible: true,
    images: [], // New (File objects)
    replaceImages: false // New
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [allSellers, setAllSellers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    price: 0,
    stock: 0,
    categoryId: '',
    subCategoryId: '',
    brandId: '',
    description: '',
    seller: ''
  });
  const [addImageFiles, setAddImageFiles] = useState([]);

  const token = localStorage.getItem('token');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  // Load Dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, subRes, brandRes] = await Promise.all([
          fetch('http://localhost:5000/api/admin/categories', { headers }),
          fetch('http://localhost:5000/api/subcategories', { headers }),
          fetch('http://localhost:5000/api/brands', { headers })
        ]);

        const catData = await catRes.json();
        const subData = await subRes.json();
        const brandData = await brandRes.json();

        setCategories(catData.categories || []);
        // Adapt based on actual API response structure (checking if array is wrapped)
        setSubCategories(subData.subCategories || subData || []);
        setBrands(brandData.brands || brandData || []);
      } catch (err) { console.error("Dropdown load error:", err); }
    };
    fetchData();

    // Fetch all active sellers for the dropdown
    const fetchSellers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/users?role=seller', { headers });
        const data = await res.json();
        const activeOnly = (data.users || []).filter(s => s.status === 'active');
        setAllSellers(activeOnly);
      } catch (err) { console.error("Seller fetch error:", err); }
    };
    fetchSellers();
  }, [headers]);

  // Debounce seller search
  const debounceRef = useRef(null);
  useEffect(() => {
    if (!sellerQuery || selectedSeller) {
      setSellerSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const url = `http://localhost:5000/api/admin/sellers?q=${encodeURIComponent(sellerQuery)}`;
      try {
        const res = await fetch(url, { headers });
        const data = await res.json();
        setSellerSuggestions(data.sellers || []);
      } catch (err) { console.error(err); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [sellerQuery, selectedSeller, headers]);

  const load = async () => {
    const qs = new URLSearchParams();
    if (selectedSeller?._id) qs.set('seller', selectedSeller._id);
    if (categoryFilter) qs.set('category', categoryFilter);

    const url = qs.toString()
      ? `http://localhost:5000/api/admin/products?${qs.toString()}`
      : `http://localhost:5000/api/admin/products`;

    try {
      const res = await fetch(url, { headers });
      const data = await res.json();
      setProducts(data.products || []);
      setCurrentPage(1);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { load(); }, [selectedSeller, categoryFilter, headers]);

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subCategory?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase?.().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSellerQuery('');
    setSelectedSeller(null);
    setCategoryFilter('');
    setCurrentPage(1);
    toast.success('Filters cleared');
  };

  const openView = (id) => {
    setExpandedEditId(null);
    setExpandedViewId(prev => (prev === id ? null : id));
  };

  const openEdit = async (id) => {
    setExpandedViewId(null);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, { headers });
      const data = await res.json();
      if (!data.product) return;

      const p = data.product;
      setEditForm({
        name: p.name || '',
        description: p.description || '',
        price: p.price || 0,
        stock: p.stock || 0,
        category: p.category?._id || p.category || '',
        subCategory: p.subCategory?._id || p.subCategory || '',
        brand: p.brand?._id || p.brand || '', // Ensure we handle object or ID
        visible: !!p.visible,
        images: [],
        replaceImages: false
      });
      setExpandedEditId(prev => (prev === id ? null : id));
    } catch (err) { console.error(err); }
  };

  const saveEdit = async (id) => {
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('description', editForm.description);
      formData.append('price', editForm.price);
      formData.append('stock', editForm.stock);
      formData.append('category', editForm.category);
      formData.append('subCategory', editForm.subCategory);
      formData.append('brand', editForm.brand);
      formData.append('visible', editForm.visible);
      formData.append('replaceImages', editForm.replaceImages);

      // Append images
      if (editForm.images && editForm.images.length > 0) {
        Array.from(editForm.images).forEach(file => {
          formData.append('images', file);
        });
      }

      // Important: Do not set Content-Type manually with FormData, fetch does it
      const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }, // Removed Content-Type
        body: formData
      });

      const data = await res.json();
      if (data.error) return toast.error(data.error);
      toast.success('Product updated');
      setExpandedEditId(null);
      // Reload logic from existing code
      const qs = new URLSearchParams();
      if (selectedSeller?._id) qs.set('seller', selectedSeller._id);
      if (categoryFilter) qs.set('category', categoryFilter);
      const url = qs.toString() ? `http://localhost:5000/api/admin/products?${qs.toString()}` : `http://localhost:5000/api/admin/products`;
      try {
        const res = await fetch(url, { headers });
        const d = await res.json();
        setProducts(d.products || []);
      } catch (e) { }
    } catch (err) {
      toast.error('Update failed');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Deleted successfully');
        setProducts(prev => prev.filter(p => p._id !== id));
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (err) { toast.error('Delete failed'); }
  };

  const handleAddSubmit = async () => {
    if (!addForm.name.trim() || !addForm.price || !addForm.categoryId || !addForm.seller) {
      return toast.error('Name, price, category, and seller are required');
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('name', addForm.name);
      formData.append('price', addForm.price);
      formData.append('stock', addForm.stock);
      formData.append('categoryId', addForm.categoryId);
      formData.append('subCategoryId', addForm.subCategoryId);
      formData.append('brandId', addForm.brandId);
      formData.append('description', addForm.description);
      formData.append('seller', addForm.seller);

      if (addImageFiles.length > 0) {
        Array.from(addImageFiles).forEach(file => {
          formData.append('images', file);
        });
      }

      const res = await fetch(`http://localhost:5000/api/admin/products`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (data.error) return toast.error(data.error);
      
      toast.success('Product added successfully');
      setShowAddModal(false);
      setAddForm({
        name: '', price: 0, stock: 0, categoryId: '',
        subCategoryId: '', brandId: '', description: '', seller: ''
      });
      setAddImageFiles([]);
      load();
    } catch (err) {
      toast.error('Creation failed');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom styles for icons
  const iconStyle = "transition-colors duration-200 text-[#ff5252] hover:text-[#e53935]";

  const exportToSystemReportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Filtered Products');

      worksheet.columns = [
        { header: 'Product Name', key: 'name', width: 35 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'SubCategory', key: 'subCategory', width: 20 },
        { header: 'Brand', key: 'brand', width: 20 },
        { header: 'Seller', key: 'seller', width: 25 },
        { header: 'Price (₹)', key: 'price', width: 15 },
        { header: 'Stock', key: 'stock', width: 10 },
        { header: 'Added Date', key: 'date', width: 15 }
      ];

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };

      filteredProducts.forEach(p => {
        worksheet.addRow({
          name: p.name,
          category: p.category?.name || categories.find(c => c._id === p.category)?.name || '-',
          subCategory: p.subCategory?.name || subCategories.find(s => s._id === p.subCategory)?.name || '-',
          brand: p.brand?.name || brands.find(b => b._id === p.brand)?.name || '-',
          seller: p.seller?.name || '-',
          price: p.price,
          stock: p.stock,
          date: new Date(p.createdAt).toLocaleDateString()
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `admin_products_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Excel Report downloaded successfully!');
    } catch (error) {
      console.error('Error generating Excel report:', error);
      toast.error('Failed to generate Excel report');
    }
  };

  return (

    <div className="bg-white shadow rounded-lg p-6">

      {/* BACK BUTTON SECTION */}
            <div className="mb-6">
              <button 
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
              >
                <FiArrowLeft size={20} />
                <span>Back to Dashboard</span>
              </button>
            </div>

      <div className="flex flex-col mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xl font-bold text-gray-900">Manage products</h3>
          <button
            onClick={exportToSystemReportExcel}
            className="flex items-center gap-2 border-2 border-[#ff5252] text-[#ff5252] px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#ff5252] hover:text-white transition-all shadow-sm active:scale-95 bg-white shrink-0"
          >
            <FiDownload /> Excel Report
          </button>
          {/* <button
            onClick={() => setShowAddModal(true)}
            style={{ backgroundColor: '#ff5252' }}
            className="flex items-center gap-2 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-md active:scale-95 shrink-0"
          >
            <FiPlus className="stroke-[3px]" /> Add New Product
          </button> */}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px] max-w-[200px]">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Search Products</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-3.5" />
              <input
                type="text"
                placeholder="Name, subcat..."
                className="pl-9 pr-3 py-1.5 w-full border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#ff5252] outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 min-w-[180px] max-w-[200px] relative">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Seller</label>
            <input
              className="block w-full border border-gray-200 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-[#ff5252] text-xs transition-all"
              placeholder="Type seller name"
              value={sellerQuery}
              onChange={e => {
                setSellerQuery(e.target.value);
                setSelectedSeller(null);
              }}
            />
            {selectedSeller && (
              <button 
                onClick={() => { setSelectedSeller(null); setSellerQuery(''); }} 
                className="absolute right-2 top-7 text-[10px] text-[#ff5252] font-black uppercase hover:text-[#e53935]"
              >
                <FiX />
              </button>
            )}
            {sellerSuggestions.length > 0 && !selectedSeller && (
              <div className="absolute z-20 mt-1 w-full bg-white shadow-xl border rounded-md py-1 max-h-40 overflow-auto border-gray-100">
                {sellerSuggestions.map(s => (
                  <div key={s._id} className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0" onClick={() => { setSelectedSeller(s); setSellerQuery(s.name); setSellerSuggestions([]); }}>
                    <p className="text-xs font-semibold text-gray-700">{s.name}</p>
                    <p className="text-[10px] text-gray-400">{s.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-[150px] max-w-[180px]">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
            <select
              className="block w-full border border-gray-200 rounded-lg py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-[#ff5252] text-xs bg-white transition-all cursor-pointer"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-50 transition-all active:scale-95"
          >
            Clear
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{ backgroundColor: '#ff5252' }}
            className="flex items-center gap-1.5 text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight hover:brightness-110 transition-all shadow-sm active:scale-95 shrink-0 ml-auto"
          >
            <FiPlus className="stroke-[3px]" /> New Product
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Seller</th>
              {/* <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Brand</th> */}
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {paginatedProducts.map(p => (
              <Fragment key={p._id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 font-semibold text-gray-700">{Number(p.price).toLocaleString()}</td>
                  <td className="px-6 py-4">{p.stock}</td>
                  <td className="px-6 py-4 text-gray-500">{p.seller?.name || '-'}</td>
                  {/* <td className="px-6 py-4 text-gray-500">{p.brand?.name || (typeof p.brand === 'string' ? p.brand : '-')}</td> */}
                  {/* td className="px-6 py-4 text-gray-500">{p.category?.name || p.category || '-'}</td> */}
                  <td className="px-6 py-4 text-right space-x-4">
                    <button className={iconStyle} onClick={() => openView(p._id)} title="View"><FiEye size={20} /></button>
                    <button className={iconStyle} onClick={() => openEdit(p._id)} title="Edit"><FiEdit2 size={18} /></button>
                    <button className={iconStyle} onClick={() => handleDelete(p._id)} title="Delete"><FiTrash2 size={19} /></button>
                  </td>
                </tr>

                {expandedViewId === p._id && (
                  <tr className="bg-red-50/20">
                    <td colSpan={6} className="px-6 py-4 border-l-4 border-[#ff5252]">
                      <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div><span className="font-bold uppercase text-gray-400">Subcat:</span> {p.subCategory?.name || '-'}</div>
                          {/* <div><span className="font-bold uppercase text-gray-400">Brand:</span> {p.brand?.name || '-'}</div> */}
                          <div>
                            <span className="font-bold uppercase text-gray-400">Brand:</span>{' '}
                            {p.brand?.name || brands.find(b => b._id === p.brand)?.name || '-'}
                          </div>
                          {/* <div><span className="font-bold uppercase text-gray-400">Visibility:</span> {p.visible ? 'Public' : 'Hidden'}</div> */}
                          <div><span className="font-bold uppercase text-gray-400">Created:</span> {new Date(p.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="text-xs">
                          <span className="font-bold uppercase text-gray-400 block mb-1">Description:</span>
                          <p className="text-gray-700 whitespace-pre-wrap">{p.description || "No description available."}</p>
                        </div>
                        {p.images && p.images.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {p.images.map((img, i) => (
                              <img key={i} src={`http://localhost:5000${img}`} alt="" className="w-16 h-16 object-cover rounded border" />
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                {expandedEditId === p._id && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="px-6 py-5 border-l-4 border-[#ff5252]">
                      <div className="grid grid-cols-1 gap-6 max-w-5xl">
                        {/* Top Row: Name, Price, Stock */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Product Name</label>
                            <input className="border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-[#ff5252] outline-none" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Price</label>
                            <input className="border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-[#ff5252] outline-none" type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Stock Units</label>
                            <input className="border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-[#ff5252] outline-none" type="number" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: Number(e.target.value) })} />
                          </div>
                        </div>

                        {/* Middle Row: Category, SubCategory, Brand */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                            <select className="border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-[#ff5252] outline-none" value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}>
                              <option value="">Select Category</option>
                              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">SubCategory</label>
                            <select className="border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-[#ff5252] outline-none" value={editForm.subCategory} onChange={e => setEditForm({ ...editForm, subCategory: e.target.value })}>
                              <option value="">Select SubCategory</option>
                              {subCategories.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Brand</label>
                            <select className="border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-[#ff5252] outline-none" value={editForm.brand} onChange={e => setEditForm({ ...editForm, brand: e.target.value })}>
                              <option value="">Select Brand</option>
                              {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                          <textarea className="border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-[#ff5252] outline-none h-20" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                        </div>

                        {/* Image Upload */}
                        <div className="flex flex-col gap-1 border border-dashed border-gray-300 p-3 rounded">
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-2">Update Images</label>
                          <input type="file" multiple onChange={e => setEditForm({ ...editForm, images: e.target.files })} className="text-sm text-gray-600 mb-2" />
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="replaceImages" checked={editForm.replaceImages} onChange={e => setEditForm({ ...editForm, replaceImages: e.target.checked })} />
                            <label htmlFor="replaceImages" className="text-xs text-gray-700">Replace existing images completely?</label>
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex space-x-2 justify-end">
                          <button onClick={() => setExpandedEditId(null)} className="bg-gray-200 text-gray-600 px-5 py-2 rounded text-xs font-bold uppercase hover:bg-gray-300">Cancel</button>
                          <button onClick={() => saveEdit(p._id)} className="bg-[#ff5252] text-white px-5 py-2 rounded text-xs font-bold uppercase hover:bg-[#e53935]">Save Changes</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 border-t pt-4">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900">{Math.min(filteredProducts.length, currentPage * itemsPerPage)}</span> of <span className="font-medium text-gray-900">{filteredProducts.length}</span> products
          </p>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-30 hover:bg-gray-50 text-[#ff5252]"
            >
              <FiChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold text-gray-700">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-30 hover:bg-gray-50 text-[#ff5252]"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center p-4 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg w-full max-w-[720px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Add New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-300 hover:text-gray-600 p-1 transition-colors">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-md p-2.5 text-sm text-gray-800 focus:ring-1 focus:ring-[#ff5252] outline-none transition-all placeholder:text-gray-300"
                    placeholder="Product name"
                    value={addForm.name}
                    onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Seller</label>
                  <select
                    className="w-full border border-gray-200 rounded-md p-2.5 text-sm text-gray-800 focus:ring-1 focus:ring-[#ff5252] outline-none transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_10px_center] bg-white"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '16px' }}
                    value={addForm.seller}
                    onChange={e => setAddForm({ ...addForm, seller: e.target.value })}
                  >
                    <option value="">Choose Seller</option>
                    {allSellers.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Price (₹)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-md p-2.5 text-sm text-gray-800 focus:ring-1 focus:ring-[#ff5252] outline-none transition-all"
                    value={addForm.price}
                    onChange={e => setAddForm({ ...addForm, price: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Stock</label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-md p-2.5 text-sm text-gray-800 focus:ring-1 focus:ring-[#ff5252] outline-none transition-all"
                    value={addForm.stock}
                    onChange={e => setAddForm({ ...addForm, stock: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Category</label>
                  <select
                    className="w-full border border-gray-200 rounded-md p-2.5 text-sm text-gray-800 focus:ring-1 focus:ring-[#ff5252] outline-none transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_10px_center] bg-white"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '16px' }}
                    value={addForm.categoryId}
                    onChange={e => setAddForm({ ...addForm, categoryId: e.target.value, subCategoryId: '' })}
                  >
                    <option value="">Choose Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">SubCategory</label>
                  <select
                    className="w-full border border-gray-200 rounded-md p-2.5 text-sm text-gray-800 focus:ring-1 focus:ring-[#ff5252] outline-none transition-all disabled:bg-gray-50 appearance-none bg-no-repeat bg-[right_10px_center] bg-white"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '16px' }}
                    value={addForm.subCategoryId}
                    disabled={!addForm.categoryId}
                    onChange={e => setAddForm({ ...addForm, subCategoryId: e.target.value })}
                  >
                    <option value="">Choose SubCategory</option>
                    {subCategories.filter(s => (s.category?._id || s.category) === addForm.categoryId).map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Brand</label>
                  <select
                    className="w-full border border-gray-200 rounded-md p-2.5 text-sm text-gray-800 focus:ring-1 focus:ring-[#ff5252] outline-none transition-all appearance-none bg-no-repeat bg-[right_10px_center] bg-white"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '16px' }}
                    value={addForm.brandId}
                    onChange={e => setAddForm({ ...addForm, brandId: e.target.value })}
                  >
                    <option value="">Select a Brand</option>
                    {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Product Images</label>
                  <div className="flex items-center gap-4 py-1">
                    <label className="cursor-pointer bg-[#eceff1] hover:bg-[#cfd8dc] text-gray-700 px-4 py-2 rounded-md text-xs font-bold transition-colors">
                      Choose Files
                      <input type="file" multiple className="hidden" onChange={e => setAddImageFiles(e.target.files)} />
                    </label>
                    <span className="text-xs text-gray-400 truncate max-w-[150px]">
                      {addImageFiles.length > 0 ? `${addImageFiles.length} files selected` : 'No file chosen'}
                    </span>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-200 rounded-md p-2.5 text-sm text-gray-800 focus:ring-1 focus:ring-[#ff5252] outline-none transition-all resize-none"
                    value={addForm.description}
                    onChange={e => setAddForm({ ...addForm, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#f8f9fa] flex justify-end gap-3 border-t border-gray-100">
              <button
                className="px-6 py-2 bg-[#eceff1] text-gray-500 rounded-md font-bold text-xs uppercase tracking-tight hover:bg-[#cfd8dc] hover:text-gray-700 transition-all font-sans"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-[#ff5252] text-white rounded-md font-bold text-xs uppercase tracking-tight hover:bg-[#ff1744] transition-all disabled:opacity-50 font-sans"
                onClick={handleAddSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
