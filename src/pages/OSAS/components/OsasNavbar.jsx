import { useState, useRef, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import spacLogo from '../../../assets/spac logo 2.png';
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
  const schoolYear = '';
  const TRACK_WIDTH = 60;
  const THUMB_WIDTH = 14;
  const THUMB_RANGE = TRACK_WIDTH - THUMB_WIDTH;

  const navRef = useRef(null);
  const trackRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const updateIndicator = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const progress = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
    setScrollProgress(progress);
  }, []);

  const scrollToProgress = useCallback((progress) => {
    const el = navRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollLeft = progress * maxScroll;
  }, []);

  const handleTrackClick = useCallback((e) => {
    if (isDragging) return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, (x - THUMB_WIDTH / 2) / THUMB_RANGE));
    scrollToProgress(progress);
  }, [isDragging, scrollToProgress]);

  const handleThumbMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    updateIndicator();
    el.addEventListener('scroll', updateIndicator);
    window.addEventListener('resize', updateIndicator);
    return () => {
      el.removeEventListener('scroll', updateIndicator);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [updateIndicator]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const progress = Math.max(0, Math.min(1, (x - THUMB_WIDTH / 2) / THUMB_RANGE));
      scrollToProgress(progress);
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, scrollToProgress]);

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
          <img src={spacLogo} alt="Logo" className="osas-navbar__logo" />
          <div className="c-navbar__brand-text">
            <span className="c-navbar__dept">Office of Student Affairs and Services</span>
            <span className="c-navbar__portal">OSAS Portal</span>
          </div>
        </div>

        <nav className="c-navbar__nav" ref={navRef}>
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
      <div className="osas-navbar__scrollbar">
        <div className="osas-navbar__scrollbar-track" ref={trackRef} onClick={handleTrackClick}>
          <div className="osas-navbar__scrollbar-thumb" style={{ left: `${scrollProgress * THUMB_RANGE}px` }} onMouseDown={handleThumbMouseDown} />
        </div>
      </div>
    </header>
  );
}
