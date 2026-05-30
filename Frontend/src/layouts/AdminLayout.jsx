import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { FiLogOut, FiGrid, FiBox, FiUsers, FiShoppingBag, FiLayers, FiTruck, FiMenu, FiChevronLeft } from "react-icons/fi";
import http from "../api/http";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout } = useAuth();

  const role = localStorage.getItem("role") || "admin";

  const handleLogout = async () => {
    try {
      await http.post("/auth/logout");
    } catch (err) {
      console.error("Logout sync failed", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      toast.success("Logged out successfully");
      logout();
      navigate("/");
    }
  };

  const navLinks = [
    { to: `/${role}/dashboard`, label: "Dashboard", icon: <FiGrid /> },
    { to: `/${role}/products`, label: "Products", icon: <FiBox /> },
    { to: `/${role}/categories`, label: "Categories", icon: <FiLayers /> },
    { to: `/${role}/subcategories`, label: "SubCategories", icon: <FiLayers /> },
    { to: `/${role}/brands`, label: "Brands", icon: <FiLayers /> },
    { to: `/${role}/orders`, label: "Orders", icon: <FiShoppingBag /> },
    { to: `/${role}/users`, label: "Users", icon: <FiUsers /> },
    { to: `/${role}/sellers`, label: "Sellers", icon: <FiTruck /> },
    { to: `/${role}/requests`, label: "Category Requests", icon: <FiLayers /> },
    { to: `/profile`, label: "Profile", icon: <FiUsers /> },
  ];

  const showWelcome = location.pathname === `/${role}/dashboard`;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#ff5252] text-white flex flex-col shadow-xl transition-all duration-300 z-20`}>
        <div className="h-16 flex items-center justify-between px-4 bg-[#e04848] flex-shrink-0">
          {isSidebarOpen && <span className="font-bold text-xl tracking-wider">Kitchen Galaxy</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded hover:bg-[#c63f3f]">
            {isSidebarOpen ? <FiChevronLeft size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Navigation - Scrollbar Hidden via CSS class */}
        <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
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

        <div className="p-4 border-t border-[#e04848] flex-shrink-0">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e04848] hover:bg-[#c63f3f] transition-colors focus:outline-none ${!isSidebarOpen ? 'justify-center' : ''}`}
            title={!isSidebarOpen ? 'Logout' : ''}
          >
            <FiLogOut className={isSidebarOpen ? "mr-2" : ""} /> {isSidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <div className="px-6 py-8">
          {showWelcome && (
            <div className="mb-6 text-2xl font-bold text-gray-800 border-b pb-4">
              Welcome back, <span className="capitalize text-[#ff5252]">{role}</span>!
            </div>
          )}
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}