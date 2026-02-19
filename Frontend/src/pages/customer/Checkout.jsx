import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    city: '',
    pincode: '',
    state: '',
    paymentMethod: 'COD'
  });

  const [addressType, setAddressType] = useState('new'); // 'saved' or 'new'
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Sync with saved user address
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
    if (!authLoading && cartItems.length === 0) {
      toast.error("Your cart is empty");
      navigate('/customer/cart');
    }

    if (user && addressType === 'saved') {
      setFormData(prev => ({
        ...prev,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        pincode: user.pincode || '',
        state: user.state || '',
      }));
    } else if (addressType === 'new') {
      // Optional: clear form when switching to new? 
      // Better to leave it or clear if it was exactly a match
    }
  }, [cartItems, user, authLoading, navigate, addressType]);

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    // Simple Validation
    if (formData.phone.length < 10) return toast.error("Enter a valid phone number");
    if (formData.pincode.length < 6) return toast.error("Enter a valid pincode");
    if (!formData.address) return toast.error("Address is required");

    setIsPlacingOrder(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item._id,
          name: item.name,
          qty: item.qty,
          price: item.price
        })),
        totalAmount: cartTotal,
        shippingAddress: {
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          state: formData.state
        },
        paymentMethod: formData.paymentMethod
      };

      const res = await api.post('/orders', orderData);

      if (res.data.success) {
        toast.success("Order placed successfully! 🎉");
        clearCart();
        navigate('/customer/orders');
      }
    } catch (err) {
      console.error("Order failed", err);
      toast.error(err.response?.data?.message || "Failed to place order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (authLoading) return <div className="p-20 text-center">Verifying session...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
        <span className="bg-gray-50 text-white p-2 rounded-xl">📦</span> Secure Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Shipping Form */}
        <form onSubmit={placeOrder} className="space-y-6 bg-white p-8 border rounded-3xl shadow-sm">
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800">Delivery Information</h2>

            {/* Address Type Toggle */}
            {user?.address && (
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAddressType('saved')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${addressType === 'saved' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Saved
                </button>
                <button
                  type="button"
                  onClick={() => setAddressType('new')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${addressType === 'new' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  New
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Mobile Number</label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleInput}
                disabled={addressType === 'saved'}
                className="border p-3 rounded-xl focus:ring-2 focus:ring-orange-600 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400" placeholder="10-digit number" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Pincode</label>
              <input required type="text" name="pincode" value={formData.pincode} onChange={handleInput}
                disabled={addressType === 'saved'}
                className="border p-3 rounded-xl focus:ring-2 focus:ring-orange-600 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400" placeholder="6-digit area code" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Full Address</label>
            <textarea required name="address" value={formData.address} onChange={handleInput}
              disabled={addressType === 'saved'}
              className="border p-3 rounded-xl h-24 focus:ring-2 focus:ring-orange-600 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400" placeholder="House No, Building, Street, Area..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">City / District</label>
              <input required name="city" value={formData.city} onChange={handleInput}
                disabled={addressType === 'saved'}
                className="border p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400" placeholder="Your City" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">State</label>
              <input required name="state" value={formData.state} onChange={handleInput}
                disabled={addressType === 'saved'}
                className="border p-3 rounded-xl focus:ring-2 focus:ring-orange-600 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400" placeholder="Your State" />
            </div>
          </div>

          <h2 className="text-xl font-bold border-b pb-4 pt-4 text-gray-800">Payment Method</h2>
          <div className="flex gap-4">
            <label className={`flex items-center gap-3 cursor-pointer border-2 p-4 rounded-xl w-full transition-all ${formData.paymentMethod === 'COD' ? 'border-orange-600 bg-orange-50' : 'border-gray-100'}`}>
              <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleInput} className="w-4 h-4 accent-orange-600" />
              <div>
                <p className="font-bold text-gray-800">Cash on Delivery</p>
                <p className="text-xs text-gray-500">Pay when you receive the package</p>
              </div>
            </label>
          </div>

          <button disabled={isPlacingOrder} type="submit"
            className="w-full bg-[#ff5252] text-white py-4 rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-orange-200 uppercase tracking-widest disabled:bg-gray-400">
            {isPlacingOrder ? "Placing Order..." : `Confirm Order (₹${cartTotal})`}
          </button>
        </form>

        {/* Right: Summary Card */}
        <div className="bg-gray-50 p-8 rounded-2xl border border-dashed border-gray-300 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Order Summary</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto mb-6 pr-2">
            {cartItems.map(item => (
              <div key={item._id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <img src={`http://localhost:5000${item.image || (item.images && item.images[0])}`} className="w-14 h-14 object-cover rounded-lg" alt={item.name}
                    onError={(e) => e.target.src = 'https://placehold.co/100?text=Item'} />
                  <div>
                    <p className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.qty} × ₹{item.price}</p>
                  </div>
                </div>
                <p className="font-bold text-orange-600">₹{item.price * item.qty}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Items Total</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Delivery Charges</span>
              <span className="text-green-600 font-bold">FREE</span>
            </div>
            <div className="flex justify-between text-2xl font-black pt-4 border-t border-gray-300">
              <span className="text-gray-900">Grand Total</span>
              <span className="text-orange-600">₹{cartTotal}</span>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6 italic">
            By placing the order, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}