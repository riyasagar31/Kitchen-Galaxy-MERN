import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cartItems, subtotal, totalGst, cgst, sgst, grandTotal, gstBreakdown, cartLoading, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    city: '',
    pincode: '',
    state: '',
    paymentMethod: 'COD' // Default to COD
  });

  const [addressType, setAddressType] = useState('new'); // 'saved' or 'new'
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Sync with saved user address
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
    if (!authLoading && !cartLoading && cartItems.length === 0) {
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
    }
  }, [cartItems, user, authLoading, navigate, addressType]);

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ================================
      RAZORPAY PAYMENT FUNCTION
  ================================= */
  const handleOnlinePayment = async () => {
    try {
      // 1. Create Razorpay order from backend
      const { data } = await api.post("/payment/create-order", {
        amount: grandTotal
      });
      console.log("CGLGGKGKGJ", data);
      const options = {
        // key: "rzp_test_SN4w8oQakssmm8", // Replace with your actual Razorpay Key ID
        key: "rzp_test_SNRKtNBBXX72QI", // Replace with your actual Razorpay Key ID
        amount: data.amount,
        currency: "INR",
        name: "Kitchen Galaxy",
        description: "Order Payment",
        order_id: data.id,
        handler: async function (response) {
          try {
            setIsPlacingOrder(true);
            // 2. Verify payment
            const verifyRes = await api.post("/payment/verify-payment", response);

            if (verifyRes.data.success) {
              // 3. Create Order in Database
              const orderData = {
                items: cartItems.map(item => ({
                  product: item._id,
                  name: item.name,
                  qty: item.qty,
                  price: item.price,
                  gstRate: item.gstRate || 18
                })),
                totalAmount: grandTotal,
                shippingAddress: {
                  phone: formData.phone,
                  address: formData.address,
                  city: formData.city,
                  pincode: formData.pincode,
                  state: formData.state
                },
                paymentMethod: "Online"
              };

              await api.post("/orders", orderData);

              toast.success("Payment Successful & Order Placed! 🎉");
              clearCart();
              navigate('/customer/orders');
            }
          } catch (error) {
            toast.error("Payment verification failed");
          } finally {
            setIsPlacingOrder(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: formData.phone
        },
        theme: {
          color: "#ff5252"
        },
        modal: {
          ondismiss: function () {
            setIsPlacingOrder(false);
          }
        }
      };


      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error(error);
      toast.error("Failed to initialize payment");
      setIsPlacingOrder(false);
    }
  };

  /* ================================
      PLACE ORDER FUNCTION (HANDLER)
  ================================= */
  const placeOrder = async (e) => {
    e.preventDefault();

    // Simple Validation
    if (formData.phone.length < 10) return toast.error("Enter a valid phone number");
    if (formData.pincode.length < 6) return toast.error("Enter a valid pincode");
    if (!formData.address) return toast.error("Address is required");

    // Route to Online Payment if selected
    if (formData.paymentMethod === "ONLINE") {
      setIsPlacingOrder(true);
      handleOnlinePayment();
      return;
    }

    // COD Logic
    setIsPlacingOrder(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item._id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          gstRate: item.gstRate || 18
        })),
        totalAmount: grandTotal,
        shippingAddress: {
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          state: formData.state
        },
        paymentMethod: 'COD'
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

  if (authLoading || cartLoading) return <div className="p-20 text-center">Loading session...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
        <span className="bg-[#ff5252] text-white p-2 rounded-xl">📦</span> Secure Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Shipping Form */}
        <form onSubmit={placeOrder} className="space-y-6 bg-white p-8 border rounded-3xl shadow-sm">
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800">Delivery Information</h2>

            {/* Address Type Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setAddressType('saved')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${addressType === 'saved' ? 'bg-white shadow-sm text-[#ff5252]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Saved
              </button>
              <button
                type="button"
                onClick={() => setAddressType('new')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${addressType === 'new' ? 'bg-white shadow-sm text-[#ff5252]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                New
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Mobile Number</label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleInput}
                disabled={addressType === 'saved'}
                className="border p-3 rounded-xl focus:ring-2 focus:ring-[#ff5252] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400" placeholder="10-digit number" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Pincode</label>
              <input required type="text" name="pincode" value={formData.pincode} onChange={handleInput}
                disabled={addressType === 'saved'}
                className="border p-3 rounded-xl focus:ring-2 focus:ring-[#ff5252] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400" placeholder="6-digit area code" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Full Address</label>
            <textarea required name="address" value={formData.address} onChange={handleInput}
              disabled={addressType === 'saved'}
              className="border p-3 rounded-xl h-24 focus:ring-2 focus:ring-[#ff5252] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400" placeholder="House No, Building, Street, Area..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">City / District</label>
              <input required name="city" value={formData.city} onChange={handleInput}
                disabled={addressType === 'saved'}
                className="border p-3 rounded-xl focus:ring-2 focus:ring-[#ff5252] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400" placeholder="Your City" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">State</label>
              <input required name="state" value={formData.state} onChange={handleInput}
                disabled={addressType === 'saved'}
                className="border p-3 rounded-xl focus:ring-2 focus:ring-[#ff5252] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400" placeholder="Your State" />
            </div>
          </div>

          <h2 className="text-xl font-bold border-b pb-4 pt-4 text-gray-800">Payment Method</h2>
          <div className="flex flex-col gap-4">
            <label className={`flex items-center gap-3 cursor-pointer border-2 p-4 rounded-xl w-full transition-all ${formData.paymentMethod === 'COD' ? 'border-[#ff5252] bg-red-50' : 'border-gray-100'}`}>
              <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleInput} className="w-4 h-4 accent-[#ff5252]" />
              <div>
                <p className="font-bold text-gray-800">Cash on Delivery</p>
                <p className="text-xs text-gray-500">Pay when you receive the package</p>
              </div>
            </label>

            <label className={`flex items-center gap-3 cursor-pointer border-2 p-4 rounded-xl w-full transition-all ${formData.paymentMethod === 'ONLINE' ? 'border-[#ff5252] bg-red-50' : 'border-gray-100'}`}>
              <input type="radio" name="paymentMethod" value="ONLINE" checked={formData.paymentMethod === 'ONLINE'} onChange={handleInput} className="w-4 h-4 accent-[#ff5252]" />
              <div>
                <p className="font-bold text-gray-800">Pay Online (Razorpay)</p>
                <p className="text-xs text-gray-500">Secure payment via Cards, UPI, or Netbanking</p>
              </div>
            </label>
          </div>

          <button disabled={isPlacingOrder} type="submit"
            className="w-full bg-[#ff5252] text-white py-4 rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 uppercase tracking-widest disabled:bg-gray-400">
            {isPlacingOrder ? "Processing..." : `Confirm Order (₹${grandTotal.toFixed(2)})`}
          </button>
        </form>

        {/* Right: Summary Card */}
        <div className="bg-gray-50 p-8 rounded-2xl border border-dashed border-gray-300 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Order Summary</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto mb-6 pr-2">
            {cartItems.map(item => (
              <div key={item._id} className="flex justify-between items-start bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <img src={`http://localhost:5000${item.image || (item.images && item.images[0])}`} className="w-14 h-14 object-cover rounded-lg" alt={item.name}
                    onError={(e) => e.target.src = 'https://placehold.co/100?text=Item'} />
                  <div>
                    <p className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.qty} × ₹{item.price}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                      GST @{item.gstRate || 18}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#ff5252]">₹{(item.price * item.qty).toFixed(2)}</p>
                  <p className="text-[10px] text-gray-400">+₹{((item.price * (item.gstRate || 18) / 100) * item.qty).toFixed(2)} GST</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Items Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            {/* Per-GST-rate breakdown */}
            <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 space-y-2 shadow-sm">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Tax Breakdown</p>

              {gstBreakdown.map(slab => (
                <div key={slab.rate} className="flex justify-between text-xs text-gray-600 font-medium">
                  <span>GST {slab.rate}%</span>
                  <span>₹{slab.gstAmount.toFixed(2)}</span>
                </div>
              ))}

              <div className="border-t border-gray-50 pt-2 mt-2 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>CGST Total</span>
                  <span>₹{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>SGST Total</span>
                  <span>₹{sgst.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between text-gray-700 font-semibold text-sm">
              <span>Total GST</span>
              <span>₹{totalGst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Delivery Charges</span>
              <span className="text-green-600 font-bold">FREE</span>
            </div>
            <div className="flex justify-between text-2xl font-black pt-4 border-t border-gray-300">
              <span className="text-gray-900">Grand Total</span>
              <span className="text-[#ff5252]">₹{grandTotal.toFixed(2)}</span>
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