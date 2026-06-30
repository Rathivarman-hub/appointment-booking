import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bookingService, appointmentService } from '../services/bookingService';
import Sidebar from '../components/common/Sidebar';

const steps = ['Select Date', 'Choose Slot', 'Fill Details', 'Confirm'];

const BookingFlow = () => {
  const { apptId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [appt, setAppt] = useState(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    appointmentService.getById(apptId).then(({ data }) => {
      setAppt(data.data.appointment);
      setAnswers(data.data.appointment.questions.map((q) => ({ questionId: q._id, label: q.label, answer: '' })));
    });
  }, [apptId]);

  const fetchSlots = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const { data } = await bookingService.getSlots(apptId, { date });
      setSlots(data.data.slots);
      setStep(1);
    } catch { toast.error('Failed to fetch slots'); }
    finally { setLoading(false); }
  };

  const handleBook = async () => {
    setLoading(true);
    try {
      await bookingService.createBooking({
        appointmentTypeId: apptId,
        date,
        slotTime: selectedSlot,
        answers,
      });
      toast.success('Booking created successfully!');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  if (!appt) return <div className="text-center py-5"><span className="spinner-border text-primary" /></div>;

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content w-100">
        <div className="mb-4">
          <h4 className="fw-bold"><i className="bi bi-calendar-plus me-2 text-primary"></i>Book: {appt.title}</h4>
          <p className="text-muted">{appt.duration} min session</p>
        </div>

        {/* Stepper */}
        <div className="d-flex align-items-center mb-4 gap-0">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className="d-flex flex-column align-items-center">
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: i <= step ? 'var(--primary)' : '#e5e7eb',
                  color: i <= step ? '#fff' : '#9ca3af',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '.9rem',
                }}>{i + 1}</div>
                <small className="mt-1" style={{ color: i === step ? 'var(--primary)' : '#9ca3af', fontSize: '.7rem', whiteSpace: 'nowrap' }}>{s}</small>
              </div>
              {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? 'var(--primary)' : '#e5e7eb', marginBottom: 20 }}></div>}
            </React.Fragment>
          ))}
        </div>

        <div className="card p-4" style={{ maxWidth: 600 }}>
          {/* Step 0: Date */}
          {step === 0 && (
            <div>
              <h5 className="fw-semibold mb-3">Select a Date</h5>
              <input type="date" className="form-control mb-3" value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)} />
              <button className="btn btn-primary" onClick={fetchSlots} disabled={!date || loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                Check Available Slots
              </button>
            </div>
          )}

          {/* Step 1: Slot */}
          {step === 1 && (
            <div>
              <h5 className="fw-semibold mb-3">Choose a Time Slot</h5>
              <p className="text-muted small mb-3">Date: <strong>{new Date(date).toDateString()}</strong></p>
              {slots.length === 0 ? (
                <p className="text-muted">No slots available for this day.</p>
              ) : (
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {slots.map((slot) => (
                    <button key={slot.start} disabled={!slot.available}
                      className={`slot-btn ${selectedSlot?.start === slot.start ? 'selected' : ''}`}
                      onClick={() => setSelectedSlot(slot)}>
                      {slot.start}
                      {!slot.available && <span className="ms-1 text-danger" style={{ fontSize: '.7rem' }}>Full</span>}
                    </button>
                  ))}
                </div>
              )}
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary" onClick={() => setStep(0)}>Back</button>
                <button className="btn btn-primary" disabled={!selectedSlot} onClick={() => setStep(2)}>Next</button>
              </div>
            </div>
          )}

          {/* Step 2: Questions */}
          {step === 2 && (
            <div>
              <h5 className="fw-semibold mb-3">Additional Details</h5>
              {answers.length === 0 ? (
                <p className="text-muted">No additional questions required.</p>
              ) : (
                answers.map((ans, i) => (
                  <div key={i} className="mb-3">
                    <label className="form-label fw-semibold">{ans.label}</label>
                    <input type="text" className="form-control"
                      value={ans.answer}
                      onChange={(e) => {
                        const copy = [...answers];
                        copy[i].answer = e.target.value;
                        setAnswers(copy);
                      }} />
                  </div>
                ))
              )}
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary" onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>Review</button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div>
              <h5 className="fw-semibold mb-3">Confirm Booking</h5>
              <div className="alert alert-info">
                <p className="mb-1"><strong>Appointment:</strong> {appt.title}</p>
                <p className="mb-1"><strong>Date:</strong> {new Date(date).toDateString()}</p>
                <p className="mb-1"><strong>Time:</strong> {selectedSlot?.start} – {selectedSlot?.end}</p>
                <p className="mb-0"><strong>Duration:</strong> {appt.duration} min</p>
              </div>
              {appt.advancePayment?.required && (
                <div className="alert alert-warning">
                  <i className="bi bi-credit-card me-2"></i>
                  Advance payment of <strong>₹{appt.advancePayment.amount}</strong> is required.
                </div>
              )}
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary" onClick={() => setStep(2)}>Back</button>
                <button className="btn btn-success" onClick={handleBook} disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-check2 me-1"></i>}
                  Confirm Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
