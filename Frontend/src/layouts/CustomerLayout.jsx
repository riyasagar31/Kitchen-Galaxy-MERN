import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { FiHome, FiGrid, FiShoppingBag, FiUser, FiLogOut, FiShoppingCart, FiMenu, FiChevronLeft } from "react-icons/fi";
import { useCart } from "../context/CartContext.jsx"; // Access cart logic
import { useAuth } from "../context/AuthContext.jsx"; // Access user logic

export default function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, cartTotal } = useCart();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const role = "customer";

  const handleLogout = () => {
    logout(); // Uses context to clear state and storage
    navigate("/login");
  };

  const navLinks = [
    { to: `/${role}/dashboard`, label: "Dashboard", icon: <FiGrid /> },
    { to: `/${role}/orders`, label: "My Orders", icon: <FiShoppingBag /> },
    { to: `/profile`, label: "Profile", icon: <FiUser /> },
    { to: `/${role}/cart`, label: "Cart", icon: <FiUser /> },
  ];

  const showWelcome = location.pathname === `/${role}/home`;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#ff5252] text-white flex flex-col shadow-xl transition-all duration-300`}>
        {/* Branding */}
        <div className="h-16 flex items-center justify-between px-4 bg-[#e04848]">
          {isSidebarOpen && <span className="font-bold text-xl tracking-wider uppercase">Kitchen Galaxy</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded hover:bg-[#c63f3f]">
            {isSidebarOpen ? <FiChevronLeft size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-6 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                  ? "bg-white text-[#ff5252] shadow-md transform scale-105"
                  : "text-white hover:bg-[#e04848]"
                } ${!isSidebarOpen && 'justify-center'}`
              }
              title={!isSidebarOpen ? link.label : ''}
            >
              <span className={`text-lg ${isSidebarOpen ? 'mr-3' : ''}`}>{link.icon}</span>
              {isSidebarOpen && <span className="font-medium">{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-[#e04848]">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-[#e04848] hover:bg-[#c63f3f] transition-all ${!isSidebarOpen ? 'justify-center' : ''}`}
            title={!isSidebarOpen ? 'Logout' : ''}
          >
            <FiLogOut className={isSidebarOpen ? "mr-2" : ""} /> {isSidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <div className="p-4 sm:p-8">
          {/* Main page content renders here */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm min-h-[calc(100vh-120px)] p-6 sm:p-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}