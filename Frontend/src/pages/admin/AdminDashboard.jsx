import { useEffect, useState } from 'react';
import MetricCard from '../../components/MetricCard.jsx';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [data, setData] = useState({ kpis: {}, last7: [], byStatus: {} });
  const token = localStorage.getItem('token');
  const role = localStorage.getItem("role") || "admin";

  useEffect(() => {
    axios.get(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, [token]);

  const { totalSales = 0, totalOrders = 0, totalProducts = 0, totalUsers = 0 } = data.kpis || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* KPI Cards - Clickable wrapper */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="cursor-default">
          <MetricCard label="Total Sales" value={`₹${totalSales}`} secondary="Last 7 days" />
        </div>
        
        <Link to={`/${role}/orders`} className="block transition-transform hover:scale-105">
          <MetricCard label="Total Orders" value={totalOrders} />
        </Link>

        <Link to={`/${role}/products`} className="block transition-transform hover:scale-105">
          <MetricCard label="Total Products" value={totalProducts} />
        </Link>

        <Link to={`/${role}/users`} className="block transition-transform hover:scale-105">
          <MetricCard label="Total Users" value={totalUsers} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Orders by Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Orders by Status</h3>
          <ul className="divide-y divide-gray-200">
            {Object.entries(data.byStatus || {}).length > 0 ? (
              Object.entries(data.byStatus).map(([st, n]) => (
                <li key={st} className="py-3 flex justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">{st}</span>
                  <span className="text-sm text-gray-900 font-semibold">{n}</span>
                </li>
              ))
            ) : (
              <li className="py-3 text-sm text-gray-500">No orders found.</li>
            )}
          </ul>
        </div>

        {/* Sales Last 7 Days */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales (Last 7 Days)</h3>
          <ul className="divide-y divide-gray-200">
            {data.last7?.length > 0 ? (
              data.last7.map(row => (
                <li key={row._id} className="py-3 flex justify-between">
                  <span className="text-sm font-medium text-gray-700">{row._id}</span>
                  <span className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-900">₹{row.sales}</span>
                    <span className="ml-2">({row.orders} orders)</span>
                  </span>
                </li>
              ))
            ) : (
              <li className="py-3 text-sm text-gray-500">No sales data.</li>
            )}
          </ul>
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