import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.login(form);
      login(data.data.token, data.data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card shadow-lg">
        <div className="text-center mb-4">
          <div style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>
            <i className="bi bi-calendar-check-fill"></i>
          </div>
          <h2 className="fw-bold mt-2">Welome Back</h2>
          <p className="text-muted">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-envelope"></i></span>
              <input type="email" name="email" className="form-control" placeholder="you@email.com"
                value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-lock"></i></span>
              <input type="password" name="password" className="form-control" placeholder="••••••••"
                value={form.password} onChange={handleChange} required />
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div></div>
            <Link to="/forgot-password" className="text-primary small">Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Don't have an account? <Link to="/register" className="text-primary fw-semibold">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
