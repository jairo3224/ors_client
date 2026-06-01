import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost/osas-server/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Dashboard stats ───────────────────────────────────────────────
export const getStats = () => api.get('/stats.php');

// ── Referrals ─────────────────────────────────────────────────────
export const getReferrals  = (params) => api.get('/referrals.php', { params });
export const getReferral   = (id)     => api.get(`/referrals.php?id=${id}`);
export const createReferral = (data)  => api.post('/referrals.php', data);
export const updateReferral = (id, data) => api.put(`/referrals.php?id=${id}`, data);
export const deleteReferral = (id)    => api.delete(`/referrals.php?id=${id}`);

// ── Reports ───────────────────────────────────────────────────────
export const getReports    = (params) => api.get('/reports.php', { params });

// ── Users ─────────────────────────────────────────────────────────
export const getUsers      = (params) => api.get('/users.php', { params });
export const createUser    = (data)   => api.post('/users.php', data);
export const updateUser    = (id, data) => api.put(`/users.php?id=${id}`, data);
export const deleteUser    = (id)     => api.delete(`/users.php?id=${id}`);

export default api;
