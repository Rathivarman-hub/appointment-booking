import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { appointmentService } from '../services/bookingService';
import Sidebar from '../components/common/Sidebar';

const defaultForm = {
  title: '', description: '', duration: 30, slotType: 'fixed',
  maxPerSlot: 1, manualConfirmation: false, isPublished: false,
  color: '#4f46e5', bufferTime: 0,
  workingHours: [
    { day: 'Mon', start: '09:00', end: '17:00', enabled: true },
    { day: 'Tue', start: '09:00', end: '17:00', enabled: true },
    { day: 'Wed', start: '09:00', end: '17:00', enabled: true },
    { day: 'Thu', start: '09:00', end: '17:00', enabled: true },
    { day: 'Fri', start: '09:00', end: '17:00', enabled: true },
    { day: 'Sat', start: '09:00', end: '13:00', enabled: false },
    { day: 'Sun', start: '09:00', end: '13:00', enabled: false },
  ],
};

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAll = () => {
    appointmentService.getAll().then(({ data }) => setAppointments(data.data.appointments));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleWH = (i, field, value) => {
    const wh = [...form.workingHours];
    wh[i][field] = field === 'enabled' ? value : value;
    setForm({ ...form, workingHours: wh });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await appointmentService.update(editId, form);
        toast.success('Updated!');
      } else {
        await appointmentService.create(form);
        toast.success('Created!');
      }
      setShowForm(false);
      setEditId(null);
      setForm(defaultForm);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const handleEdit = (appt) => {
    setForm({ ...appt });
    setEditId(appt._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment type?')) return;
    try { await appointmentService.remove(id); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleTogglePublish = async (id) => {
    try {
      const { data } = await appointmentService.togglePublish(id);
      toast.success(data.message);
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content w-100">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold"><i className="bi bi-calendar-event me-2 text-primary"></i>Manage Appointments</h4>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(defaultForm); }}>
            <i className="bi bi-plus-lg me-1"></i>New Appointment
          </button>
        </div>

        {showForm && (
          <div className="card p-4 mb-4">
            <h5 className="fw-semibold mb-3">{editId ? 'Edit' : 'Create'} Appointment Type</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Title</label>
                  <input name="title" className="form-control" value={form.title} onChange={handleChange} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Duration (min)</label>
                  <input type="number" name="duration" className="form-control" value={form.duration} onChange={handleChange} min={5} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Max Per Slot</label>
                  <input type="number" name="maxPerSlot" className="form-control" value={form.maxPerSlot} onChange={handleChange} min={1} />
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea name="description" className="form-control" rows={2} value={form.description} onChange={handleChange} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Color</label>
                  <input type="color" name="color" className="form-control form-control-color" value={form.color} onChange={handleChange} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Buffer Time (min)</label>
                  <input type="number" name="bufferTime" className="form-control" value={form.bufferTime} onChange={handleChange} min={0} />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <div className="form-check">
                    <input type="checkbox" name="manualConfirmation" className="form-check-input" id="mc"
                      checked={form.manualConfirmation} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="mc">Manual Confirmation</label>
                  </div>
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <div className="form-check">
                    <input type="checkbox" name="isPublished" className="form-check-input" id="pub"
                      checked={form.isPublished} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="pub">Publish</label>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Working Hours</label>
                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead><tr><th>Day</th><th>Enabled</th><th>Start</th><th>End</th></tr></thead>
                      <tbody>
                        {form.workingHours.map((wh, i) => (
                          <tr key={wh.day}>
                            <td><strong>{wh.day}</strong></td>
                            <td>
                              <div className="form-check form-switch mb-0">
                                <input type="checkbox" className="form-check-input" checked={wh.enabled}
                                  onChange={(e) => handleWH(i, 'enabled', e.target.checked)} />
                              </div>
                            </td>
                            <td><input type="time" className="form-control form-control-sm" value={wh.start}
                              disabled={!wh.enabled} onChange={(e) => handleWH(i, 'start', e.target.value)} /></td>
                            <td><input type="time" className="form-control form-control-sm" value={wh.end}
                              disabled={!wh.enabled} onChange={(e) => handleWH(i, 'end', e.target.value)} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  {editId ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr><th>Title</th><th>Duration</th><th>Max/Slot</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: a.color, display: 'inline-block', marginRight: 8 }}></span>
                      <strong>{a.title}</strong>
                    </td>
                    <td>{a.duration} min</td>
                    <td>{a.maxPerSlot}</td>
                    <td>
                      <span className={`badge ${a.isPublished ? 'bg-success' : 'bg-secondary'}`}>
                        {a.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" onClick={() => handleEdit(a)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-outline-warning" onClick={() => handleTogglePublish(a._id)}>
                          <i className={`bi ${a.isPublished ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                        <button className="btn btn-outline-danger" onClick={() => handleDelete(a._id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAppointments;
