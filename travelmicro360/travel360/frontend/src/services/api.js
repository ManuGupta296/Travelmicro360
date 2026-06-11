import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9090/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('t360_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Only logout on 401 (invalid/missing auth).
// 403 = "your role lacks permission for this endpoint" and is handled by pages.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('t360_token');
      localStorage.removeItem('t360_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
