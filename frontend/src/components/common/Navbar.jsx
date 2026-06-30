import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('Logged out');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm px-4">
      <Link className="navbar-brand" to="/">
        <i className="bi bi-calendar-check-fill me-2" style={{ color: 'var(--primary)' }}></i>
        HackBook
      </Link>
      <div className="ms-auto d-flex align-items-center gap-3">
        {user ? (
          <>
            <span className="text-muted small">
              <i className="bi bi-person-circle me-1"></i>
              {user.fullName}
              <span className={`ms-2 badge ${user.role === 'admin' ? 'bg-danger' : user.role === 'organiser' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                {user.role}
              </span>
            </span>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i>Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline-primary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
