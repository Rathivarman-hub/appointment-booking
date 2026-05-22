import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { bookingService } from '../services/bookingService';
import Sidebar from '../components/common/Sidebar';

const StatCard = ({ icon, label, value, color, bg }) => (
  <div className={`stat-card`} style={{ background: bg }}>
    <div className="d-flex justify-content-between align-items-start">
      <div>
        <p className="mb-1 small opacity-75">{label}</p>
        <h2 className="fw-bold mb-0">{value ?? '—'}</h2>
      </div>
      <div style={{ fontSize: '2rem', opacity: .7 }}><i className={`bi ${icon}`}></i></div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myBookings, setMyBookings] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      adminService.getDashboard().then(({ data }) => setStats(data.data));
    }
    bookingService.getMyBookings().then(({ data }) => setMyBookings(data.data.bookings.slice(0, 5)));
  }, [user]);

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content w-100">
        <div className="mb-4">
          <h4 className="fw-bold">
            <i className="bi bi-grid me-2 text-primary"></i>
            Dashboard
          </h4>
          <p className="text-muted">Welcome back, <strong>{user?.fullName}</strong> 👋</p>
        </div>

        {user?.role === 'admin' && stats && (
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <StatCard icon="bi-people-fill" label="Total Users" value={stats.totalUsers} bg="linear-gradient(135deg,#4f46e5,#7c3aed)" />
            </div>
            <div className="col-md-3">
              <StatCard icon="bi-bookmark-fill" label="Total Bookings" value={stats.totalBookings} bg="linear-gradient(135deg,#059669,#10b981)" />
            </div>
            <div className="col-md-3">
              <StatCard icon="bi-check-circle-fill" label="Confirmed" value={stats.confirmedBookings} bg="linear-gradient(135deg,#0284c7,#38bdf8)" />
            </div>
            <div className="col-md-3">
              <StatCard icon="bi-x-circle-fill" label="Cancelled" value={stats.cancelledBookings} bg="linear-gradient(135deg,#dc2626,#f87171)" />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card p-3 text-center h-100">
              <i className="bi bi-calendar-plus fs-2 text-primary mb-2"></i>
              <h6 className="fw-semibold">Book a Slot</h6>
              <p className="text-muted small">Browse and book available hackathon slots</p>
              <Link to="/appointments" className="btn btn-primary btn-sm mt-auto">Browse Now</Link>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 text-center h-100">
              <i className="bi bi-bookmark-check fs-2 text-success mb-2"></i>
              <h6 className="fw-semibold">My Bookings</h6>
              <p className="text-muted small">View, manage and reschedule your bookings</p>
              <Link to="/my-bookings" className="btn btn-outline-success btn-sm mt-auto">View Bookings</Link>
            </div>
          </div>
          {(user?.role === 'organiser' || user?.role === 'admin') && (
            <div className="col-md-4">
              <div className="card p-3 text-center h-100">
                <i className="bi bi-calendar-event fs-2 text-warning mb-2"></i>
                <h6 className="fw-semibold">Manage Appointments</h6>
                <p className="text-muted small">Create and manage appointment types</p>
                <Link to="/manage-appointments" className="btn btn-outline-warning btn-sm mt-auto">Manage</Link>
              </div>
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        {myBookings.length > 0 && (
          <div className="card p-3">
            <h5 className="fw-semibold mb-3">
              <i className="bi bi-clock-history me-2 text-primary"></i>Recent Bookings
            </h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr><th>Appointment</th><th>Date</th><th>Time</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {myBookings.map((b) => (
                    <tr key={b._id}>
                      <td className="fw-semibold">{b.appointmentTypeId?.title || '—'}</td>
                      <td>{new Date(b.date).toLocaleDateString()}</td>
                      <td>{b.slotTime.start} – {b.slotTime.end}</td>
                      <td>
                        <span className={`status-badge badge-${b.status}`}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link to="/my-bookings" className="btn btn-outline-primary btn-sm mt-2">View All</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
