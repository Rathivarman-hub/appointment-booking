import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { bookingService } from '../services/bookingService';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../context/AuthContext';

const OrganiserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBookings = () => {
    setLoading(true);
    bookingService.getAllBookings()
      .then(({ data }) => setBookings(data.data.bookings))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleConfirm = async (id) => {
    try {
      await bookingService.confirmBooking(id);
      toast.success('Booking confirmed');
      fetchBookings();
    } catch {
      toast.error('Failed to confirm');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel/Reject this booking?')) return;
    try {
      await bookingService.cancelBooking(id, { reason: 'Organiser rejected/cancelled' });
      toast.success('Booking cancelled');
      fetchBookings();
    } catch { 
      toast.error('Failed to cancel'); 
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content w-100">
        <h4 className="fw-bold mb-4">
          <i className="bi bi-list-check me-2 text-primary"></i>
          {user?.role === 'admin' ? 'All Platform Bookings' : 'My Event Bookings'}
        </h4>

        {loading ? (
          <div className="text-center py-5"><span className="spinner-border text-primary" /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-calendar-x fs-1 text-muted"></i>
            <p className="text-muted mt-3">No bookings found.</p>
          </div>
        ) : (
          <div className="card">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Event</th>
                    <th>Customer</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td className="fw-semibold">{b.appointmentTypeId?.title || 'Unknown Event'}</td>
                      <td>
                        <div className="small">
                          <strong>{b.userId?.fullName || 'User'}</strong><br/>
                          <span className="text-muted">{b.userId?.email || 'No email'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          <div>{new Date(b.date).toDateString()}</div>
                          <div className="text-muted">{b.slotTime?.start} – {b.slotTime?.end}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge badge-${b.status}`}>
                          {b.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${b.paymentStatus === 'paid' ? 'bg-success' : b.paymentStatus === 'not_required' ? 'bg-secondary' : 'bg-warning'}`}>
                          {b.paymentStatus.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {b.status === 'pending' && (
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-success" onClick={() => handleConfirm(b._id)}>
                              <i className="bi bi-check-lg"></i>
                            </button>
                            <button className="btn btn-outline-danger" onClick={() => handleCancel(b._id)}>
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </div>
                        )}
                        {b.status === 'confirmed' && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(b._id)}>
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganiserBookings;
