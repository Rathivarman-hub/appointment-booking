import api from './api';

export const adminService = {
  getUsers:        (params) => api.get('/admin/users', { params }),
  toggleStatus:    (id)     => api.patch(`/admin/users/${id}/toggle-status`),
  updateRole:      (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  getDashboard:    ()       => api.get('/admin/dashboard'),
  getReports:      (params) => api.get('/admin/reports', { params }),
};
