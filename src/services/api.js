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

// Chaplain endpoints
api.getDashboard = () => api.get('/chaplain/dashboard');
api.getSessions = () => api.get('/chaplain/sessions');
api.scheduleSession = (sessionData) => api.post('/chaplain/sessions/schedule', sessionData);
api.cancelSession = (sessionId) => api.post(`/chaplain/sessions/${sessionId}/cancel`);
api.completeSession = (sessionId) => api.post(`/chaplain/sessions/${sessionId}/complete`);
api.getAllReferrals = () => api.get('/chaplain/referrals/all');
api.acceptReferral = (referralId, acceptData) => api.post(`/chaplain/referrals/${referralId}/accept`, acceptData);
api.returnReferral = (referralId, returnData) => api.post(`/chaplain/referrals/${referralId}/return`, returnData);
api.getNotificationCount = () => api.get('/chaplain/notifications/count');
api.getNotifications = () => api.get('/chaplain/notifications');
api.markNotificationRead = (notificationId) => api.post(`/chaplain/notifications/${notificationId}/read`);

export default api;
