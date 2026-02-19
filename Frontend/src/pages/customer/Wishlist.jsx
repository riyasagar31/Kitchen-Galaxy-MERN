import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { FiTrash2, FiShoppingCart, FiHeart, FiArrowLeft } from 'react-icons/fi';

const API_URL = 'http://localhost:5000/api';

export default function Wishlist() {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const res = await axios.get(`${API_URL}/wishlist`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setItems(res.data.products || []);
        } catch (err) {
            console.error("Fetch Wishlist Error:", err);
            toast.error("Failed to load wishlist");
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (productId) => {
        try {
            await axios.post(`${API_URL}/wishlist/toggle`, { productId }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setItems(items.filter(i => i._id !== productId));
            toast.success("Removed from wishlist");
        } catch (err) {
            toast.error("Failed to remove item");
        }
    };

    const handleMoveToCart = async (product) => {
        try {
            await addToCart(product);
            toast.success("Added to cart!");
        } catch (err) {
            toast.error("Failed to add to cart");
        }
    };

    if (loading) return <div className="p-20 text-center text-gray-500 font-medium">Loading your favorites...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <button
                onClick={() => navigate('/customer/home')}
                className="flex items-center gap-2 text-gray-500 hover:text-[#ff5252] font-bold transition-colors group mb-8"
            >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </button>
            {/* Compact Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-red-50 text-red-500 rounded-lg">
                    <FiHeart size={20} fill="currentColor" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">My Wishlist</h1>
                    <p className="text-xs text-gray-500 font-medium">({items.length} items)</p>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="text-4xl mb-3">🏜️</div>
                    <h2 className="text-lg font-bold text-gray-800 mb-1">Empty Wishlist</h2>
                    <p className="text-gray-500 mb-6 max-w-xs mx-auto text-xs">Save the items you love to see them here.</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-red-500 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition-all"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                /* Grid: Reduced width by increasing columns to 5 on large screens */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map((item) => (
                        <div
                            key={item._id}
                            className="group bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
                        >
                            {/* Reduced Height Image Container */}
                            <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-50">
                                <img
                                    src={`http://localhost:5000${item.images?.[0] || item.image || '/placeholder.png'}`}
                                    alt={item.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <button
                                    onClick={() => removeItem(item._id)}
                                    className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm text-red-500 rounded-md shadow-sm hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            </div>

                            {/* Compact Content Section */}
                            <div className="p-3 flex flex-col flex-1">
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    {item.category?.name || "Kitchen Galaxy"}
                                </span>
                                <h3 className="text-xs font-bold text-gray-800 mb-1 line-clamp-1">
                                    {item.name}
                                </h3>
                                <p className="text-sm font-black text-gray-900 mb-3">
                                    ₹{item.price?.toLocaleString()}
                                </p>

                                <div className="mt-auto flex flex-col gap-1.5">
                                    <button
                                        onClick={() => handleMoveToCart(item)}
                                        className="flex items-center justify-center gap-1.5 bg-[#ff5252] text-white py-2 rounded-md text-[10px] font-bold hover:bg-red-600 transition-all active:scale-95"
                                    >
                                        <FiShoppingCart size={12} />
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={() => navigate(`/products/${item._id}`)}
                                        className="py-1.5 rounded-md text-[10px] font-bold text-gray-500 border border-gray-50 hover:bg-gray-50 transition-all text-center"
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}