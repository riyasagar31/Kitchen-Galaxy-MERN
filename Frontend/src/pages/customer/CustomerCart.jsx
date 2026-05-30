import React from 'react';
// Added getGSTPercentage to the import list
import { useCart } from '../../context/CartContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function CustomerCart() {
  const { cartItems, removeFromCart, updateQty, subtotal, totalGst, cgst, sgst, grandTotal, gstBreakdown, cartLoading, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-medium text-gray-500">Loading cart...</h2>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Looks like you haven't added anything to your kitchen yet.</p>
        <Link
          to="/"
          className="bg-[#ff5252] text-white px-8 py-3 rounded-lg font-bold hover:bg-red-600 transition-colors"
        >
          Return to Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/customer/home')}
        className="flex items-center gap-2 text-gray-500 hover:text-[#ff5252] font-bold transition-colors group mb-8"
      >
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cartItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            item.images?.[0] ? `http://localhost:5000${item.images[0]}`
                              : item.image ? `http://localhost:5000${item.image}`
                                : 'https://placehold.co/100?text=No+Image'
                          }
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg border"
                          onError={(e) => { e.target.src = 'https://placehold.co/100?text=No+Image'; }}
                        />
                        <div>
                          <h4 className="font-bold text-gray-800">{item.name}</h4>
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                            GST ({item.gstRate || 18}%)
                          </span>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-500 text-xs hover:underline mt-1 block"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">₹{item.price}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center border rounded-md w-max bg-white">
                        <button
                          onClick={() => updateQty(item._id, item.qty - 1)}
                          className="px-3 py-1 hover:bg-gray-100 border-r"
                        >-</button>
                        <span className="px-4 py-1 font-medium">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item._id, item.qty + 1)}
                          className={`px-3 py-1 hover:bg-gray-100 border-l ${item.qty >= item.stock ? 'opacity-50 cursor-not-allowed text-gray-300' : ''}`}
                          disabled={item.qty >= item.stock}
                        >+</button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      ₹{item.price * item.qty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={clearCart}
            className="text-gray-500 text-sm hover:text-red-600 transition-colors flex items-center gap-2"
          >
            🗑️ Clear Shopping Cart
          </button>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border rounded-xl p-6 shadow-sm sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

            <div className="space-y-4 border-b pb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              {gstBreakdown.map(slab => (
                <div key={slab.rate} className="flex justify-between text-gray-500 text-sm">
                  <span>GST {slab.rate}%</span>
                  <span>₹{slab.gstAmount.toFixed(2)}</span>
                </div>
              ))}

              <div className="flex justify-between text-gray-500 text-sm pt-2 border-t border-gray-100">
                <span>CGST Total</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm">
                <span>SGST Total</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700 font-bold text-sm border-t border-gray-200 pt-2 mt-2">
                <span>Total GST</span>
                <span>₹{totalGst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-6">
              <span className="text-lg font-bold text-gray-900">Total Amount</span>
              <span className="text-2xl font-black text-[#ff5252]">₹{grandTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate('/customer/checkout')}
              className="w-full bg-[#ff5252] text-white py-4 rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100 uppercase tracking-wide"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/"
              className="block text-center text-gray-500 text-sm mt-4 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}