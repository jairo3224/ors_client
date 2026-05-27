// src/pages/auth/UnauthorizedPage.jsx

import { useNavigate } from 'react-router-dom';
import { useAuth }     from '../../context/AuthContext';

export default function UnauthorizedPage() {
  const navigate        = useNavigate();
  const { logout, user } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '16px',
      fontFamily: 'DM Sans, system-ui, sans-serif', background: '#f0f4f8',
      padding: '24px', textAlign: 'center'
    }}>
      <div style={{ fontSize: '4rem' }}>🚫</div>
      <h1 style={{ color: '#1a3a5c', margin: 0 }}>Access Denied</h1>
      <p style={{ color: '#64748b', maxWidth: '360px', margin: 0 }}>
        You don't have permission to view this page.
        {user && <> You are logged in as <strong>{user.role_name}</strong>.</>}
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '10px 20px', borderRadius: '8px',
            border: '1.5px solid #cbd5e1', background: '#fff',
            cursor: 'pointer', fontWeight: 600, color: '#1e293b'
          }}
        >
          Go Back
        </button>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px', borderRadius: '8px',
            border: 'none', background: '#1a3a5c',
            cursor: 'pointer', fontWeight: 600, color: '#fff'
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
