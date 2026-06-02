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

export const incidentService = {
  async getMyIncidents() {
    const data = await request('/teacher/incidents');
    return data.data || [];
  },

  async createIncident(payload) {
    const data = await request('/teacher/incidents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.data;
  },

  async getIncident(id) {
    const data = await request(`/incidents/${id}`);
    return data.data;
  },

  async referIncident(incidentId, destinationRole, remarks) {
    const data = await request('/teacher/incidents/refer', {
      method: 'POST',
      body: JSON.stringify({ incident_id: incidentId, destination_role: destinationRole, remarks }),
    });
    return data.data;
  },
};

export default incidentService;
