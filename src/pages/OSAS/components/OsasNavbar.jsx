import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './OsasNavbar.css';

const NAV_ITEMS = [
  { path: '/osas',            label: 'Home',         icon: '🏠' },
  { path: '/osas/referrals',  label: 'Referrals',    icon: '📋' },
  { path: '/osas/reports',    label: 'Reports',      icon: '📄' },
  { path: '/osas/sanctions',  label: 'Sanctions',    icon: '⚖️' },
  { path: '/osas/case-meetings', label: 'Meetings',  icon: '📅' },
  { path: '/osas/users',      label: 'Users',        icon: '👥' },
  { path: '/osas/settings',   label: 'Settings',     icon: '⚙️' },
  { path: '/osas/audit-log',  label: 'Audit Log',    icon: '📜' },
];

export default function OsasNavbar({ pendingCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const osasName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'OSAS';
  const roleName = user?.role_name || 'OSAS';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="c-navbar">
      <div className="c-navbar__left">
        <div className="c-navbar__brand">
          <span className="c-navbar__dept">OSAS</span>
          <span className="c-navbar__portal">Faculty Referral Portal</span>
        </div>

        <nav className="c-navbar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/osas'}
              className={({ isActive }) =>
                `c-navbar__link${isActive ? ' c-navbar__link--active' : ''}`
              }
            >
              <span className="c-navbar__link-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.label === 'Referrals' && pendingCount > 0 && (
                <span className="c-navbar__badge c-navbar__badge--danger">{pendingCount}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="c-navbar__right">
        <div className="c-navbar__user">
          <span className="c-navbar__username">{osasName}</span>
          <span className="c-navbar__role">{roleName}</span>
        </div>
        <button onClick={handleLogout} className="c-navbar__logout">Sign Out</button>
      </div>
    </header>
  );
}
