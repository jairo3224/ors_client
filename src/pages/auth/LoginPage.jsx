// src/pages/auth/LoginPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login, isLoggedIn, isLoading: authLoading } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';

  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (!authLoading && isLoggedIn) navigate(from, { replace: true });
  }, [isLoggedIn, authLoading, navigate, from]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.email)    errs.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password) errs.password = 'Password is required.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});

    try {
      const user = await login(form.email, form.password);

      const roleRoutes = {
        'OSAS':            '/osas',
        'Guidance Office': '/guidance',
        'Chaplain':        '/chaplain',
        'Department Head': '/chairperson',
        'Teacher':         '/teacher',
      };

      const dest = roleRoutes[user.role_name] || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || 'Login failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-root">
      {/* Decorative background */}
      <div className="login-bg">
        <div className="login-bg__orb login-bg__orb--1" />
        <div className="login-bg__orb login-bg__orb--2" />
        <div className="login-bg__grid" />
      </div>

      <div className="login-card">
        {/* Header */}
        <div className="login-card__header">
          <div className="login-card__logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="currentColor" fillOpacity=".12"/>
              <path d="M20 8L32 14V22C32 28.627 26.627 34 20 34C13.373 34 8 28.627 8 22V14L20 8Z"
                stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M15 21L18.5 24.5L25 17" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="login-card__title">Student Incident<br />Tracking System</h1>
          <p className="login-card__subtitle">Sign in to your institutional account</p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {errors.general && (
            <div className="login-form__alert" role="alert">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {errors.general}
            </div>
          )}

          <div className={`login-form__field ${errors.email ? 'login-form__field--error' : ''}`}>
            <label htmlFor="email" className="login-form__label">Email Address</label>
            <div className="login-form__input-wrap">
              <svg className="login-form__icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="login-form__input"
                placeholder="you@institution.edu"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            {errors.email && <span className="login-form__error">{errors.email}</span>}
          </div>

          <div className={`login-form__field ${errors.password ? 'login-form__field--error' : ''}`}>
            <label htmlFor="password" className="login-form__label">Password</label>
            <div className="login-form__input-wrap">
              <svg className="login-form__icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              <input
                id="password"
                name="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                className="login-form__input"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                className="login-form__toggle-pass"
                onClick={() => setShowPass(s => !s)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? (
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="login-form__error">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="login-form__submit"
            disabled={loading}
          >
            {loading ? (
              <span className="login-form__spinner" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="login-card__footer">
          Having trouble? Contact your system administrator.
        </p>
      </div>
    </div>
  );
}
