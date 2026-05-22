import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card shadow-lg">
        <div className="text-center mb-4">
          <div style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>
            <i className="bi bi-key-fill"></i>
          </div>
          <h2 className="fw-bold mt-2">Forgot Password</h2>
          <p className="text-muted">Enter your email to reset password</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-semibold">Email</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-envelope"></i></span>
              <input type="email" className="form-control" placeholder="you@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</> : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Remembered your password? <Link to="/login" className="text-primary fw-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
