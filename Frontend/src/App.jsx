import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile.jsx';
import ResetPassword from './pages/ResetPassword';
import Footer from './pages/Footer.jsx';

// Seller
import SellerLayout from './layouts/SellerLayout';
import SellerDashboard from './pages/seller/SellerDashboard';
import ManageProduct from './pages/seller/ManageProduct.jsx';
import SellerOrders from './pages/seller/SellerOrders.jsx';

// Admin
import AdminLayout from './layouts/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminCategoryRequests from './pages/admin/AdminCategoryRequests.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';
import AdminSubCategories from './pages/admin/AdminSubCategories.jsx';
import AdminSellers from './pages/admin/AdminSellers.jsx';
import AdminBrands from './pages/admin/AdminBrands.jsx';

// New Pages
import AboutUs from './pages/AboutUs.jsx';
import ContactUs from './pages/ContactUs.jsx';

// Customer
import CustomerLayout from './layouts/CustomerLayout.jsx';
import CustomerHome from './pages/customer/CustomerHome.jsx';
import CustomerOrders from './pages/customer/CustomerOrders.jsx';
import CustomerCart from './pages/customer/CustomerCart.jsx';
import Checkout from './pages/customer/Checkout.jsx';
import Wishlist from './pages/customer/Wishlist.jsx';

import { Toaster } from 'react-hot-toast';

function RequireAuth({ children, allowedRole }) {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('token');

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff5252]"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-right" />
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            {/* Admin routes */}
            <Route
              path="/admin"
              element={<RequireAuth allowedRole="admin"><AdminLayout /></RequireAuth>}
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="requests" element={<AdminCategoryRequests />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="subcategories" element={<AdminSubCategories />} />
              <Route path="sellers" element={<AdminSellers />} />
              <Route path="brands" element={<AdminBrands />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Seller routes */}
            <Route
              path="/seller"
              element={<RequireAuth allowedRole="seller"><SellerLayout /></RequireAuth>}
            >
              <Route index element={<SellerDashboard />} />
              <Route path="orders" element={<SellerOrders />} />
              <Route path="products" element={<ManageProduct />} />
            </Route>

            {/* Customer routes - FIXED PATHS HERE */}
            <Route
              path="/customer"
              element={<RequireAuth allowedRole="customer"><CustomerLayout /></RequireAuth>}
            >
              <Route path="home" element={<CustomerHome />} />
              <Route path="orders" element={<CustomerOrders />} />
              <Route path="cart" element={<CustomerCart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route index element={<Navigate to="home" replace />} />
            </Route>

            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}