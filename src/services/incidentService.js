const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/ors-backend/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

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
    const data = await request('/incidents/my');
    return data.data || [];
  },

  async createIncident(payload) {
    const data = await request('/incidents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.data;
  },

  async getIncident(id) {
    const data = await request(`/incidents/${id}`);
    return data.data;
  },
};

export default incidentService;
