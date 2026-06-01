import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './ChairpersonNavbar.css';

const NAV_ITEMS = [
  { path: '/chairperson',          label: 'Overview',  icon: '📊' },
  { path: '/chairperson/students', label: 'Students',  icon: '👥' },
  { path: '/chairperson/reports',  label: 'Reports',   icon: '📄' },
  { path: '/chairperson/cases',    label: 'Cases',     icon: '🗂️' },
  { path: '/chairperson/inbox',    label: 'Inbox',     icon: '📥' },  // new
];

export default function ChairpersonNavbar({
  pendingCount = 0,
  openCaseCount = 0,
  inboxPendingCount = 0,   // new prop
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const chairpersonName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Chairperson';
  const departmentName = user?.department_name || 'Department';
  const roleName = user?.role_name || 'Department Head';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="c-navbar">
      <div className="c-navbar__left">
        <div className="c-navbar__brand">
          <span className="c-navbar__dept">{departmentName}</span>
          <span className="c-navbar__portal">Chairperson Portal</span>
        </div>

        <nav className="c-navbar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/chairperson'}   // exact match for overview
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
      </div>

      <div className="c-navbar__right">
        <div className="c-navbar__user">
          <span className="c-navbar__username">{chairpersonName}</span>
          <span className="c-navbar__role">{roleName}</span>
        </div>
        <button onClick={handleLogout} className="c-navbar__logout">Sign Out</button>
      </div>
    </header>
  );
}