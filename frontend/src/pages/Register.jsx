import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';

const Register = () => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'customer' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.register(form);
      toast.success('Registered! Check your email for OTP.');
      navigate(`/verify-otp?userId=${data.data.userId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card shadow-lg">
        <div className="text-center mb-4">
          <div style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>
            <i className="bi bi-person-plus-fill"></i>
          </div>
          <h2 className="fw-bold mt-2">Create Account</h2>
          <p className="text-muted">Join the hackathon platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Full Name</label>
            <input type="text" name="fullName" className="form-control" placeholder="John Doe"
              value={form.fullName} onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input type="email" name="email" className="form-control" placeholder="you@email.com"
              value={form.email} onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input type="password" name="password" className="form-control" placeholder="Min 6 characters"
              value={form.password} onChange={handleChange} required minLength={6} />
          </div>


          <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating...</> : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Already have an account? <Link to="/login" className="text-primary fw-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
