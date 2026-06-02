import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const NAV_ITEMS = [
  { path: '/guidance',            label: 'Home',       icon: '🏠' },
  { path: '/guidance/referrals',  label: 'Referrals',  icon: '📋' },
  { path: '/guidance/counseling', label: 'Counseling', icon: '🧠' },
  { path: '/guidance/meetings',   label: 'Meetings',   icon: '📅' },
];

export default function GuidanceNavbar({ pendingCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const name = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Guidance';
  const roleName = user?.role_name || 'Guidance Office';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="c-navbar">
      <div className="c-navbar__left">
        <div className="c-navbar__brand">
          <span className="c-navbar__dept">Guidance Office</span>
          <span className="c-navbar__portal">Student Support Hub</span>
        </div>
        <nav className="c-navbar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/guidance'}
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
          <span className="c-navbar__username">{name}</span>
          <span className="c-navbar__role">{roleName}</span>
        </div>
        <button onClick={handleLogout} className="c-navbar__logout">Sign Out</button>
      </div>
    </header>
  );
}
