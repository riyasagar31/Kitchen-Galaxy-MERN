import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import CartSidebar from '../components/CartSidebar';

const API_URL = 'http://localhost:5000/api';

// Helper Component for Dynamic Stars
const StarRating = ({ rating, size = 18 }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        // Logic to determine fill percentage
        let fillPercentage = 0;
        if (rating >= starValue) {
          fillPercentage = 100;
        } else if (rating > i && rating < starValue) {
          fillPercentage = (rating - i) * 100;
        }

        return (
          <div key={i} className="relative text-yellow-400" style={{ width: size, height: size }}>
            {/* Base Gray Star */}
            <FiStar size={size} className="text-gray-300 absolute top-0 left-0" />
            {/* Filled Yellow Star with clipping */}
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <FiStar size={size} fill="currentColor" className="text-yellow-400" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { user } = useAuth();
  const { addToCart } = useCart();

  const handleAction = async (actionType) => {
    if (!user) {
      toast.error("Please login to continue!");
      navigate('/login');
      return;
    }

    try {
      if (actionType === 'cart' || actionType === 'buyNow') {
        await addToCart(product);
        toast.success("Added to cart!");
        if (actionType === 'buyNow') {
          navigate('/customer/cart');
        } else {
          setIsSidebarOpen(true);
        }
      }
    } catch (err) {
      console.error("Action failed", err);
      toast.error("Failed to add to cart");
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.error("Login required to use wishlist");
      navigate("/login");
      return;
    }
    try {
      await axios.post(`${API_URL}/wishlist/toggle`, { productId: id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Login required to review");
      navigate("/login");
      return;
    }
    try {
      await axios.post(`${API_URL}/reviews`, { productId: id, rating, comment }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success("Review posted!");
      setComment("");
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post review");
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/reviews/product/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Fetch reviews failed", err);
    }
  };

  const checkWishlistStatus = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const ids = (res.data.products || []).map(p => p._id);
      setIsWishlisted(ids.includes(id));
    } catch (err) {
      console.error("Check wishlist failed", err);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.product);
      setRelated(res.data.relatedProducts || []);
      fetchReviews();
      checkWishlistStatus();
    } catch (err) {
      console.error('Failed to load product', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff5252] mx-auto"></div>
      <p className="mt-4 text-gray-500 font-medium">Loading premium essentials...</p>
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center">
      <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
      <Link to="/" className="mt-4 inline-block text-[#ff5252] font-bold underline">Back to Shop</Link>
    </div>
  );

  const mainImage = product.images?.[0]
    ? `http://localhost:5000${product.images[0]}`
    : (product.image ? `http://localhost:5000${product.image}` : null);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 mt-4">
        <CartSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Breadcrumb */}
        <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">
          <Link to="/" className="hover:text-[#ff5252] transition-colors">Home</Link>
          <span className="mx-2 text-gray-200">/</span>
          <span>{product.category?.name || 'Collection'}</span>
          <span className="mx-2 text-gray-200">/</span>
          <strong className="text-gray-900 font-bold">{product.name}</strong>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Product Image Section */}
          <div className="relative">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm aspect-square flex items-center justify-center p-6 max-w-lg mx-auto md:mx-0">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-gray-300 font-bold uppercase tracking-tighter">No Image Found</div>
              )}
            </div>
            <button
              onClick={toggleWishlist}
              className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-md z-10 transition-all hover:scale-110 active:scale-95 border border-gray-100"
            >
              <FiHeart size={20} className={isWishlisted ? "text-red-500 fill-red-500" : "text-gray-400"} />
            </button>

            {product.stock < 5 && product.stock > 0 && (
              <div className="absolute top-4 left-4 bg-[#ff5252] text-white text-[9px] font-black px-3 py-1.5 rounded-lg shadow-sm">
                LIMITED STOCK
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3 tracking-tight">
              {product.name}
            </h1>

            {/* Dynamic Half-Star Rating Display */}
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={product.ratings || 0} size={18} />
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                {Number(product.ratings || 0).toFixed(1)} • {product.numReviews || 0} Reviews
              </span>
            </div>

            <p className="text-base text-gray-600 leading-relaxed mb-6">
              {product.description || "Crafted for excellence, this essential piece brings both style and superior functionality to your modern kitchen."}
            </p>

            <div className="mb-8">
              <div className="text-4xl font-bold text-gray-900 tracking-tight flex items-start">
                <span className="text-xl mt-1 mr-1 text-[#ff5252]">₹</span>
                {product.price.toLocaleString()}
              </div>
              <p className="text-[10px] text-gray-400 font-bold mt-1">Inclusive of all taxes</p>
            </div>

            <div className="space-y-3 border-t border-gray-100 pt-6 mb-8">
              <div className="flex items-center text-sm">
                <span className="w-28 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Brand</span>
                <span className="font-bold text-gray-800">
                  {product.brand?.name || (typeof product.brand === 'string' ? product.brand : 'Collection')}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className="w-28 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</span>
                <span className="font-bold text-gray-800">{product.category?.name} {product.subCategory ? `› ${product.subCategory.name}` : ''}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="w-28 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Availability</span>
                <span className={`font-bold ${product.stock > 0 ? "text-green-600" : "text-[#ff5252]"}`}>
                  {product.stock > 0 ? `In Stock (${product.stock} Units)` : 'Currently Unavailable'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="flex-1 px-8 py-4 rounded-xl bg-[#ff5252] text-white font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-all duration-300 disabled:bg-gray-200"
                onClick={() => handleAction('buyNow')}
                disabled={product.stock <= 0}
              >
                Buy Now
              </button>

              <button
                className="flex-1 px-8 py-4 rounded-xl border-2 border-gray-100 text-gray-900 font-bold text-xs uppercase tracking-widest hover:bg-[#ff5252] hover:text-white transition-all duration-300 disabled:border-gray-200 disabled:text-gray-300"
                onClick={() => handleAction('cart')}
                disabled={product.stock <= 0}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20 border-t border-gray-100 pt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-10 tracking-tight">Customer <span className="text-[#ff5252]">Reviews</span></h3>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Write a review</h4>
                <form onSubmit={submitReview}>
                  <div className="mb-4">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className={`text-xl transition-all ${rating >= s ? "text-yellow-400" : "text-gray-200"}`}
                        >
                          <FiStar fill={rating >= s ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Review</label>
                    <textarea
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-1 focus:ring-[#ff5252] outline-none min-h-[120px] text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-[#ff5252] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all"
                  >
                    Post Review
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              {reviews.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 border border-dotted border-gray-200 rounded-2xl">
                  <p className="text-gray-400 font-bold text-sm">No reviews yet. Be the first!</p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-bold text-sm text-gray-900">{rev.user?.name}</h5>
                        <div className="mt-0.5">
                          <StarRating rating={rev.rating} size={12} />
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 text-sm font-medium">"{rev.comment}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Related items */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">You May Also <span className="text-[#ff5252]">Like</span></h3>
            <div className="h-[1px] flex-1 bg-gray-100 mx-6 hidden md:block"></div>
          </div>

          {related.length === 0 ? (
            <div className="text-gray-400 font-bold py-10 text-center bg-gray-50 rounded-2xl text-sm">No related products found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.map((r) => (
                <Link
                  key={r._id}
                  to={`/products/${r._id}`}
                  className="group flex flex-col"
                >
                  <div className="aspect-square bg-white border border-gray-100 rounded-2xl overflow-hidden mb-4 transition-all group-hover:shadow-lg">
                    <img
                      src={`http://localhost:5000${r.images?.[0] || r.image}`}
                      alt={r.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="px-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[8px] font-bold text-[#ff5252] uppercase tracking-widest">{r.brand?.name || 'Collection'}</span>
                      <div className="flex items-center gap-0.5 text-yellow-400">
                        <FiStar size={10} fill="currentColor" />
                        <span className="text-[10px] font-bold text-gray-900">{Number(r.ratings || 0).toFixed(1)}</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-[#ff5252] transition-colors">{r.name}</h4>
                    <div className="mt-1 text-base font-bold text-gray-900">₹{r.price.toLocaleString()}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

  );
}