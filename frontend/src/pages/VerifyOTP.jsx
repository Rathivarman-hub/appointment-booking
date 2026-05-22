import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const userId = searchParams.get('userId');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.verifyOTP({ userId, otp });
      login(data.data.token, data.data.user);
      toast.success('Account verified! Welcome!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card shadow-lg text-center">
        <div style={{ fontSize: '3rem', color: 'var(--primary)' }}>
          <i className="bi bi-shield-lock-fill"></i>
        </div>
        <h2 className="fw-bold mt-3">Verify Your Email</h2>
        <p className="text-muted">We've sent a 6-digit OTP to your email.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              className="form-control text-center fs-3 fw-bold letter-spacing-wide"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/, ''))}
              required
              style={{ letterSpacing: '12px', fontSize: '2rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading || otp.length < 6}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Verifying...</> : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
