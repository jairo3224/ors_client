import authService from './authService';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/ors-backend/api';

async function request(path, options = {}) {
  let token = localStorage.getItem('access_token');
  const getHeaders = (t) => ({
    'Content-Type': 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
    ...options.headers,
  });
  let res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: getHeaders(token),
    credentials: 'include',
  });
  if (res.status === 401) {
    try {
      await authService.refresh();
      token = localStorage.getItem('access_token');
      res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: getHeaders(token),
        credentials: 'include',
      });
    } catch {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
  }
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    err.errors = data.errors || null;
    throw err;
  }
  return data;
}

export const osasService = {
  async getIncidents() {
    const data = await request('/teacher/incidents');
    return data.data?.incidents || data.data || [];
  },

  async createReferral(incidentId, destinationRole, remarks) {
    const data = await request('/teacher/incidents/refer', {
      method: 'POST',
      body: JSON.stringify({ incident_id: incidentId, destination_role: destinationRole, remarks }),
    });
    return data.data;
  },

  async getUsers() {
    const data = await request('/osas/users');
    return data.data || [];
  },

  async createUser(payload) {
    const data = await request('/osas/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.data;
  },

  async updateUser(id, payload) {
    const data = await request(`/osas/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return data.data;
  },

  async deleteUser(id) {
    const data = await request(`/osas/users/${id}`, {
      method: 'DELETE',
    });
    return data.data;
  },

  async getSettings() {
    const data = await request('/osas/settings');
    return data.data || {};
  },

  async updateSettings(payload) {
    const data = await request('/osas/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return data.data;
  },

  async getSanctions() {
    const data = await request('/osas/sanctions');
    return data.data || [];
  },

  async createSanction(payload) {
    const data = await request('/osas/sanctions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.data;
  },

  async getMeetings() {
    const data = await request('/osas/meetings');
    return data.data || [];
  },

  async createMeeting(payload) {
    const data = await request('/osas/meetings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.data;
  },

  async getAnalytics() {
    const data = await request('/osas/analytics');
    return data.data || {};
  },

  async getAttachments() {
    const data = await request('/osas/attachments');
    return data.data || [];
  },

  async uploadAttachment(payload) {
    const data = await request('/osas/attachments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.data;
  },

  async deleteAttachment(id) {
    const data = await request(`/osas/attachments/${id}`, {
      method: 'DELETE',
    });
    return data.data;
  },

  async getAuditLogs() {
    const data = await request('/osas/audit-logs');
    return data.data || [];
  },

  async getAssessments() {
    const data = await request('/osas/assessments');
    return data.data || [];
  },

  async updateAssessment(id, payload) {
    const data = await request(`/osas/assessments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return data.data;
  },

  async getOverview() {
    const data = await request('/osas/overview');
    return data.data || {};
  },

  async getReferrals() {
    const data = await request('/osas/referrals');
    return data.data || [];
  },

  async updateIncident(id, payload) {
    const data = await request(`/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return data.data;
  },

  async updateSanction(id, payload) {
    const data = await request(`/osas/sanctions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return data.data;
  },

  async updateMeeting(id, payload) {
    const data = await request(`/osas/meetings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return data.data;
  },

  async updateReferral(id, payload) {
    const data = await request(`/osas/referrals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return data.data;
  },
};

export default osasService;
