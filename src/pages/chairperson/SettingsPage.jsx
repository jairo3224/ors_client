import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const serverError = err.response?.data?.errors?.current_password ||
                          err.response?.data?.message ||
                          'Failed to change password. Please check your current password.';
      setError(serverError);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <h1 className="page-title">⚙️ Settings</h1>
            <p className="page-subtitle">Manage your account and password</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Profile Information */}
        <div className="card" style={{ maxWidth: 520, width: '100%', marginBottom: 24 }}>
        <h3 className="card__title">Profile Information</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div>
            <span className="form-label">Name</span>
            <div className="input" style={{ background: '#f7f9fc', cursor: 'default', color: '#1a3a5c' }}>
              {user?.first_name} {user?.last_name}
            </div>
          </div>
          <div>
            <span className="form-label">Email</span>
            <div className="input" style={{ background: '#f7f9fc', cursor: 'default', color: '#1a3a5c' }}>
              {user?.email || 'Not available'}
            </div>
          </div>
          <div>
            <span className="form-label">Role</span>
            <div className="input" style={{ background: '#f7f9fc', cursor: 'default', color: '#1a3a5c' }}>
              {user?.role_name || 'Department Head'}
            </div>
          </div>
          <div>
            <span className="form-label">Department</span>
            <div className="input" style={{ background: '#f7f9fc', cursor: 'default', color: '#1a3a5c' }}>
              {user?.department_name || 'Not assigned'}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card" style={{ maxWidth: 520, width: '100%', marginBottom: 24 }}>
        <h3 className="card__title">Change Password</h3>
        {message && (
          <div style={{ background: '#e8f5e9', borderLeft: '4px solid #2e7d32', padding: '10px 14px', borderRadius: 6, marginBottom: 16, color: '#2e7d32', fontWeight: 500 }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ background: '#fce4ec', borderLeft: '4px solid #c62828', padding: '10px 14px', borderRadius: 6, marginBottom: 16, color: '#c62828', fontWeight: 500 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: '14px' }}>
          <div>
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="input"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" className="btn" disabled={loading} style={{ justifySelf: 'start' }}>
            {loading ? 'Changing...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Logout */}
      <div className="card" style={{ maxWidth: 520, width: '100%' }}>
        <h3 className="card__title">Session</h3>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 12 }}>
          Sign out of your account.
        </p>
        <button className="btn btn--danger" onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  </div>
  );
}