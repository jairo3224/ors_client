import { useState, useSyncExternalStore } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { mockStore } from '../../../shared/mockStore';
import { LayoutDashboard, ShieldAlert, ArrowLeftRight, Ban, MessageSquare, BarChart3, Users, Settings, ClipboardList, Paperclip, Calendar } from 'lucide-react';
import '../../chairperson/components/ChairpersonNavbar.css';
import './OsasNavbar.css';

const NAV_ITEMS = [
  { path: '/osas',             label: 'Overview',      icon: LayoutDashboard },
  { path: '/osas/incidents',   label: 'Incidents',     icon: ShieldAlert },
  { path: '/osas/referrals',   label: 'Referrals',     icon: ArrowLeftRight },
  { path: '/osas/sanctions',   label: 'Sanctions',     icon: Ban },
  { path: '/osas/response',    label: 'Response',      icon: MessageSquare },
  { path: '/osas/meetings',    label: 'Meetings',      icon: Calendar },
  { path: '/osas/analytics',   label: 'Records',       icon: BarChart3 },
  { path: '/osas/users',       label: 'Users',         icon: Users },
  { path: '/osas/settings',    label: 'Settings',      icon: Settings },
  { path: '/osas/audit',       label: 'Audit Log',     icon: ClipboardList },
  { path: '/osas/attachments', label: 'Attachments',   icon: Paperclip },
];

export default function OsasNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const schoolYear = useSyncExternalStore(mockStore.subscribe, () => mockStore.getState().settings.schoolYear);

  const userName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Admin';
  const roleName = user?.role_name || 'OSAS';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="c-navbar osas-navbar">
      <div className="c-navbar__left">
        <div className="c-navbar__brand">
          <img src="/spac logo 2.png" alt="Logo" className="osas-navbar__logo" />
          <div className="c-navbar__brand-text">
            <span className="c-navbar__dept">Office of Student Affairs and Services</span>
            <span className="c-navbar__portal">OSAS Portal</span>
          </div>
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
              <span className="c-navbar__link-icon"><item.icon size={14} /></span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="c-navbar__right">
        <span className="c-navbar__year">{schoolYear}</span>
        <div className="c-navbar__user">
          <span className="c-navbar__username">{userName}</span>
          <span className="c-navbar__role">{roleName}</span>
        </div>
        <button onClick={handleLogout} className="c-navbar__logout">Sign Out</button>
      </div>
    </header>
  );
}
