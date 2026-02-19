import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (roles && roles.length && !roles.includes(user.role)) {
    return <div style={{ padding: 24 }}>Access denied</div>;
  }

  return children;
};

export default ProtectedRoute;
