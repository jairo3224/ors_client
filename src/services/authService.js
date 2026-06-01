// src/services/authService.js

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
      credentials: 'include', // send/receive HttpOnly cookie (refresh token)
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

const authService = {
  /**
   * POST /auth/login
   * Stores access_token in localStorage on success.
   */
  async login(email, password) {
    localStorage.removeItem('access_token');

    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.data?.access_token) {
        localStorage.setItem('access_token', data.data.access_token);
      }

      return data.data; // { access_token, token_type, expires_in, user }
    } catch (err) {
      localStorage.removeItem('access_token');
      throw err;
    }
  },

  /**
   * POST /auth/logout
   * Clears local token storage.
   */
  async logout() {
    localStorage.removeItem('access_token');

    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore backend logout failures; local token state is already cleared.
    } finally {
      localStorage.removeItem('access_token');
    }
  },

  /**
   * POST /auth/refresh
   * Uses the HttpOnly refresh cookie — no token needed in header.
   */
  async refresh() {
    const data = await request('/auth/refresh', { method: 'POST' });

    if (data.data?.access_token) {
      localStorage.setItem('access_token', data.data.access_token);
    }

    return data.data;
  },

  /**
   * GET /auth/me
   * Returns the currently authenticated user.
   */
  async me() {
    const data = await request('/auth/me');
    return data.data?.user || null;
  },

  /**
   * Check if an access token exists locally (does not validate expiry).
   */
  hasToken() {
    return !!localStorage.getItem('access_token');
  },
};

export default authService;
