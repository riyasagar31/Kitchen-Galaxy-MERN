import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import HomeFeatures from '../components/HomeFeatures.jsx';
import { FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const API_URL = 'http://localhost:5000/api';

export default function Home() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Search & Filter State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [priceRange] = useState([0, 100000]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const navigate = useNavigate();
  const location = useLocation();

  // 1. SYNC WITH URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    const subParam = params.get('subCategory');
    const brandParam = params.get('brand');

    setSelectedCategory(catParam || "All");
    setSelectedSubCategory(subParam || null);
    setSelectedBrand(brandParam || "All");
    setSearchTerm(params.get('search') || "");

    setCurrentPage(1);
  }, [location.search]);

  // 2. FETCH DATA
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/products`);
        setProducts(res.data || []);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 3. FILTER LOGIC
  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchTerm.trim() === "" || product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesCategory = selectedCategory === "All" || (product.category?.name === selectedCategory);
    const matchesSubCategory = !selectedSubCategory || (product.subCategory?.name === selectedSubCategory);
    const productBrandValue = product.brand?.name || product.brand || "";
    const matchesBrand = selectedBrand === "All" ||
      productBrandValue.toString().trim().toLowerCase() === selectedBrand.trim().toLowerCase();

    return matchesSearch && matchesCategory && matchesSubCategory && matchesBrand && matchesPrice;
  });

  // 4. PAGINATION
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // 5. WISHLIST HANDLER
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    if (user && user.role === 'customer') {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWishlistIds((res.data.products || []).map(p => p._id));
    } catch (err) {
      console.error("Wishlist Error:", err);
    }
  };

  const toggleWishlist = async (e, productId) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Login required to use wishlist");
      navigate("/login");
      return;
    }
    try {
      await axios.post(`${API_URL}/wishlist/toggle`, { productId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (wishlistIds.includes(productId)) {
        setWishlistIds(prev => prev.filter(id => id !== productId));
        toast.success("Removed from wishlist");
      } else {
        setWishlistIds(prev => [...prev, productId]);
        toast.success("Added to wishlist");
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };

  // 6. ADD TO CART HANDLER
  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Login required to add products to cart");
      navigate("/login");
      return;
    }
    if (user.role !== 'customer') {
      toast.error("Only customers can add items to cart");
      return;
    }
    try {
      await addToCart(product);
      toast.success(`${product.name} added to cart!`);
      navigate("/customer/cart");
    } catch (err) {
      console.error("Cart Error:", err);
      toast.error("Failed to add item to cart");
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">

      {/* --- UPGRADED HERO SECTION WITH BACKGROUND --- */}
      <div
        className="relative w-full py-24 md:py-36 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          // Replace URL below with your actual image path or ad image
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('./hero-image3.webp')`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-8xl font-black text-white mb-2 tracking-tighter">
            Kitchen <span className="text-[#ff5252]">Galaxy</span>
          </h1>
          <p className="text-white text-[10px] md:text-xs font-black uppercase tracking-[0.5em]">
            Premium Essentials for Modern Homes
          </p>
        </div>
      </div>
      {/* --- END HERO SECTION --- */}

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">



        {/* Grid Section */}
        <div id="featured-products">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                {selectedBrand !== "All" ? `Brand: ${selectedBrand}` : "Our Products"}
              </h3>
              <p className="text-sm text-gray-400">{filteredProducts.length} items found</p>
            </div>
            {selectedBrand !== "All" && (
              <button onClick={() => navigate('/')} className="text-xs font-bold text-red-500 hover:underline">
                Clear Filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(n => <div key={n} className="h-64 bg-gray-100 animate-pulse rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {currentProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/products/${product._id}`)}
                  className="group bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-xl transition-all cursor-pointer flex flex-col"
                >
                  {/* Image */}
                  <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-4 relative">
                    {/* Wishlist Heart */}
                    <button
                      onClick={(e) => toggleWishlist(e, product._id)}
                      className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm z-10 hover:scale-110 transition-transform"
                    >
                      <svg
                        className={`w-5 h-5 ${wishlistIds.includes(product._id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>

                    <img
                      src={`http://localhost:5000${product.images?.[0] || product.image}`}
                      alt={product.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${product.stock <= 0 ? 'grayscale opacity-60' : ''}`}
                    />
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase">Out of Stock</span>
                      </div>
                    )}
                    {product.stock > 0 && product.stock < 5 && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded shadow-sm uppercase">Only {product.stock} left</span>
                      </div>
                    )}
                  </div>

                  {/* Category Badge */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">
                        {product.brand?.name || 'Collection'}
                      </span>
                      {product.numReviews > 0 && (
                        <div className="flex items-center gap-1 text-yellow-400">
                          <FiStar size={10} fill="currentColor" />
                          <span className="text-[10px] font-black text-gray-900">{(product.ratings || 0).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-gray-900 line-clamp-1 text-sm md:text-base mb-1">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="mt-auto">
                    <p className="text-[24px] font-black text-black-900">₹{product.price}</p>

                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock <= 0}
                      className="w-full mt-3 bg-[#ff5252] text-white text-xs font-bold py-2.5 rounded-lg hover:bg-red-500 transition-colors uppercase tracking-wider disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                      {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No products found.</p>
              <button onClick={() => navigate('/')} className="mt-4 text-red-500 font-bold hover:underline">
                View all products
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 gap-2">
              {/* Previous Button */}
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                    window.scrollTo(0, 0);
                  }
                }}
                disabled={currentPage === 1}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors border ${currentPage === 1
                  ? 'text-gray-300 border-gray-100 cursor-not-allowed'
                  : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <FiChevronLeft size={20} />
              </button>

              {/* Page Numbers */}
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentPage(i + 1); window.scrollTo(0, 0); }}
                  className={`w-10 h-10 rounded-lg font-bold transition-colors ${currentPage === i + 1
                    ? 'bg-red-500 text-white'
                    : 'border border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                >
                  {i + 1}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => {
                  if (currentPage < totalPages) {
                    setCurrentPage(prev => prev + 1);
                    window.scrollTo(0, 0);
                  }
                }}
                disabled={currentPage === totalPages}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors border ${currentPage === totalPages
                  ? 'text-gray-300 border-gray-100 cursor-not-allowed'
                  : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Feature Bar Section */}
        <div className="mt-20">
          <HomeFeatures />
        </div>
      </div>
    </div >
  );
}