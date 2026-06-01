import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import spacLogo from '../../../assets/spac logo 2.png';
import './Navbar.css';

const NAV_ITEMS = [
  { key: 'classes', label: 'My Classes',     icon: '📚', path: '/teacher/classes' },
  { key: 'report',  label: 'Report Incident', icon: '📝', path: '/teacher/report' },
  { key: 'reports', label: 'My Reports',      icon: '📋', path: '/teacher/reports' },
  { key: 'search',  label: 'Student Lookup',  icon: '🔍', path: '/teacher/search' },
];

export default function Navbar({ activeView, pendingCount }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fullName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim();

  const handleNavClick = (item) => {
    navigate(item.path);
  };

  return (
    <nav className="navbar-top">
      <div className="navbar-brand">
        <img src={spacLogo} alt="Logo" className="navbar-logo" />
        <div className="navbar-brand-text">
          <span className="navbar-dept">{user?.department_name ?? 'Faculty'}</span>
          <span className="navbar-portal">Teacher Portal</span>
        </div>
      </div>

      <ul className="navbar-links">
        {NAV_ITEMS.map(item => {
          const isActive = activeView === item.key;
          return (
            <li key={item.key}>
              <button
                className={`navbar-link ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.key === 'reports' && pendingCount > 0 && (
                  <span className="navbar-badge">{pendingCount}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="navbar-user">
        <span className="navbar-user-name">{fullName}</span>
        <span className="navbar-role">Teacher</span>
        <button className="navbar-logout" onClick={logout}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}