const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/ors-backend/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('access_token');
  const url = `${BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch (networkError) {
    const err = new Error(`Network request failed: ${networkError.message}`);
    err.status = null;
    err.errors = null;
    throw err;
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Ignore invalid JSON responses; we still want to surface HTTP status.
  }

  if (!res.ok) {
    const err = new Error(
      data?.message || `Request failed with status ${res.status}`
    );
    err.status = res.status;
    err.errors = data?.errors || null;
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
