import api from './api';

export const authService = {
  register:      (data) => api.post('/auth/register', data),
  verifyOTP:     (data) => api.post('/auth/verify-otp', data),
  login:         (data) => api.post('/auth/login', data),
  forgotPassword:(data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  getMe:         ()     => api.get('/auth/me'),
};
