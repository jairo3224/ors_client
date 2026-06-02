// pages/chaplain/components/TopNavbar.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function TopNavbar({ darkMode, setDarkMode, unreadNotifications }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const chaplainNav = [
    { label: 'Dashboard', icon: '📊', path: '/chaplain/dashboard' },
    { label: 'Referrals', icon: '📨', path: '/chaplain/referrals', badge: true },
    { label: 'My Sessions', icon: '📅', path: '/chaplain/sessions' }
  ];

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #2e1a47 0%, #4a2d6e 100%)',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>
        {/* Logo & Brand - Clickable to Dashboard */}
        <div 
          onClick={() => handleNavClick('/chaplain/dashboard')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            cursor: 'pointer',
            padding: '8px',
            borderRadius: 8,
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          title="Go to Dashboard"
        >
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20
          }}>
            ✝️
          </div>
          <div>
            <h3 style={{ 
              color: '#fff', 
              fontSize: '16px', 
              fontWeight: 600, 
              margin: 0,
              lineHeight: 1.2
            }}>
              Chaplain Portal
            </h3>
            <p style={{ 
              color: 'rgba(255,255,255,0.7)', 
              fontSize: '11px', 
              margin: 0 
            }}>
              Pastoral Care Module
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flex: 1,
          justifyContent: 'center',
          margin: '0 32px'
        }}
        className="desktop-nav"
        >
          {chaplainNav.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavClick(item.path)}
              style={{
                background: isActive(item.path) 
                  ? 'rgba(255,255,255,0.2)' 
                  : 'transparent',
                border: 'none',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: isActive(item.path) ? 600 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                position: 'relative',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
              title={`Go to ${item.label}`}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && unreadNotifications > 0 && item.label === 'Referrals' && (
                <span style={{
                  background: '#d93025',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: '11px',
                  fontWeight: 600,
                  marginLeft: 4
                }}>
                  {unreadNotifications}
                </span>
              )}
              {isActive(item.path) && (
                <div style={{
                  position: 'absolute',
                  bottom: -2,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 20,
                  height: 3,
                  background: '#fff',
                  borderRadius: 2
                }} />
              )}
            </button>
          ))}
        </div>

        {/* Right Side Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Notification Bell */}
          <button
            onClick={() => handleNavClick('/chaplain/notifications')}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              padding: '8px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 16,
              color: '#fff',
              transition: 'all 0.2s',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="View Notifications"
          >
            🔔
            {unreadNotifications > 0 && (
              <span style={{
                position: 'absolute',
                top: -4,
                right: -4,
                background: '#d93025',
                color: '#fff',
                width: 20,
                height: 20,
                borderRadius: '50%',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              padding: '8px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 16,
              color: '#fff',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* User Menu */}
          <div style={{ position: 'relative' }} ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                background: userMenuOpen ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
                padding: '8px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!userMenuOpen) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!userMenuOpen) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
              title="User Menu"
            >
              <span>👤</span>
              <span className="user-name">{user?.first_name || 'User'}</span>
              <span style={{ 
                fontSize: '10px',
                transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s'
              }}>
                ▼
              </span>
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                minWidth: 240,
                overflow: 'hidden',
                zIndex: 1001,
                animation: 'slideDown 0.2s ease'
              }}>
                {/* User Info Header */}
                <div style={{
                  padding: '20px 16px',
                  borderBottom: '1px solid #e2e8f0',
                  background: 'linear-gradient(135deg, #f3e8fd 0%, #f8fafc 100%)'
                }}>
                  <div style={{ 
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: '#4a2d6e',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    fontWeight: 600,
                    marginBottom: 8
                  }}>
                    {user?.first_name?.charAt(0) || 'U'}
                  </div>
                  <div style={{ fontWeight: 600, color: '#2e1a47', fontSize: '15px' }}>
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>
                    {user?.email || 'Pastoral Counselor'}
                  </div>
                  <div style={{ 
                    display: 'inline-block',
                    marginTop: 8,
                    padding: '2px 8px',
                    background: '#4a2d6e',
                    color: '#fff',
                    borderRadius: 4,
                    fontSize: '11px',
                    fontWeight: 500
                  }}>
                    Pastoral Counselor
                  </div>
                </div>

                {/* Menu Options */}
                <div style={{ padding: '8px' }}>
                  <button
                    onClick={() => handleNavClick('/chaplain/sessions')}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'transparent',
                      color: '#333',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      borderRadius: 8,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f3e8fd';
                      e.currentTarget.style.color = '#4a2d6e';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#333';
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>📅</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>My Sessions</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Manage your counseling sessions</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('/chaplain/referrals')}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'transparent',
                      color: '#333',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      borderRadius: 8,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f3e8fd';
                      e.currentTarget.style.color = '#4a2d6e';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#333';
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>📨</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>Referral Inbox</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {unreadNotifications > 0 ? `${unreadNotifications} pending` : 'View referrals'}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'transparent',
                      color: '#333',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      borderRadius: 8,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f3e8fd';
                      e.currentTarget.style.color = '#4a2d6e';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#333';
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{darkMode ? '☀️' : '🌙'}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{darkMode ? 'Light Mode' : 'Dark Mode'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Switch theme</div>
                    </div>
                  </button>
                </div>

                {/* Logout */}
                <div style={{ 
                  padding: '8px',
                  borderTop: '1px solid #e2e8f0',
                  background: '#f8fafc'
                }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'transparent',
                      color: '#d93025',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      borderRadius: 8,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fef2f2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>🚪</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>Sign Out</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Logout from your account</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            style={{
              display: 'none',
              background: mobileMenuOpen ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
              border: 'none',
              padding: '8px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 20,
              color: '#fff',
              transition: 'all 0.2s'
            }}
            title="Toggle Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          margin: '8px 0',
          padding: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          animation: 'slideDown 0.2s ease'
        }}>
          {chaplainNav.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavClick(item.path)}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: 'none',
                background: isActive(item.path) ? '#f3e8fd' : 'transparent',
                color: isActive(item.path) ? '#4a2d6e' : '#333',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '15px',
                fontWeight: isActive(item.path) ? 600 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderRadius: 8,
                transition: 'all 0.2s',
                borderBottom: index < chaplainNav.length - 1 ? '1px solid #f1f5f9' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && unreadNotifications > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: '#d93025',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  {unreadNotifications}
                </span>
              )}
            </button>
          ))}
          
          <div style={{ 
            marginTop: 8, 
            paddingTop: 8, 
            borderTop: '1px solid #e2e8f0' 
          }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: 'none',
                background: 'transparent',
                color: '#d93025',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '15px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderRadius: 8,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '18px' }}>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .user-name {
            display: none;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
}