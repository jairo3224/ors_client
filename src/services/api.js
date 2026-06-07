import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/ors-backend/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
}, error => Promise.reject(error));

export default api;