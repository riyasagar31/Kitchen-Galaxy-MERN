// src/pages/LogoutPage.jsx
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LogoutPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear auth state and redirect
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Logging out...</h2>
        <p className="text-gray-600">You are being redirected to the login page.</p>
      </div>
    </div>
  );
}
