// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import authService from '../services/authService';

// ── Role constants (matches DB seed data) ──────────────────────────────────
export const ROLES = {
  OSAS:            'OSAS',
  GUIDANCE:        'Guidance Office',
  CHAPLAIN:        'Chaplain',
  DEPARTMENT_HEAD: 'Department Head',
  TEACHER:         'Teacher',
};

// ── Reducer ────────────────────────────────────────────────────────────────
const initialState = {
  user:        null,
  isLoading:   true,   // true on mount while we check existing session
  isLoggedIn:  false,
  error:       null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user:       action.payload,
        isLoggedIn: true,
        isLoading:  false,
        error:      null,
      };

    case 'LOGOUT':
      return {
        ...state,
        user:       null,
        isLoggedIn: false,
        isLoading:  false,
        error:      null,
      };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount: try to restore session via /me (uses existing access token)
  // If that fails, try to refresh (uses HttpOnly cookie)
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!authService.hasToken()) {
        // No token locally — try silent refresh via cookie
        try {
          await authService.refresh();
          const user = await authService.me();
          if (!cancelled) dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } catch {
          if (!cancelled) dispatch({ type: 'LOGOUT' });
        }
        return;
      }

      try {
        const user = await authService.me();
        if (!cancelled) dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch (err) {
        if (err.status === 401) {
          // Access token expired — try refresh
          try {
            await authService.refresh();
            const user = await authService.me();
            if (!cancelled) dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          } catch {
            if (!cancelled) dispatch({ type: 'LOGOUT' });
          }
        } else {
          if (!cancelled) dispatch({ type: 'LOGOUT' });
        }
      }
    }

    restoreSession();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await authService.login(email, password);
      dispatch({ type: 'LOGIN_SUCCESS', payload: result.user });
      return result.user;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    dispatch({ type: 'LOGOUT' });
    await authService.logout();
  }, []);

  const hasRole = useCallback(
    (...roles) => roles.includes(state.user?.role_name),
    [state.user]
  );

  return (
    <AuthContext.Provider value={{ ...state, login, logout, hasRole, ROLES }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
