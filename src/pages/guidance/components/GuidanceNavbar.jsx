import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import spacLogo from '../../../assets/spac logo 2.png';
import './GuidanceNavbar.css';

const NAV_ITEMS = [
  { path: '/guidance',              label: 'Overview',           icon: '📊' },
  { path: '/guidance/referrals',    label: 'Referral Inbox',     icon: '📨' },
  { path: '/guidance/sessions',     label: 'Counseling Sessions',icon: '🛋️' },
  { path: '/guidance/cases',        label: 'Case Timeline',      icon: '📋' },
  { path: '/guidance/notifications',label: 'Notifications',      icon: '🔔' },
];

export default function GuidanceNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fullName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || 'Guidance Officer';
  const roleName = user?.role_name || 'Guidance Office';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="guidance-navbar">
      <div className="guidance-navbar__left">
        <div className="guidance-navbar__brand">
          <img src={spacLogo} alt="Logo" className="guidance-navbar__logo" />
          <div className="guidance-navbar__brand-text">
            <span className="guidance-navbar__dept">Guidance Office</span>
            <span className="guidance-navbar__portal">Guidance Portal</span>
          </div>
        </div>

        <nav className="guidance-navbar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/guidance'}
              className={({ isActive }) =>
                `guidance-navbar__link${isActive ? ' guidance-navbar__link--active' : ''}`
              }
            >
              <span className="guidance-navbar__link-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="guidance-navbar__right">
        <div className="guidance-navbar__user">
          <span className="guidance-navbar__username">{fullName}</span>
          <span className="guidance-navbar__role">{roleName}</span>
        </div>
        <button onClick={handleLogout} className="guidance-navbar__logout">
          Sign Out
        </button>
      </div>
    </header>
  );
}
