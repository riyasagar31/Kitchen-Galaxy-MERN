import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEye, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get("http://localhost:5000/api/orders/my-orders", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const generateInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    const cgst = (order.gstAmount / 2).toFixed(2);
    const sgst = (order.gstAmount / 2).toFixed(2);

    const html = `
      <html>
        <head>
          <title>Invoice - ${order._id.toUpperCase()}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; border-b: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 900; color: #ff5252; text-transform: uppercase; letter-spacing: -1px; }
            .invoice-info { text-align: right; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .section-title { font-size: 10px; font-weight: 900; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; font-size: 12px; font-weight: 900; color: #444; border-bottom: 2px solid #eee; padding: 12px 0; text-transform: uppercase; }
            td { padding: 12px 0; border-bottom: 1px solid #eee; font-size: 14px; }
            .totals { width: 300px; margin-left: auto; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .grand-total { border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; font-weight: 900; font-size: 18px; color: #ff5252; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Kitchen Galaxy</div>
            <div class="invoice-info">
              <div style="font-weight: 900; font-size: 20px;">INVOICE</div>
              <div style="color: #666;">#${order._id.toUpperCase()}</div>
              <div style="font-size: 12px; margin-top: 5px;">Date: ${new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          <div class="grid">
            <div>
              <div class="section-title">Billed To</div>
              <div style="font-weight: 700;">${order.user?.name || 'Customer'}</div>
              <div>${order.shippingAddress?.address}</div>
              <div>${order.shippingAddress?.city} - ${order.shippingAddress?.pincode}</div>
              <div>Phone: ${order.shippingAddress?.phone}</div>
            </div>
            <div style="text-align: right;">
              <div class="section-title">Payment Method</div>
              <div style="font-weight: 700; text-transform: uppercase;">${order.paymentMethod || 'COD'}</div>
              <div style="margin-top: 20px;">
                 <div class="section-title">Status</div>
                 <div style="font-weight: 700; color: #2563eb;">${order.status.toUpperCase()}</div>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td style="font-weight: 700;">${item.name}</td>
                  <td style="text-align: center;">${item.qty}</td>
                  <td style="text-align: right;">₹${item.price.toLocaleString()}</td>
                  <td style="text-align: right;">₹${(item.qty * item.price).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span style="color: #666;">Subtotal</span>
              <span style="font-weight: 700;">₹${(order.subtotal || order.totalAmount - (order.gstAmount || 0)).toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span style="color: #666;">CGST </span>
              <span style="font-weight: 700;">₹${Number(cgst).toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span style="color: #666;">SGST </span>
              <span style="font-weight: 700;">₹${Number(sgst).toLocaleString()}</span>
            </div>
            <div class="grand-total">
              <span>Grand Total</span>
              <span>₹${order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div style="margin-top: 100px; text-align: center; color: #999; font-size: 12px; border-t: 1px solid #eee; pt: 20px;">
            Thank you for shopping with Kitchen Galaxy!<br>
            This is a computer-generated invoice.
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const navigate = useNavigate();

  // Pagination Logic
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your orders...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back Button */}
      <button
        onClick={() => navigate('/customer/home')}
        className="flex items-center gap-2 text-gray-400 hover:text-[#ff5252] font-black uppercase text-[10px] tracking-widest transition-all group mb-8"
      >
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      {/* <div className="bg-white shadow-sm rounded-[2rem] p-6 md:p-10 border border-gray-100 min-h-[600px]"> */}
      <h2 className="text-2xl font-bold text-gray-900 mb-10 tracking-tight">All Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">You have no orders yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 italic-none">
            <thead className="bg-[#f8f9fa]/50">
              <tr>
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">ID</th>
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">Date</th>
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">Total</th>
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">Status</th>
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">Items</th>
                <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {paginatedOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-600">
                    #{order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-900 italic-none">
                    ₹{order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={`px-4 py-1.5 text-[10px] font-bold rounded-full uppercase tracking-tighter
                      ${order.status === 'Delivered' ? 'bg-green-50 text-green-600 border border-green-100' :
                        order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                          'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-gray-400">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-[#ff5252] hover:text-red-600 transition-all p-2.5 bg-red-50/50 hover:bg-red-100/50 rounded-xl"
                      title="View Details"
                    >
                      <FiEye size={18} />
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
                Showing <span className="text-gray-700 font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="text-gray-700 font-bold">{Math.min(currentPage * itemsPerPage, orders.length)}</span> of <span className="text-gray-700 font-bold">{orders.length}</span>
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
      )}
      {/* </div> */}

      {/* Order Detail Modal (Similar to Seller Pattern) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-[1000] flex items-center justify-center p-4">
          <div className="relative mx-auto border w-full max-w-2xl shadow-2xl rounded-2xl bg-white overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">#{selectedOrder._id.toUpperCase()}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
              {/* Top Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-gray-100">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Shipping Information</h4>
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm font-bold text-gray-800">{selectedOrder.shippingAddress?.address}</p>
                    <p className="text-sm text-gray-600 font-medium">{selectedOrder.shippingAddress?.city} - {selectedOrder.shippingAddress?.pincode}</p>
                    <p className="text-sm text-gray-500 mt-2 font-bold select-all">📞 {selectedOrder.shippingAddress?.phone}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Order Summary</h4>
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Payment Method</span>
                      <span className="font-black text-gray-900">{selectedOrder.paymentMethod || 'COD'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Order Date</span>
                      <span className="font-black text-gray-900">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100">
                      <span className="text-gray-900 font-bold">Grand Total</span>
                      <span className="text-lg font-bold text-[#ff5252]">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ordered Items</h4>
                <div className="divide-y divide-gray-100 bg-white rounded-xl border border-gray-100 overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                      <img
                        src={`http://localhost:5000${item.image || '/placeholder.png'}`}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-100 shadow-sm"
                        onError={(e) => { e.target.src = 'https://placehold.co/64?text=Product'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-bold text-gray-900 truncate">{item.name}</h5>
                        <p className="text-[10px] font-black text-gray-400 uppercase mt-0.5">Qty: {item.qty} x ₹{item.price.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-tighter inline-block mb-1
                          ${item.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            item.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'}`}>
                          {item.status}
                        </div>
                        <p className="text-sm font-black text-gray-900">₹{(item.qty * item.price).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50/50 flex justify-between gap-4">
              {selectedOrder.status === 'Delivered' && (
                <button
                  onClick={() => generateInvoice(selectedOrder)}
                  className="px-6 py-2 bg-[#ff5252] text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100 flex items-center gap-2"
                >
                  📄 Generate Invoice
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-[#ff5252] text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-gray-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
