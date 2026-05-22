import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { appointmentService } from '../services/bookingService';
import Sidebar from '../components/common/Sidebar';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    appointmentService.getAll()
      .then(({ data }) => setAppointments(data.data.appointments))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content w-100">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold"><i className="bi bi-calendar3 me-2 text-primary"></i>Appointments</h4>
            <p className="text-muted mb-0">Browse available hackathon slots</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5"><span className="spinner-border text-primary" /></div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-calendar-x fs-1 text-muted"></i>
            <p className="text-muted mt-3">No appointments available yet</p>
          </div>
        ) : (
          <div className="row g-3">
            {appointments.map((appt) => (
              <div key={appt._id} className="col-md-4">
                <div className="card h-100 p-3">
                  <div className="d-flex align-items-center mb-2">
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: appt.color, marginRight: 10 }}></div>
                    <h6 className="fw-bold mb-0">{appt.title}</h6>
                    {appt.isPublished
                      ? <span className="badge bg-success ms-auto">Published</span>
                      : <span className="badge bg-secondary ms-auto">Draft</span>}
                  </div>
                  <p className="text-muted small mb-2">{appt.description || 'No description'}</p>
                  <div className="d-flex gap-3 text-muted small mb-3">
                    <span><i className="bi bi-clock me-1"></i>{appt.duration} min</span>
                    <span><i className="bi bi-people me-1"></i>Max {appt.maxPerSlot}/slot</span>
                  </div>
                  {appt.advancePayment?.required && (
                    <div className="alert alert-warning py-1 small mb-2">
                      <i className="bi bi-credit-card me-1"></i>
                      Advance payment: ₹{appt.advancePayment.amount}
                    </div>
                  )}
                  <button
                    className="btn btn-primary btn-sm mt-auto"
                    onClick={() => navigate(`/book/${appt._id}`)}
                  >
                    <i className="bi bi-calendar-plus me-1"></i>Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
