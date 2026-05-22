import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { bookingService } from '../services/bookingService';
import Sidebar from '../components/common/Sidebar';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    bookingService.getMyBookings()
      .then(({ data }) => setBookings(data.data.bookings))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingService.cancelBooking(id, { reason: 'User cancelled' });
      toast.success('Booking cancelled');
      fetchBookings();
    } catch { toast.error('Failed to cancel'); }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content w-100">
        <h4 className="fw-bold mb-4"><i className="bi bi-bookmark-check me-2 text-primary"></i>My Bookings</h4>

        {loading ? (
          <div className="text-center py-5"><span className="spinner-border text-primary" /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-calendar-x fs-1 text-muted"></i>
            <p className="text-muted mt-3">No bookings yet. <a href="/appointments">Book one now!</a></p>
          </div>
        ) : (
          <div className="row g-3">
            {bookings.map((b) => (
              <div key={b._id} className="col-md-6">
                <div className="card p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="fw-bold mb-0">{b.appointmentTypeId?.title || 'Appointment'}</h6>
                    <span className={`status-badge badge-${b.status}`}>{b.status}</span>
                  </div>
                  <div className="text-muted small">
                    <p className="mb-1"><i className="bi bi-calendar me-2"></i>{new Date(b.date).toDateString()}</p>
                    <p className="mb-1"><i className="bi bi-clock me-2"></i>{b.slotTime.start} – {b.slotTime.end}</p>
                    <p className="mb-0"><i className="bi bi-credit-card me-2"></i>
                      Payment: <span className={b.paymentStatus === 'paid' ? 'text-success' : 'text-muted'}>{b.paymentStatus}</span>
                    </p>
                  </div>
                  {['pending', 'confirmed'].includes(b.status) && (
                    <button className="btn btn-outline-danger btn-sm mt-2"
                      onClick={() => handleCancel(b._id)}>
                      <i className="bi bi-x-circle me-1"></i>Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
