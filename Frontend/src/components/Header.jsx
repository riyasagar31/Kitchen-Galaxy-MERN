import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/light.css';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="header">
      <div className="brand">Kitchen Galaxy</div>
      <div className="nav">
        {!user ? (
          <>
            <Link to="/login" className="btn">Login</Link>
            <Link to="/register" className="btn">Register</Link>
          </>
        ) : (
          <button className="btn" onClick={() => { logout(); navigate('/'); }}>Logout</button>
        )}
      </div>
    </div>
  );
}
