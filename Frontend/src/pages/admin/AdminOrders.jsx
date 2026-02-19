// src/pages/admin/AdminOrders.jsx
import { useEffect, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState('Pending');
  const token = localStorage.getItem('token');

  const load = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setOrders(data || []);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { load(); }, []);

  const startEdit = (o) => {
    setEditing(o._id);
    setStatus(o.status || 'Pending');
  };

  const saveStatus = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/orders/${editing}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (!res.ok) return alert('Error updating status');
      setEditing(null);
      load();
    } catch (err) {
      alert('Update failed');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">

      {/* BACK BUTTON SECTION */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/admin')}
             className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors" >
              <FiArrowLeft size={20} />
              <span>Back to Dashboard</span>
          </button>
        </div>

      <h3 className="text-xl font-bold text-gray-900 mb-6">All orders</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map(o => (
              <tr key={o._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{o._id.slice(-6).toUpperCase()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium">{o.user?.name || 'Unknown'}</div>
                  <div className="text-gray-500 text-xs">{o.user?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{o.totalAmount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${o.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      o.status === 'Running' ? 'bg-blue-100 text-blue-800' :
                        o.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-primary hover:text-primary-hover" onClick={() => startEdit(o)}>Update status</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h4 className="font-medium text-gray-900 mb-4">Update order status</h4>
          <div className="flex items-center space-x-4">
            <select
              className="block max-w-xs border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 border"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option>Pending</option>
              <option>Running</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
            <button
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none"
              onClick={saveStatus}
            >
              Save
            </button>
            <button
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
