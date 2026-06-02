import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../guidance/Navbar.css';

const NAV_ITEMS = [
  { path: '/chaplain',             label: 'Home',         icon: '🏠' },
  { path: '/chaplain/referrals',   label: 'Referrals',    icon: '📋' },
  { path: '/chaplain/spiritual',   label: 'Spiritual Care', icon: '🙏' },
  { path: '/chaplain/meetings',    label: 'Meetings',     icon: '📅' },
];

export default function ChaplainNavbar({ pendingCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const name = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Chaplain';
  const roleName = user?.role_name || 'Chaplain';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="c-navbar">
      <div className="c-navbar__left">
        <div className="c-navbar__brand">
          <span className="c-navbar__dept">Chaplain</span>
          <span className="c-navbar__portal">Spiritual & Pastoral Care</span>
        </div>
        <nav className="c-navbar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/chaplain'}
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
