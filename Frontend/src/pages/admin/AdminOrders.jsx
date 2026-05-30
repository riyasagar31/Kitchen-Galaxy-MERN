import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  FiArrowLeft,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiSearch,
  FiChevronDown,
  FiDownload
} from 'react-icons/fi';
import ExcelJS from 'exceljs';

const API_URL = 'http://localhost:5000/api';

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editStatusOrder, setEditStatusOrder] = useState(null);

  // States for search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/orders`, { headers });
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
      const matchesStatus = statusFilter ? order.status === statusFilter : true;
      const matchesSearch = searchQuery
        ? (order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order._id.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers }
      );
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
      setEditStatusOrder(null);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to update status";
      toast.error(errorMsg);
      console.error("Update Status Error:", err.response?.data || err);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to permanently delete this order? This action cannot be undone.")) return;
    try {
      await axios.delete(`${API_URL}/admin/orders/${orderId}`, { headers });
      toast.success("Order deleted successfully");
      fetchOrders();
    } catch (err) {
      toast.error("Failed to delete order");
      console.error(err);
    }
  };

  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Orders Report');

      worksheet.columns = [
        { header: 'Order ID', key: 'id', width: 25 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Customer Name', key: 'name', width: 20 },
        { header: 'Customer Email', key: 'email', width: 25 },
        { header: 'Total Amount (₹)', key: 'total', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Payment Method', key: 'paymentMethod', width: 15 },
        { header: 'Payment Status', key: 'paymentStatus', width: 15 },
        { header: 'Shipping Address', key: 'address', width: 40 },
        { header: 'Items', key: 'items', width: 50 }
      ];

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };

      filteredOrders.forEach(order => {
        const itemsList = order.items.map(item => `${item.name} (Qty: ${item.qty}, Price: ₹${item.price})`).join('; ');
        const address = `${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}`;
        
        worksheet.addRow({
          id: order._id,
          date: new Date(order.createdAt).toLocaleDateString(),
          name: order.user?.name || 'Guest',
          email: order.user?.email || '-',
          total: order.totalAmount || 0,
          status: order.status,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          address: address,
          items: itemsList
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Excel Report downloaded successfully!');
    } catch (error) {
      console.error('Export Error:', error);
      toast.error('Failed to export to Excel');
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading orders...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-400 hover:text-[#ff5252] font-semibold uppercase text-[10px] tracking-wide transition-all group mb-4"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Orders Management</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">Total {filteredOrders.length} orders found</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 w-full md:w-auto">
          <div className="flex flex-col items-end gap-2 w-full">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 border-2 border-[#ff5252] text-[#ff5252] px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#ff5252] hover:text-white transition-all shadow-sm active:scale-95 bg-white shrink-0 mb-1"
            >
              <FiDownload size={16} /> Excel Report
            </button>
            <div className="flex flex-wrap items-center gap-4 w-full justify-end">

            {/* Status Dropdown */}
            <div className="w-full sm:w-40 relative">
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold bg-white focus:ring-1 focus:ring-[#ff5252] outline-none appearance-none cursor-pointer pr-10 hover:border-gray-300 transition-colors"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Running">Running</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Customer Search */}
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Customer or ID..."
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[#ff5252] outline-none transition-all shadow-sm bg-white hover:border-gray-300"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm overflow-hidden rounded-[2rem] border border-gray-100 transition-shadow hover:shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-[#f8f9fa]">
              <tr>
                <th className="px-6 py-5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">ORDER ID</th>
                <th className="px-6 py-5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">DATE</th>
                <th className="px-6 py-5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">CUSTOMER</th>
                <th className="px-6 py-5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">TOTAL (₹)</th>
                <th className="px-6 py-5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">STATUS</th>
                <th className="px-6 py-5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-sm text-gray-400">
                    No orders found matching your search.
                  </td>
                </tr>
              ) : paginatedOrders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                    <span className="font-mono text-xs text-gray-400">#</span>{order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 leading-none">{order.user?.name || 'Guest'}</div>
                    <div className="text-[10px] font-semibold text-gray-400 mt-1 truncate max-w-[150px]">{order.user?.email}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-[#ff5252]">
                    ₹{(order.totalAmount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1 text-[10px] font-semibold rounded-full uppercase tracking-tight
                      ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          order.status === 'Running' ? 'bg-orange-100 text-orange-700' :
                            order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right space-x-4">
                    <button onClick={() => setSelectedOrder(order)} className="text-[#ff5252] hover:scale-110 transition-transform active:scale-95" title="View Items"><FiEye size={20} /></button>
                    <button onClick={() => setEditStatusOrder(order)} className="text-[#ff5252] hover:scale-110 transition-transform active:scale-95" title="Update Status"><FiEdit2 size={18} /></button>
                    <button onClick={() => handleDelete(order._id)} className="text-[#ff5252] hover:text-red-600 hover:scale-110 transition-all active:scale-95" title="Delete Order"><FiTrash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-10 py-5 border-t border-gray-50 bg-[#fbfcfd]">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">
              Showing <span className="text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="text-gray-900">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of <span className="text-gray-900">{filteredOrders.length}</span>
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-white text-[#ff5252] transition-all bg-white shadow-sm disabled:shadow-none"
              >
                <FiChevronLeft size={18} />
              </button>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-2">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-white text-[#ff5252] transition-all bg-white shadow-sm disabled:shadow-none"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Items Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            <div className="bg-white px-8 py-5 border-b border-gray-50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Order Details</h3>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-1">Order ID #{selectedOrder._id.toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-all group">
                <FiX size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 flex-1 min-h-0">
              {/* Order Items */}
              <div className="space-y-4">
                <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-wide pl-1">Order Items ({selectedOrder.items.length})</p>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-300">
                    <img
                      src={`http://localhost:5000${item.product?.images?.[0] || '/placeholder.png'}`}
                      alt=""
                      className="w-14 h-14 object-cover rounded-lg border border-gray-100 bg-white shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-gray-900 leading-tight truncate">{item.name}</h4>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-1 flex items-center gap-2">
                        Qty: {item.qty}
                        <span className="text-gray-300">•</span>
                        ₹{item.price.toLocaleString()}
                        {item.gstRate && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-orange-500">GST {item.gstRate}%</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[15px] font-bold text-gray-900 mb-0.5">₹{(item.qty * item.price + (item.gstAmount || 0)).toLocaleString()}</div>
                      <span className={`px-2 py-0.5 text-[8px] font-semibold rounded-full uppercase tracking-tight ${item.status === 'Delivered' ? 'bg-green-100 text-green-700' : item.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer & Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 shrink-0">
                <div>
                  <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-wide mb-2 pl-1">Shipping Details</p>
                  <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                    <p className="text-xs font-semibold text-gray-800 leading-relaxed">
                      {selectedOrder.shippingAddress?.address},<br />
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}<br />
                      <span className="text-gray-900 font-bold">{selectedOrder.shippingAddress?.pincode}</span>
                    </p>
                    <p className="text-[10px] font-semibold text-gray-400 mt-2 uppercase tracking-tight">Phone: {selectedOrder.shippingAddress?.phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-wide mb-2 pl-1">Payment Method</p>
                  <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 h-full flex flex-col justify-center">
                    <p className="text-md font-bold text-gray-900 uppercase tracking-tight">{selectedOrder.paymentMethod}</p>
                    <p className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-wide">
                      {selectedOrder.paymentStatus === 'Paid' ? '✅ Completed' : '🕒 Pending'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50/50 px-8 py-5 border-t border-gray-100 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-[#ff5252] text-white px-8 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wide hover:bg-red-600 hover:shadow-lg transition-all active:scale-[0.98]"
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
            <div className="bg-white px-10 py-8 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Order Status</h3>
              <button onClick={() => setEditStatusOrder(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors group">
                <FiX size={20} className="group-hover:rotate-90 transition-transform" />
              </button>
            </div>
            <div className="p-10 space-y-8 text-center">
              <div className="space-y-4 text-left">
                <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-wide leading-none pl-1">Select New Status</p>
                <div className="relative">
                  <select
                    className="w-full border-2 border-gray-100 rounded-[1.25rem] p-4 text-xs font-semibold uppercase tracking-wide bg-gray-50 focus:bg-white focus:border-[#ff5252] outline-none transition-all cursor-pointer hover:border-gray-200 appearance-none pr-12 text-center"
                    value={editStatusOrder.status}
                    onChange={(e) => updateOrderStatus(editStatusOrder._id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Running">Running</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
              </div>

            </div>
            <div className="bg-gray-50/50 px-10 py-8 border-t border-gray-100">
              <button
                onClick={() => setEditStatusOrder(null)}
                className="w-full bg-[#ff5252] text-white py-4 rounded-[1.25rem] font-bold uppercase text-xs tracking-wide hover:bg-red-600 hover:shadow-2xl transition-all active:scale-[0.98] shadow-lg"
              >
                Finish Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
