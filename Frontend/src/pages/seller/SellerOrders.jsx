import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi'; // Added back icon

const API_URL = 'http://localhost:5000/api';

export default function SellerOrders() {
  const navigate = useNavigate(); // Initialize navigate
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/seller-orders/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Update order status to ${newStatus}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/seller-orders/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders(); // Refresh list
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading orders...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* BACK BUTTON SECTION */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/seller')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <FiArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Orders</h2>

        {orders.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No orders found for your products yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="border rounded-lg overflow-hidden shadow-sm">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Customer: <span className="font-medium text-gray-700">{order.user?.name} ({order.user?.email})</span>
                    </p>
                    <div className="text-xs text-gray-500 mt-1">
                      Shipping: <span className="font-medium">{order.shippingAddress?.address}, {order.shippingAddress?.city}</span>
                      <br />Phone: {order.shippingAddress?.phone}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${order.sellerStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.sellerStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                        {order.sellerStatus}
                      </span>
                      {order.sellerStatus !== order.status && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          (Order: {order.status})
                        </span>
                      )}
                      <span className="text-sm font-bold text-gray-900">Total: ₹{order.totalAmount}</span>
                    </div>

                    {/* Status Actions */}
                    <select
                      className="text-xs border rounded p-1 bg-white focus:ring-2 focus:ring-[#ff5252] outline-none"
                      value={order.sellerStatus}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      disabled={order.sellerStatus === 'Cancelled' || order.sellerStatus === 'Delivered'}
                    >
                      <option value={order.sellerStatus} disabled>Update My Status...</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Order Items */}
                <div className="divide-y divide-gray-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                      <img
                        src={`http://localhost:5000${item.image || (item.product?.image) || '/placeholder.png'}`}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded border"
                        onError={(e) => { e.target.src = 'https://placehold.co/64?text=Product'; }}
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                        <p className="text-xs text-gray-500">Qty: {item.qty} x ₹{item.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">₹{item.qty * item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}