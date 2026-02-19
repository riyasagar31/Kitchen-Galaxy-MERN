import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { FiShoppingCart, FiChevronDown, FiUser, FiLayout, FiLogOut, FiHeart, FiSearch } from 'react-icons/fi';
import api from '../services/api';

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const { cartItems } = useCart();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [products, setProducts] = useState([]); // For suggestions
  const navigate = useNavigate();
  const location = useLocation();
  const suggestionRef = useRef(null);

  const logo = "/logo.png";
  const itemCount = cartItems?.reduce((total, item) => total + item.qty, 0) || 0;

  const queryParams = new URLSearchParams(location.search);
  const activeCategory = queryParams.get('category') || 'All';
  const activeSubCategory = queryParams.get('subCategory');
  const activeBrand = queryParams.get('brand');

  // 1. Fetch Categories, Brands, and Products (for suggestions)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands'),
          api.get('/products')
        ]);

        const categoryList = Array.isArray(catRes.data) ? catRes.data : (catRes.data.categories || []);
        const preferredOrder = [
          'Kitchen & Dining', 'Kitchen Appliances', 'Kitchen & Linen',
          'Home Decore', 'Storage & Containers', 'Home Appliances'
        ];
        const sortedCategories = categoryList.sort((a, b) => {
          const indexA = preferredOrder.indexOf(a.name);
          const indexB = preferredOrder.indexOf(b.name);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        setCategories(sortedCategories);
        setBrands(Array.isArray(brandRes.data) ? brandRes.data : (brandRes.data.brands || []));
        setProducts(prodRes.data || []);
      } catch (error) {
        console.error('Failed to fetch navbar data:', error);
      }
    };
    fetchData();
  }, []);

  // 2. Sync local search with URL
  useEffect(() => {
    setLocalSearch(queryParams.get('search') || "");
  }, [location.search]);

  // 3. Handle Search Suggestions
  useEffect(() => {
    if (localSearch.trim().length > 1) {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(localSearch.toLowerCase()) ||
        p.category?.name?.toLowerCase().includes(localSearch.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [localSearch, products]);

  // 4. Click outside suggestions to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
    setShowSuggestions(true);
  };

  const executeSearch = (searchTerm) => {
    const params = new URLSearchParams(location.search);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    // If searching from a subcategory or category, keep those filters? 
    // Usually search is global, so we might want to clear them or keep them based on UX.
    // User said "name filter according to sub category", so let's keep them if they exist.
    navigate(`/?${params.toString()}`);
    setShowSuggestions(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeSearch(localSearch);
    }
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/login');
  };

  // Navigation Helpers (same as CategoryNavbar)
  const handleCategoryClick = (categoryName) => {
    if (categoryName === 'All') {
      navigate('/home');
    } else {
      navigate(`/home?category=${encodeURIComponent(categoryName)}`);
    }
  };

  const handleSubCategoryClick = (categoryName, subCategoryName) => {
    navigate(`/home?category=${encodeURIComponent(categoryName)}&subCategory=${encodeURIComponent(subCategoryName)}`);
    setActiveDropdown(null);
  };

  const handleBrandClick = (brandName) => {
    navigate(`/home?brand=${encodeURIComponent(brandName)}`);
    setActiveDropdown(null);
  };

  if (loading) {
    return (
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm sticky top-0 z-[100] h-20">
        <div className="h-12 w-12 bg-gray-50 animate-pulse rounded-full"></div>
        <div className="h-10 w-1/2 bg-gray-50 animate-pulse rounded-2xl"></div>
        <div className="h-12 w-12 bg-gray-50 animate-pulse rounded-full"></div>
      </nav>
    );
  }

  return (
    <header className="sticky top-0 z-[100] bg-white shadow-sm">
      {/* --- ROW 1: BRAND, SEARCH, AUTH --- */}
      <nav className="flex items-center px-8 py-4 h-20 border-b border-gray-100">
        {/* LEFT: Logo */}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="flex items-center group">
            <img
              src={logo}
              alt="Kitchen Galaxy"
              className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              onError={(e) => { e.target.src = 'https://placehold.co/150?text=KG+Logo'; }}
            />
          </Link>
        </div>

        {/* CENTER: Search Bar */}
        <div className="flex-1 flex justify-center relative" ref={suggestionRef}>
          <div className="hidden lg:flex relative w-full max-w-[500px]">
            <input
              type="text"
              placeholder="Search for premium kitchen essentials..."
              value={localSearch}
              onChange={handleSearchChange}
              onKeyDown={onKeyDown}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-[#f1f3f5] border-none rounded-2xl py-3.5 pl-14 pr-4 text-sm focus:ring-2 focus:ring-[#ff5252] transition-all outline-none text-gray-600 font-medium"
            />
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-full max-w-[500px] bg-white border border-gray-100 rounded-2xl shadow-2xl py-4 z-[110] overflow-hidden">
              <p className="px-6 mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Suggestions</p>
              {suggestions.map((p) => (
                <button
                  key={p._id}
                  onClick={() => {
                    setLocalSearch(p.name);
                    executeSearch(p.name);
                  }}
                  className="w-full text-left px-6 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={`http://localhost:5000${p.images?.[0] || p.image}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{p.name}</p>
                    <p className="text-[10px] text-[#ff5252] font-black uppercase tracking-tighter">{p.category?.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Nav & Cart */}
        <div className="flex-1 flex justify-end items-center gap-2">
          {(!user || user.role === 'customer') && (
            <div className="flex items-center">
              <button
                onClick={() => navigate(user ? '/customer/cart' : '/login')}
                className="relative p-2 text-gray-700 hover:text-[#ff5252] transition-colors flex items-center group"
              >
                <div className="relative">
                  <FiShoppingCart size={28} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#ff5252] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white">
                      {itemCount}
                    </span>
                  )}
                </div>
              </button>
              <span className="mx-4 text-gray-300 font-light">|</span>
            </div>
          )}

          <Link to="/" className="px-4 py-2 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:text-[#ff5252] transition-all text-lg">Home</Link>

          {!user ? (
            <div className="flex items-center gap-1">
              <Link to="/login" className="px-4 py-2 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:text-[#ff5252] transition-all text-lg">Login</Link>
              <Link to="/register" className="px-4 py-2 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:text-[#ff5252] transition-all text-lg">Register</Link>
            </div>
          ) : (
            <div className="relative border-l pl-6 ml-2">
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 group focus:outline-none">
                <div className="w-10 h-10 bg-red-50 text-[#ff5252] flex items-center justify-center rounded-full font-bold group-hover:bg-[#ff5252] group-hover:text-white transition-all shadow-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <p className="font-bold text-gray-800 text-sm truncate max-w-[100px]">{user?.name}</p>
                  <p className="text-[9px] text-gray-400 uppercase font-black tracking-tighter">{user?.role}</p>
                </div>
                <FiChevronDown className={`transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-60 bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-[110] overflow-hidden">
                  <div className="px-4 py-3 border-b bg-gray-50 mb-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Account</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{user?.email}</p>
                  </div>
                  <Link to={user.role === 'customer' ? "/customer/home" : user.role === 'seller' ? "/seller" : "/admin/dashboard"} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-[#ff5252]" onClick={() => setShowProfileMenu(false)}>
                    <FiLayout size={18} /> Dashboard
                  </Link>
                  <Link to="/customer/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-[#ff5252]" onClick={() => setShowProfileMenu(false)}>
                    <FiHeart size={18} /> My Wishlist
                  </Link>
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-[#ff5252]" onClick={() => setShowProfileMenu(false)}>
                    <FiUser size={18} /> My Profile
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 border-t mt-1 transition-colors">
                    <FiLogOut size={18} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* --- ROW 2: CATEGORIES & BRANDS --- */}
      <div className="hidden lg:block bg-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-8 relative">
          <div className="flex items-center justify-start gap-1 py-1 overflow-visible flex-nowrap min-w-max">
            {/* ALL */}
            <button
              onClick={() => handleCategoryClick('All')}
              className={`text-[11px] font-black uppercase tracking-widest px-4 py-3 rounded-md transition-all duration-300 ${activeCategory === 'All' && !activeBrand ? 'text-[#ff5252]' : 'text-gray-500 hover:text-gray-900'}`}
            >
              ALL
            </button>

            {/* BRANDS */}
            <div
              className="relative py-1"
              onMouseEnter={() => setActiveDropdown('Brands')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-widest px-4 py-3 rounded-md transition-all duration-300 ${activeBrand ? 'text-[#ff5252]' : 'text-gray-500 hover:text-gray-900'}`}>
                BRANDS <FiChevronDown className={`transition-transform duration-200 ${activeDropdown === 'Brands' ? 'rotate-180' : ''}`} />
              </button>

              {activeDropdown === 'Brands' && (
                <div className="fixed left-8 right-8 mt-1 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-gray-100 rounded-xl p-8 z-[90] animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="mb-4 pb-2 border-b border-gray-50">
                    <p className="text-[12px] font-black text-[#ff5252] uppercase tracking-widest">Shop by Brands</p>
                  </div>
                  <div className="grid grid-cols-6 gap-y-4 gap-x-8">
                    {brands.map(brand => (
                      <button
                        key={brand._id}
                        onClick={() => handleBrandClick(brand.name)}
                        className="text-left text-[11px] font-black text-gray-600 hover:text-[#ff5252] uppercase tracking-tighter transition-colors"
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CATEGORIES */}
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="relative py-1"
                onMouseEnter={() => setActiveDropdown(cat.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-widest px-4 py-3 rounded-md transition-all duration-300 ${activeCategory === cat.name && !activeBrand ? 'text-[#ff5252]' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  {cat.name}
                  {cat.subcategories?.length > 0 && <FiChevronDown className={`transition-transform duration-200 ${activeDropdown === cat.name ? 'rotate-180' : ''}`} />}
                </button>

                {cat.subcategories?.length > 0 && activeDropdown === cat.name && (
                  <div className="absolute top-full left-0 w-60 bg-white border border-gray-100 rounded-xl shadow-2xl py-3 z-[95] animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-5 pb-2 mb-1 border-b border-gray-50">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Shop by {cat.name}</p>
                    </div>
                    {cat.subcategories.map((sub) => (
                      <button
                        key={sub._id}
                        onClick={() => handleSubCategoryClick(cat.name, sub.name)}
                        className={`w-full text-left px-5 py-2.5 text-[10px] font-black uppercase tracking-tighter transition-all ${activeSubCategory === sub.name ? 'text-[#ff5252] bg-red-50/50 border-l-2 border-[#ff5252]' : 'text-gray-600 hover:text-[#ff5252] hover:bg-gray-50'}`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle Backdrop Overlay */}
      {activeDropdown && (
        <div className="fixed inset-0 top-[120px] bg-black/5 backdrop-blur-[1px] z-[70] pointer-events-none" />
      )}
    </header>
  );
};

export default Navbar;