import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCartSidebar } from '../context/CartSidebarContext.jsx';
import { FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import HeroSlider from '../components/HeroSlider.jsx';
import HomeFeatures from '../components/HomeFeatures.jsx';
import BrandSlider from '../components/BrandSlider.jsx';
import CategoryBanner from '../components/CategoryBanner.jsx';

const API_URL = 'http://localhost:5000/api';

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function Home() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { openSidebar } = useCartSidebar();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 100000]);

  // --- PAGINATION SETTINGS: 20 ITEMS PER PAGE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSelectedCategory(params.get('category') || "All");
    setSelectedSubCategory(params.get('subCategory') || null);
    setSelectedBrand(params.get('brand') || "All");
    setSearchTerm(params.get('search') || "");
    if (params.get('minPrice') || params.get('maxPrice')) {
      setPriceRange([parseInt(params.get('minPrice') || 0), parseInt(params.get('maxPrice') || 1000000)]);
    }
    setCurrentPage(1);
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/products`);
        setProducts(shuffleArray(res.data || []));
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchTerm.trim() === "" || product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesCategory = selectedCategory === "All" || (product.category?.name === selectedCategory);
    const matchesSubCategory = !selectedSubCategory || (product.subCategory?.name === selectedSubCategory);
    const productBrandValue = product.brand?.name || product.brand || "";
    const matchesBrand = selectedBrand === "All" || productBrandValue.toString().trim().toLowerCase() === selectedBrand.trim().toLowerCase();
    return matchesSearch && matchesCategory && matchesSubCategory && matchesBrand && matchesPrice;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const [wishlistIds, setWishlistIds] = useState([]);
  useEffect(() => { if (user) fetchWishlist(); }, [user]);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWishlistIds((res.data.products || []).map(p => p._id));
    } catch (err) { console.error(err); }
  };

  const toggleWishlist = async (e, productId) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    try {
      await axios.post(`${API_URL}/wishlist/toggle`, { productId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWishlistIds(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
      toast.success("Wishlist updated");
    } catch (err) { toast.error("Error"); }
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    try {
      await addToCart(product);
      openSidebar();
      toast.success("Added to cart");
    } catch (err) { toast.error("Error"); }
  };

  const isFilterActive = selectedCategory !== "All" || selectedSubCategory || selectedBrand !== "All" || searchTerm;

  const dynamicTitle = selectedSubCategory
    ? selectedSubCategory
    : (selectedCategory !== "All" ? selectedCategory : (selectedBrand !== "All" ? selectedBrand : "Our Products"));

  return (
    <div className="w-full min-h-screen bg-gray-50">

      {/* --- CURVED & CONTAINED SLIDER --- */}
      {!isFilterActive && (
        <div className="max-w-[1400px] mx-auto pt-6 px-4 md:px-8">
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-xl">
            <div className="h-[300px] md:h-[450px] lg:h-[500px]">
              <HeroSlider />
            </div>
          </div>
        </div>
      )}

      {/* --- PRODUCT CONTENT SECTION --- */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-10">
        <div id="featured-products">
          {selectedBrand !== "All" && <BrandSlider />}

          <div className="mb-8 flex justify-between items-center ">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                {dynamicTitle}
              </h3>
              <p className="text-sm text-gray-400">{filteredProducts.length} items found</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-64 bg-gray-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            // --- GRID: 4 PRODUCTS PER LINE ---
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {currentProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/products/${product._id}`)}
                  className="group bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-xl transition-all cursor-pointer flex flex-col"
                >
                  <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-4 relative">
                    <button
                      onClick={(e) => toggleWishlist(e, product._id)}
                      className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm z-10 hover:scale-110 transition-transform"
                    >
                      <svg
                        className={`w-5 h-5 ${wishlistIds.includes(product._id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    <img
                      src={`http://localhost:5000${product.images?.[0] || product.image}`}
                      alt={product.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${product.stock <= 0 ? 'grayscale opacity-60' : ''}`}
                    />
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">
                        {product.brand?.name || 'Collection'}
                      </span>
                      {product.ratings > 0 && (
                        <div className="flex items-center gap-1 text-yellow-400">
                          <FiStar size={10} fill="currentColor" />
                          <span className="text-[10px] font-black text-gray-900">{(product.ratings || 0).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 line-clamp-1 text-sm md:text-base mb-1">{product.name}</h3>

                  <div className="mt-auto">
                    <p className="text-[24px] font-black text-black-900">₹{product.price}</p>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock <= 0}
                      className="w-full mt-3 bg-[#ff5252] text-white text-xs font-bold py-2.5 rounded-lg hover:bg-red-500 transition-colors uppercase tracking-wider disabled:bg-gray-200"
                    >
                      {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Category Banner - Shows after products when a category is selected */}
          {selectedCategory !== 'All' && <CategoryBanner />}

          {/* --- UPDATED PAGINATION AS PER YOUR IMAGE --- */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-20 gap-8">
              {/* Prev Arrow */}
              <button
                onClick={() => { if (currentPage > 1) { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 500, behavior: 'smooth' }); } }}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronLeft size={18} />
              </button>

              {/* Dynamic Page Status Text */}
              <span className="text-xl font-medium text-gray-600">
                Page <span className="text-gray-900 font-bold">{currentPage}</span> of <span className="text-gray-900 font-bold">{totalPages}</span>
              </span>

              {/* Next Arrow */}
              <button
                onClick={() => { if (currentPage < totalPages) { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 500, behavior: 'smooth' }); } }}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 pb-12">
        <HomeFeatures />
      </div>
    </div>
  );
}