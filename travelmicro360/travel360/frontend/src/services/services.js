import api from './api';

export const bookingService = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  getByCustomer: (customerId, params) => api.get('/bookings', { params: { customerId, ...params } }),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id) => api.put(`/bookings/${id}`, { status: 'CANCELLED' }),
};

export const partnerService = {
  getAll: (params) => api.get('/partners', { params }),
  getById: (id) => api.get(`/partners/${id}`),
};

export const inventoryService = {
  getAll: (params) => api.get('/inventories', { params }),
  getById: (id) => api.get(`/inventories/${id}`),
};

export const invoiceService = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
};

export const paymentService = {
  getAll: (params) => api.get('/payments', { params }),
  create: (data) => api.post('/payments', data),
};

export const reservationService = {
  getAll: (params) => api.get('/reservations', { params }),
  create: (data) => api.post('/reservations', data),
};

export const itineraryService = {
  getAll: (params) => api.get('/itineraries', { params }),
  getById: (id) => api.get(`/itineraries/${id}`),
};

export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  getByUser: (userId) => api.get('/notifications', { params: { userId } }),
};

export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
};

