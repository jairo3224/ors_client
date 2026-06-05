import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import spacLogo from '../../../assets/spac logo 2.png';
  // fixed filename
import './ChairpersonNavbar.css';

const NAV_ITEMS = [
  { path: '/chairperson',          label: 'Overview',  icon: '📊' },
  { path: '/chairperson/students', label: 'Students',  icon: '👥' },
  { path: '/chairperson/reports',  label: 'Reports',   icon: '📄' },
  { path: '/chairperson/cases',    label: 'Cases',     icon: '🗂️' },
  { path: '/chairperson/inbox',    label: 'Inbox',     icon: '📥' },
];

const SETTINGS_LINK = { path: '/chairperson/settings', label: 'Settings', icon: '⚙️' };

export default function ChairpersonNavbar({
  pendingCount = 0,
  openCaseCount = 0,
  inboxPendingCount = 0,
}) {
  const { user } = useAuth();
  const departmentName = user?.department_name || 'Department';

  return (
    <header className="c-navbar">
      <div className="c-navbar__left">
        <img
          src={spacLogo}
          alt="SPAC Logo"
          className="c-navbar__logo"
          style={{ height: '40px', marginRight: '12px' }}
        />
        <div className="c-navbar__brand">
          <span className="c-navbar__dept">{departmentName}</span>
          <span className="c-navbar__portal">Chairperson Portal</span>
        </div>
      </div>

      <nav className="c-navbar__center">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/chairperson'}
            className={({ isActive }) =>
              `c-navbar__link${isActive ? ' c-navbar__link--active' : ''}`
            }
          >
            <span className="c-navbar__link-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.label === 'Reports' && pendingCount > 0 && (
              <span className="c-navbar__badge c-navbar__badge--danger">{pendingCount}</span>
            )}
            {item.label === 'Cases' && openCaseCount > 0 && (
              <span className="c-navbar__badge c-navbar__badge--warning">{openCaseCount}</span>
            )}
            {item.label === 'Inbox' && inboxPendingCount > 0 && (
              <span className="c-navbar__badge c-navbar__badge--warning">{inboxPendingCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="c-navbar__right">
        <NavLink
          to={SETTINGS_LINK.path}
          className={({ isActive }) =>
            `c-navbar__link${isActive ? ' c-navbar__link--active' : ''}`
          }
        >
          <span className="c-navbar__link-icon">{SETTINGS_LINK.icon}</span>
          <span>{SETTINGS_LINK.label}</span>
        </NavLink>
      </div>
    </header>
  );
}