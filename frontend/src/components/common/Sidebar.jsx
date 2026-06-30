import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); toast.info('Logged out'); navigate('/login'); };

  const customerLinks = [
    { to: '/dashboard', icon: 'bi-grid', label: 'Dashboard' },
    { to: '/appointments', icon: 'bi-calendar3', label: 'Appointments' },
    { to: '/my-bookings', icon: 'bi-bookmark-check', label: 'My Bookings' },
  ];

  const organiserLinks = [
    ...customerLinks,
    { to: '/manage-appointments', icon: 'bi-calendar-plus', label: 'Manage Slots' },
    { to: '/organiser/bookings', icon: 'bi-list-check', label: 'All Bookings' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: 'bi-grid', label: 'Dashboard' },
    { to: '/admin/users', icon: 'bi-people', label: 'Users' },
    { to: '/admin/reports', icon: 'bi-bar-chart', label: 'Reports' },
    { to: '/appointments', icon: 'bi-calendar3', label: 'Appointments' },
    { to: '/admin/bookings', icon: 'bi-journal-text', label: 'All Bookings' },
  ];

  const links = user?.role === 'admin' ? adminLinks
    : user?.role === 'organiser' ? organiserLinks
    : customerLinks;

  return (
    <div className="sidebar d-flex flex-column">
      <div className="sidebar-brand">
        <i className="bi bi-calendar-check-fill me-2"></i>HackBook
      </div>
      <nav className="flex-grow-1">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className={`bi ${link.icon}`}></i>{link.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-top border-secondary mt-auto">
        <div className="text-light small mb-2 px-2">
          <i className="bi bi-person-circle me-2"></i>{user?.fullName}
          <span className="ms-2 badge bg-secondary">{user?.role}</span>
        </div>
        <button className="btn btn-outline-light btn-sm w-100" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2"></i>Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
