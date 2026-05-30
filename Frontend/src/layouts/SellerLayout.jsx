import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { FiLogOut, FiGrid, FiBox, FiShoppingBag, FiUser, FiMenu, FiChevronLeft } from "react-icons/fi";
import { useAuth } from "../context/AuthContext"; // 1. Import useAuth

export default function SellerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout, user } = useAuth(); // 2. Destructure logout and user

  const role = "seller";

  const handleLogout = () => {

    logout(); // 3. Use the global logout function (this clears state + storage)
    navigate("/"); // 4. Redirect to Home instead of Login for a cleaner exit

    // localStorage.removeItem("token");
    // localStorage.removeItem("sellerToken");
    // navigate("/login");
  };

  const navLinks = [
    { to: `/${role}`, label: "Dashboard", icon: <FiGrid /> },
    { to: `/${role}/products`, label: "Manage Products", icon: <FiBox /> },
    { to: `/${role}/orders`, label: "Orders", icon: <FiShoppingBag /> },
    { to: `/profile`, label: "Profile", icon: <FiUser /> },
  ];

  const showWelcome = location.pathname === `/${role}`;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#ff5252] text-white flex flex-col transition-all duration-300`}>
        <div className="h-16 flex items-center justify-between px-4 bg-[#e04848]">
          {isSidebarOpen && <span className="font-bold text-xl tracking-wider">Kitchen Galaxy</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded hover:bg-[#c63f3f]">
            {isSidebarOpen ? <FiChevronLeft size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive
                  ? "bg-white text-[#ff5252]"
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

        <div className="p-4 border-t border-[#e04848]">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e04848] hover:bg-[#c63f3f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff5252] ${!isSidebarOpen ? 'justify-center' : ''}`}
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
            <div className="mb-4 text-2xl font-bold text-gray-800">
              Welcome back, {role}!
            </div>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
