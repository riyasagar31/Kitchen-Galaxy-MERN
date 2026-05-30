import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

export default function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Analytics State
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    newOrders: 0,
    gstCollected: 0,
    statusCounts: {}
  });

  const [showModal, setShowModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ type: 'category', name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetching real-time data from both analytics and direct orders/products to ensure accuracy
        const [statsRes, productsRes, ordersRes] = await Promise.all([
          axios.get(`${API_URL}/seller/analytics`, { headers }).catch(() => ({ data: {} })),
          axios.get(`${API_URL}/seller/products`, { headers }).catch(() => ({ data: { products: [] } })),
          axios.get(`${API_URL}/seller-orders/orders`, { headers }).catch(() => ({ data: [] }))
        ]);

        // Dynamically calculate order count and revenue if the analytics endpoint is lagging
        // Requirement: Only include completed or delivered orders in sales and GST calculations
        const dynamicOrders = ordersRes.data.length;
        const deliveredOrders = ordersRes.data.filter(order => order.status === 'Delivered');

        const dynamicRevenue = deliveredOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
        const dynamicGstCollected = deliveredOrders.reduce((acc, curr) => {
          // In listSellerOrders, we return pre-calculated myItems and totalAmount but not totalGst
          // Let's recalculate from items for safety
          const itemGst = curr.items?.reduce((sum, item) => sum + (item.gstAmount || 0), 0) || 0;
          return acc + itemGst;
        }, 0);

        const pendingOrders = ordersRes.data.filter(order => order.status === 'Pending').length;

        setStats({
          totalRevenue: dynamicRevenue || statsRes.data.totalRevenue || 0,
          totalOrders: dynamicOrders || statsRes.data.totalOrders || 0,
          totalProducts: productsRes.data.products?.length || statsRes.data.totalProducts || 0,
          newOrders: pendingOrders || 0,
          gstCollected: dynamicGstCollected || statsRes.data.gstCollected || 0,
          statusCounts: statsRes.data.statusCounts || {}
        });

      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/category-requests`, requestForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Request submitted successfully!");
      setShowModal(false);
      setRequestForm({ type: 'category', name: '', description: '' });
    } catch (err) {
      alert("Failed to submit request.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-500 font-medium">Loading your dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Clickable Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 mt-6">

        {/* Total Revenue Card (Clickable to Sales Report) */}
        <Link
          to="/seller/sales-report"
          className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px] hover:border-red-200 transition-all hover:shadow-md group"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 group-hover:text-red-400">Total Sales</p>
            <div className="text-3xl font-bold text-gray-900">
              ₹{(stats.totalRevenue || 0).toLocaleString()}
            </div>
          </div>
          <div className="mt-4 text-[10px] font-bold text-gray-400 group-hover:text-red-500">View Sales Report →</div>
        </Link>

        {/* Orders Placed Card (Clickable) */}
        <Link
          to="/seller/orders"
          className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px] hover:border-red-200 transition-all hover:shadow-md group"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 group-hover:text-red-400">Total Orders</p>
            <div className="text-3xl font-bold text-gray-900">{stats.totalOrders}</div>
          </div>
          <div className="mt-4 text-[10px] font-bold text-gray-400 group-hover:text-red-500">View All Orders →</div>
        </Link>

        {/* GST Collected Card (Clickable to GST Report) */}
        <Link
          to="/seller/gst-report"
          className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px] hover:border-red-200 transition-all hover:shadow-md group"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 group-hover:text-red-400">GST Collected</p>
            <div className="text-3xl font-bold text-gray-900">
              ₹{(stats.gstCollected || 0).toLocaleString()}
            </div>
          </div>
          <div className="mt-4 text-[10px] font-bold text-gray-400 group-hover:text-red-500">View GST Report →</div>
        </Link>

        {/* New Orders Card (Clickable) */}
        <Link
          to="/seller/orders?status=Pending"
          className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px] hover:border-red-200 transition-all hover:shadow-md group"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 group-hover:text-red-400">New Orders</p>
            <div className={`text-4xl font-bold ${stats.newOrders > 0 ? 'text-gray-900 group-hover:text-red-500' : 'text-gray-300'} transition-colors tracking-tighter`}>
              {stats.newOrders}
            </div>
          </div>
          <div className="mt-4 text-[10px] font-bold text-gray-400 group-hover:text-red-500 flex items-center gap-2">
            {stats.newOrders > 0 ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                Pending Processing →
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                All caught up →
              </>
            )}
          </div>
        </Link>

        {/* Active Products Card (Clickable) */}
        <Link
          to="/seller/products"
          className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px] hover:border-red-200 transition-all hover:shadow-md group"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 group-hover:text-red-400">Total Products</p>
            <div className="text-3xl font-bold text-gray-900">{stats.totalProducts}</div>
          </div>
          <div className="mt-4 text-[10px] font-bold text-gray-400 group-hover:text-red-500">Manage Inventory →</div>
        </Link>

      </div>

      {/* Welcome Header Section */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tighter mb-1">
            Hello, <span className="text-red-500">{user?.name}!</span>
          </h2>
          <p className="text-gray-500 font-medium">Your kitchen empire is thriving. Here's what's happening today.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#ff5252] text-white px-10 py-4 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-red-500 transition-all shadow-xl active:scale-95"
        >
          + Request Category
        </button>
      </div>

      {/* Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 uppercase">New Request</h3>
            <p className="text-sm text-gray-500 mb-8 font-medium">Can't find a category? Ask our admin to add it.</p>
            <form onSubmit={handleRequestSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Request Type</label>
                <select className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold bg-gray-50 focus:bg-white focus:border-red-400 outline-none transition-all" value={requestForm.type} onChange={(e) => setRequestForm({ ...requestForm, type: e.target.value })}>
                  <option value="category">New Category</option>
                  <option value="subcategory">New Sub-Category</option>
                  <option value="brand">New Brand</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Name</label>
                <input type="text" required placeholder="e.g. Air Fryers" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-red-400 outline-none transition-all" value={requestForm.name} onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                <textarea rows="3" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-red-400 outline-none transition-all" placeholder="Why is this category needed?" value={requestForm.description} onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}></textarea>
              </div>
              <div className="pt-4">
                <button type="submit" disabled={submitting} className="w-full bg-[#ff5252] text-white font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-red-500 transition-all disabled:bg-gray-300 shadow-lg">
                  {submitting ? 'Sending...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}