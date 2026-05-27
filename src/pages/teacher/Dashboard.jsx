import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  async function handleLogout() { await logout(); navigate('/login'); }
  return (
    <div style={{ minHeight: '100dvh', background: '#f0f4f8', padding: '32px', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ color: '#1a3a5c' }}>{user?.role_name} Dashboard</h1>
        <p style={{ color: '#64748b' }}>Welcome, {user?.first_name} {user?.last_name}!</p>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Department: {user?.department_name || 'Institution-wide'}</p>
        <button onClick={handleLogout} style={{ marginTop: 24, padding: '10px 20px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Sign Out</button>
      </div>
    </div>
  );
}
