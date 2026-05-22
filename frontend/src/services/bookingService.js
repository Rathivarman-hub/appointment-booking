import api from './api';

export const bookingService = {
  getSlots:       (apptId, params) => api.get(`/bookings/slots/${apptId}`, { params }),
  createBooking:  (data)           => api.post('/bookings', data),
  confirmBooking: (id)             => api.put(`/bookings/${id}/confirm`),
  cancelBooking:  (id, data)       => api.put(`/bookings/${id}/cancel`, data),
  reschedule:     (id, data)       => api.put(`/bookings/${id}/reschedule`, data),
  getMyBookings:  ()               => api.get('/bookings/my'),
  getAllBookings: ()               => api.get('/bookings/all'),
};

export const appointmentService = {
  getAll:       ()          => api.get('/appointments'),
  getById:      (id)        => api.get(`/appointments/${id}`),
  create:       (data)      => api.post('/appointments', data),
  update:       (id, data)  => api.put(`/appointments/${id}`, data),
  remove:       (id)        => api.delete(`/appointments/${id}`),
  togglePublish:(id)        => api.patch(`/appointments/${id}/publish`),
};
