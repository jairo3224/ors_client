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

  async getDashboard() {
    return this.request('/chaplain/dashboard');
  }

  async getSessions() {
    return this.request('/chaplain/sessions');
  }

  async scheduleSession(sessionData) {
    return this.request('/chaplain/sessions/schedule', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async cancelSession(sessionId) {
    return this.request(`/chaplain/sessions/${sessionId}/cancel`, {
      method: 'POST',
    });
  }

  async completeSession(sessionId) {
    return this.request(`/chaplain/sessions/${sessionId}/complete`, {
      method: 'POST',
    });
  }

  async getAllReferrals() {
    return this.request('/chaplain/referrals/all');
  }

  async acceptReferral(referralId, acceptData) {
    return this.request(`/chaplain/referrals/${referralId}/accept`, {
      method: 'POST',
      body: JSON.stringify(acceptData),
    });
  }

  async returnReferral(referralId, returnData) {
    return this.request(`/chaplain/referrals/${referralId}/return`, {
      method: 'POST',
      body: JSON.stringify(returnData),
    });
  }

  async getNotificationCount() {
    return this.request('/chaplain/notifications/count');
  }

  async getNotifications() {
    return this.request('/chaplain/notifications');
  }

  async markNotificationRead(notificationId) {
    return this.request(`/chaplain/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }
}

export default new ApiService();