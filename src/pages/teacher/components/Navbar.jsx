import { useAuth } from '../../../context/AuthContext';
import spacLogo from '../../../assets/spaclogo2.png';
import './Navbar.css';

const NAV_ITEMS = [
  { key: 'classes', label: 'My Classes',     icon: '📚' },
  { key: 'report',  label: 'Report Incident', icon: '📝' },
  { key: 'reports', label: 'My Reports',      icon: '📋' },
  { key: 'search',  label: 'Student Lookup',  icon: '🔍' },
];

export default function Navbar({ activeView, pendingCount, onNavigate }) {
  const { user, logout } = useAuth();

  const fullName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim();
  const deptName = user?.department_name ?? 'Faculty';
  const roleName = user?.role_name ?? 'Teacher';

  return (
    <header className="c-navbar">
      <div className="c-navbar__left">
        <div className="c-navbar__brand">
          <img src={spacLogo} alt="Logo" className="c-navbar__logo" />
          <div>
            <span className="c-navbar__dept">{deptName}</span>
            <span className="c-navbar__portal">Teacher Portal</span>
          </div>
        </div>

        <nav className="c-navbar__nav">
          {NAV_ITEMS.map(item => {
            const isActive = activeView === item.key || (item.key === 'classes' && activeView === 'roster');
            return (
              <button
                key={item.key}
                className={`c-navbar__link${isActive ? ' c-navbar__link--active' : ''}`}
                onClick={() => {
                  if (item.key === 'classes') {
                    onNavigate('classes', { resetSubject: true });
                  } else {
                    onNavigate(item.key);
                  }
                }}
              >
                <span className="c-navbar__link-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.key === 'reports' && pendingCount > 0 && (
                  <span className="c-navbar__badge c-navbar__badge--danger">{pendingCount}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="c-navbar__right">
        <div className="c-navbar__user">
          <span className="c-navbar__username">{fullName}</span>
          <span className="c-navbar__role">{roleName}</span>
        </div>
        <button className="c-navbar__logout" onClick={logout}>Sign Out</button>
      </div>
    </header>
  );
}
