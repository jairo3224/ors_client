const API_BASE = 'http://localhost/ors-backend/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getToken() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.access_token || '';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      let response = await fetch(url, config);

      if (response.status === 401 && !options._retry) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          config.headers['Authorization'] = `Bearer ${this.getToken()}`;
          config._retry = true;
          response = await fetch(url, config);
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Network error - server may be offline');
      }
      throw error;
    }
  }

  async refreshToken() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.access_token) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.access_token = data.access_token;
        localStorage.setItem('user', JSON.stringify(user));
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return false;
  }

  // Auth
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Convenience HTTP method wrappers
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // Chaplain endpoints
  getDashboard = () => this.request('/chaplain/dashboard');
  getSessions = () => this.request('/chaplain/sessions');
  scheduleSession = (sessionData) => this.request('/chaplain/sessions/schedule', { method: 'POST', body: JSON.stringify(sessionData) });
  cancelSession = (sessionId) => this.request(`/chaplain/sessions/${sessionId}/cancel`, { method: 'POST' });
  completeSession = (sessionId) => this.request(`/chaplain/sessions/${sessionId}/complete`, { method: 'POST' });
  getAllReferrals = () => this.request('/chaplain/referrals/all');
  acceptReferral = (referralId, acceptData) => this.request(`/chaplain/referrals/${referralId}/accept`, { method: 'POST', body: JSON.stringify(acceptData) });
  returnReferral = (referralId, returnData) => this.request(`/chaplain/referrals/${referralId}/return`, { method: 'POST', body: JSON.stringify(returnData) });
  getNotificationCount = () => this.request('/chaplain/notifications/count');
  getNotifications = () => this.request('/chaplain/notifications');
  markNotificationRead = (notificationId) => this.request(`/chaplain/notifications/${notificationId}/read`, { method: 'POST' });
}

export default new ApiService();
