import React from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';

const CartSidebar = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQty, cartTotal } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for closing when clicking outside */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[900] transition-opacity"
        onClick={onClose}
      ></div>

      {/* Sidebar Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[1000] flex flex-col transition-transform duration-300 transform">

        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span>🛒</span> Your Cart ({cartItems.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <span className="text-6xl text-gray-200">🛍️</span>
              <p className="text-lg font-medium">Your cart is empty</p>
              <button
                onClick={onClose}
                className="text-[#ff5252] font-bold hover:underline"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item._id} className="flex gap-4 border-b pb-4 items-center">
                {/* Product Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={`http://localhost:5000${item.image}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null; // PREVENTS INFINITE LOOP
                      e.target.src = 'https://placehold.co/100?text=No+Image';
                    }}
                  />
                </div>

                {/* Info & Controls */}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                  <p className="text-[#ff5252] font-bold mb-2">₹{item.price}</p>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-lg bg-white">
                      <button
                        onClick={() => updateQty(item._id, item.qty - 1)}
                        className="px-2 py-1 hover:bg-gray-100 text-gray-600 border-r"
                      >-</button>
                      <span className="px-3 py-1 font-medium text-sm">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item._id, item.qty + 1)}
                        className={`px-2 py-1 hover:bg-gray-100 text-gray-600 border-l ${item.qty >= item.stock ? 'opacity-50 cursor-not-allowed text-gray-300' : ''}`}
                        disabled={item.qty >= item.stock}
                        title={item.qty >= item.stock ? "Max stock reached" : ""}
                      >+</button>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="p-2 text-[#ff5252] hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Remove Item"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer with Checkout */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t bg-gray-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="text-2xl font-black text-gray-900">₹{cartTotal}</span>
            </div>

            <button
              onClick={() => {
                onClose();
                navigate('/customer/cart'); // Navigate to full cart page
              }}
              className="w-full bg-[#ff5252] text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 mb-3"
            >
              View Full Cart
            </button>

            <button
              onClick={() => {
                onClose();
                navigate('/customer/checkout'); // Or wherever your checkout route is
              }}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all"
            >
              Checkout Now
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;