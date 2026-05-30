import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const API_URL = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ users: 0, products: 0, orders: 0, totalSales: 0, gstCollected: 0 });
  const [monthlySales, setMonthlySales] = useState([]);
  const [ordersPerMonth, setOrdersPerMonth] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [sellerRevenue, setSellerRevenue] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem("role") || "admin";

  useEffect(() => {
    const config = { headers: { Authorization: `Bearer ${token}` } };

    axios.get(`${API_URL}/admin/analytics/counts`, config).then(res => setCounts(res.data));
    axios.get(`${API_URL}/admin/analytics/monthly-sales`, config).then(res => setMonthlySales(res.data));
    axios.get(`${API_URL}/admin/analytics/orders-per-month`, config).then(res => setOrdersPerMonth(res.data));
    axios.get(`${API_URL}/admin/analytics/top-products`, config).then(res => setTopProducts(res.data));
    axios.get(`${API_URL}/admin/analytics/seller-revenue`, config).then(res => setSellerRevenue(res.data));
    axios.get(`${API_URL}/admin/analytics/payment-methods`, config).then(res => setPaymentMethods(res.data));
  }, [token]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // 1. Monthly Sales Chart Data
  const salesData = {
    labels: monthlySales.map(item => monthNames[item._id - 1]),
    datasets: [{
      label: 'Monthly Sales (₹)',
      data: monthlySales.map(item => item.totalSales),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.5)',
      tension: 0.4,
      fill: true
    }]
  };

  // 2. Orders per Month Chart Data
  const orderData = {
    labels: ordersPerMonth.map(item => monthNames[item._id - 1]),
    datasets: [{
      label: 'Orders',
      data: ordersPerMonth.map(item => item.count),
      backgroundColor: '#3b82f6',
    }]
  };

  // 3. Top Products Chart Data
  const topProductsData = {
    labels: topProducts.map(item => item.name),
    datasets: [{
      label: 'Units Sold',
      data: topProducts.map(item => item.totalSold),
      backgroundColor: ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa'],
    }]
  };

  // 4. Seller Revenue Chart Data
  const sellerData = {
    labels: sellerRevenue.map(item => item.sellerName),
    datasets: [{
      label: 'Revenue (₹)',
      data: sellerRevenue.map(item => item.revenue),
      backgroundColor: '#10b981',
    }]
  };

  // 5. Payment Methods Chart Data
  const paymentData = {
    labels: paymentMethods.map(item => item._id),
    datasets: [{
      data: paymentMethods.map(item => item.count),
      backgroundColor: ['#f97316', '#3b82f6', '#8b5cf6'],
    }]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tighter">Admin Dashboard</h1>

      {/* Seller-style Clickable KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-10">

        {/* Total Sales → Admin Sales Report */}
        <Link
          to="/admin/sales-report"
          className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px] hover:border-red-200 transition-all hover:shadow-md group"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 group-hover:text-red-400">Total Sales</p>
            <div className="text-2xl font-bold text-gray-900">
              ₹{(counts.totalSales || 0).toLocaleString()}
            </div>
          </div>
          <div className="mt-4 text-[10px] font-bold text-gray-400 group-hover:text-red-500">View Sales Report →</div>
        </Link>

        {/* GST Collected → Admin GST Report */}
        <Link
          to="/admin/gst-report"
          className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px] hover:border-red-200 transition-all hover:shadow-md group"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 group-hover:text-red-400">GST Collected</p>
            <div className="text-2xl font-bold text-gray-900">
              ₹{(counts.gstCollected || 0).toLocaleString()}
            </div>
          </div>
          <div className="mt-4 text-[10px] font-bold text-gray-400 group-hover:text-red-500">View GST Report →</div>
        </Link>

        {/* Total Orders */}
        <Link
          to={`/${role}/orders`}
          className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px] hover:border-red-200 transition-all hover:shadow-md group"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 group-hover:text-red-400">Total Orders</p>
            <div className="text-2xl font-bold text-gray-900">{counts.orders || 0}</div>
          </div>
          <div className="mt-4 text-[10px] font-bold text-gray-400 group-hover:text-red-500">View All Orders →</div>
        </Link>

        {/* Total Products */}
        <Link
          to={`/${role}/products`}
          className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px] hover:border-red-200 transition-all hover:shadow-md group"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 group-hover:text-red-400">Total Products</p>
            <div className="text-2xl font-bold text-gray-900">{counts.products || 0}</div>
          </div>
          <div className="mt-4 text-[10px] font-bold text-gray-400 group-hover:text-red-500">Manage Inventory →</div>
        </Link>

        {/* Total Users */}
        <Link
          to={`/${role}/users`}
          className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px] hover:border-red-200 transition-all hover:shadow-md group"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 group-hover:text-red-400">Total Users</p>
            <div className="text-2xl font-bold text-gray-900">{counts.users || 0}</div>
          </div>
          <div className="mt-4 text-[10px] font-bold text-gray-400 group-hover:text-red-500">Manage Users →</div>
        </Link>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Monthly Sales */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Monthly Sales</h3>
          <div className="h-64"><Line data={salesData} options={{ maintainAspectRatio: false }} /></div>
        </div>

        {/* 2. Orders per Month */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Orders per Month</h3>
          <div className="h-64"><Bar data={orderData} options={{ maintainAspectRatio: false }} /></div>
        </div>

        {/* 3. Top Products */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Top Selling Products</h3>
          <div className="h-64"><Doughnut data={topProductsData} options={{ maintainAspectRatio: false }} /></div>
        </div>

        {/* 4. Seller Revenue */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Seller-wise Revenue</h3>
          <div className="h-64"><Bar data={sellerData} options={{ indexAxis: 'y', maintainAspectRatio: false }} /></div>
        </div>

        {/* 5. Payment Methods */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Payment Method Distribution</h3>
          <div className="h-64 flex justify-center"><Pie data={paymentData} options={{ maintainAspectRatio: false }} /></div>
        </div>
      </div>

      <CategoryRequestsSection token={token} />
    </div>
  );
}



function CategoryRequestsSection({ token }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/category-requests?status=pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to load requests", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this request?`)) return;
    try {
      await axios.patch(`${API_URL}/category-requests/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(requests.filter(r => r._id !== id));
      alert(`Request ${status} successfully!`);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="mt-8 text-center">Loading requests...</div>;
  if (requests.length === 0) return null;

  return (
    <div className="mt-8 bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
        Pending Category Requests
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Seller</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Description</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map(req => (
              <tr key={req._id}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize bg-gray-50">{req.type}</td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">{req.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{req.seller?.name || 'Unknown'}</td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate" title={req.description}>{req.description || '-'}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => updateStatus(req._id, 'approved')}
                    className="text-xs font-bold text-green-600 hover:text-green-800 bg-green-50 px-2 py-1 rounded border border-green-200"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(req._id, 'rejected')}
                    className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 px-2 py-1 rounded border border-red-200"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}