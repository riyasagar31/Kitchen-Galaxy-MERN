import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiEye, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiX, FiSearch, FiChevronDown } from 'react-icons/fi';

const API_URL = 'http://localhost:5000/api';

export default function SellerOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editStatusOrder, setEditStatusOrder] = useState(null);

  // States for search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(new URLSearchParams(location.search).get('status') || '');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const token = localStorage.getItem('token');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    fetchOrders();
  }, [headers]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/seller-orders/orders`, { headers });
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const currentStatus = order.sellerStatus || order.status;
      const matchesStatus = statusFilter ? currentStatus === statusFilter : true;
      const matchesSearch = searchQuery
        ? order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order._id.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const updateStatus = async (orderId, itemId, newStatus) => {
    try {
      const res = await axios.patch(`${API_URL}/seller-orders/orders/${orderId}/items/${itemId}/status`,
        { status: newStatus },
        { headers }
      );
      toast.success(`Item marked as ${newStatus}`);
      
      const { globalStatus } = res.data;

      // Update editStatusOrder state locally
      setEditStatusOrder(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: globalStatus,
          items: prev.items.map(item => 
            item._id === itemId ? { ...item, status: newStatus } : item
          )
        };
      });

      // Update the main orders list locally for instant feedback
      setOrders(prevOrders => prevOrders.map(order => {
        if (order._id === orderId) {
          const updatedItems = order.items.map(item => 
            item._id === itemId ? { ...item, status: newStatus } : item
          );
          // sellerStatus is usually based on the first item in the backend
          return { 
            ...order, 
            status: globalStatus, 
            items: updatedItems,
            sellerStatus: updatedItems.length > 0 ? updatedItems[0].status : globalStatus
          };
        }
        return order;
      }));

      // Still refetch to ensure everything is in sync with backend
      fetchOrders();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to update status";
      toast.error(errorMsg);
      console.error("Update Status Error:", err.response?.data || err);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel your items in this order? This action cannot be undone.")) return;
    try {
      const order = orders.find(o => o._id === orderId);
      if (!order) return;

      const promises = order.items.map(item =>
        axios.patch(`${API_URL}/seller-orders/orders/${orderId}/items/${item._id}/status`,
          { status: 'Cancelled' },
          { headers }
        )
      );

      await Promise.all(promises);
      toast.success("Order items cancelled successfully");
      fetchOrders();
    } catch (err) {
      toast.error("Failed to cancel items");
      console.error(err);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Loading orders...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate('/seller')}
            className="flex items-center gap-2 text-gray-400 hover:text-[#ff5252] font-black uppercase text-[10px] tracking-widest transition-all group mb-4"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
          <h3 className="text-2xl font-bold text-gray-800">Order Management</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Status Dropdown */}
          <div className="w-full sm:w-40 relative">
            <select
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold bg-white focus:ring-1 focus:ring-[#ff5252] outline-none appearance-none cursor-pointer pr-10"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Customer Search */}
          <div className="relative w-full sm:w-56">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Customer or ID..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[#ff5252] outline-none transition-all shadow-sm bg-white"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm overflow-hidden rounded-md border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-[#f8f9fa]">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">ORDER ID</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">DATE</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">CUSTOMER</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL (₹)</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-400 italic">
                    No orders found.
                  </td>
                </tr>
              ) : paginatedOrders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-gray-900">
                    #{order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{order.user?.name}</div>
                    <div className="text-[10px] font-black text-gray-400 truncate max-w-[150px]">{order.user?.email}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-[#ff5252]">
                    ₹{order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-tighter
                      ${(order.sellerStatus || order.status) === 'Delivered' ? 'bg-green-100 text-green-700' :
                        (order.sellerStatus || order.status) === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                        (order.sellerStatus || order.status) === 'Shipped' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {order.sellerStatus || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right space-x-4">
                    <button onClick={() => setSelectedOrder(order)} className="text-[#ff5252] hover:scale-110 transition-transform" title="View Items"><FiEye size={22} /></button>
                    <button onClick={() => setEditStatusOrder(order)} className="text-[#ff5252] hover:scale-110 transition-transform" title="Update Status"><FiEdit2 size={20} /></button>
                    <button onClick={() => handleDelete(order._id)} className="text-[#ff5252] hover:text-red-600 hover:scale-110 transition-all" title="Cancel Order"><FiTrash2 size={20} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <p className="text-xs text-gray-400 font-medium tracking-tight">
              Showing <span className="text-gray-700 font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="text-gray-700 font-bold">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of <span className="text-gray-700 font-bold">{filteredOrders.length}</span>
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

      {/* View Items Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-white px-10 py-6 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Order Preview</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Order ID #{selectedOrder._id.toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all group">
                <FiX size={24} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300">
                  <img src={`http://localhost:5000${item.image || '/placeholder.png'}`} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-100" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 leading-tight">{item.name}</h4>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Qty: {item.qty} x ₹{item.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 mb-1">₹{(item.qty * item.price).toLocaleString()}</div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-tight ${item.status === 'Delivered' ? 'bg-green-100 text-green-700' : item.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50/50 px-10 py-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Shipping Destination</p>
                <p className="text-sm font-medium text-gray-700 leading-snug">{selectedOrder.shippingAddress?.address},<br />{selectedOrder.shippingAddress?.city} - {selectedOrder.shippingAddress?.pincode}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full md:w-auto bg-[#ff5252] text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-red-600 hover:shadow-lg transition-all active:scale-95"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {editStatusOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="bg-white px-10 py-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Update Status</h3>
              <button onClick={() => setEditStatusOrder(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"><FiX size={20} /></button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6">
              {editStatusOrder.items.map((item, idx) => (
                <div key={idx} className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-sm font-bold text-gray-800 truncate max-w-[240px] leading-tight">{item.name}</p>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tight
                      ${item.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                        item.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      className="w-full border-2 border-gray-100 rounded-xl p-2.5 text-[11px] font-bold uppercase tracking-tight bg-white focus:border-[#ff5252] outline-none transition-all cursor-pointer hover:border-gray-200 appearance-none pr-10"
                      value={item.status}
                      onChange={(e) => updateStatus(editStatusOrder._id, item._id, e.target.value)}
                      disabled={item.status === 'Cancelled' || item.status === 'Delivered'}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50/50 px-10 py-6 border-t border-gray-100">
              <button
                onClick={() => setEditStatusOrder(null)}
                className="w-full bg-[#ff5252] text-white py-3 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-red-600 hover:shadow-xl transition-all active:scale-[0.98]"
              >
                Save & Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
