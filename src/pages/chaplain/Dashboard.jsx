// pages/chaplain/Dashboard.jsx
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/navbar';
import apiService from '../../services/api';
import Footer from '../../components/common/Footer';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isChaplain = user?.role_id === 3;
  
  const isSubPage = location.pathname !== '/chaplain' && location.pathname !== '/chaplain/dashboard';
  
  const [stats, setStats] = useState({
    totalReferred: 0,
    activeCounseling: 0,
    completedSessions: 0,
    studentsThisMonth: 0,
    pendingReferrals: 0,
    casesReturned: 0,
    upcomingSessions: 0,
    unreadNotifications: 0
  });
  const [recentReferrals, setRecentReferrals] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [returnForm, setReturnForm] = useState({
    reason: '',
    notes: '',
    status: 'returned'
  });

  useEffect(() => {
    if (!isChaplain) {
      navigate('/unauthorized');
    }
  }, [isChaplain, navigate]);

  useEffect(() => {
    if (isChaplain) {
      fetchDashboardData();
      loadSavedSessions();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isChaplain]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDashboard();
      if (response.success) {
        setStats(response.data.stats);
        setRecentReferrals(response.data.recentReferrals || []);
        setUpcomingSessions(response.data.upcomingSessions || []);
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await apiService.getNotificationCount();
      if (response.success) {
        setStats(prev => ({ ...prev, unreadNotifications: response.data.count }));
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const loadSavedSessions = () => {
    const savedSessions = JSON.parse(localStorage.getItem('chaplainSessions') || '[]');
    const completedCancelledIds = JSON.parse(localStorage.getItem('completedCancelledSessions') || '[]');
    
    if (savedSessions.length > 0) {
      setUpcomingSessions(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const newSessions = savedSessions.filter(s => 
          !existingIds.has(s.id) && 
          s.status === 'upcoming' && 
          !completedCancelledIds.includes(s.id)
        );
        return [...newSessions, ...prev].filter(s => !completedCancelledIds.includes(s.id));
      });
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await apiService.markNotificationRead(id);
      if (response.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setStats(prev => ({ ...prev, unreadNotifications: Math.max(0, prev.unreadNotifications - 1) }));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const acceptReferral = async (referralId) => {
    try {
      const response = await apiService.acceptReferral(referralId, {
        status: 'accepted',
        acceptedBy: `${user?.first_name} ${user?.last_name}`,
        acceptedDate: new Date().toISOString()
      });
      if (response.success) {
        setRecentReferrals(prev => prev.map(ref => 
          ref.id === referralId ? { ...ref, status: 'accepted' } : ref
        ));
        setStats(prev => ({
          ...prev,
          pendingReferrals: Math.max(0, prev.pendingReferrals - 1),
          activeCounseling: prev.activeCounseling + 1
        }));
      }
    } catch (error) {
      console.error('Failed to accept referral:', error);
    }
  };

  const returnToOSAS = async (referralId) => {
    try {
      const response = await apiService.returnReferral(referralId, {
        ...returnForm,
        returnedBy: `${user?.first_name} ${user?.last_name}`,
        returnedDate: new Date().toISOString()
      });
      if (response.success) {
        setRecentReferrals(prev => prev.map(ref => 
          ref.id === referralId ? { ...ref, status: 'returned', returnReason: returnForm.reason, returnNotes: returnForm.notes } : ref
        ));
        setStats(prev => ({
          ...prev,
          pendingReferrals: Math.max(0, prev.pendingReferrals - 1),
          casesReturned: prev.casesReturned + 1
        }));
        setShowReturnModal(false);
        setReturnForm({ reason: '', notes: '', status: 'returned' });
      }
    } catch (error) {
      console.error('Failed to return referral:', error);
    }
  };

  const cancelSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to cancel this session?')) {
      try {
        const response = await apiService.cancelSession(sessionId);
        if (response.success) {
          // Sync with localStorage
          const completedOrCancelledIds = JSON.parse(localStorage.getItem('completedCancelledSessions') || '[]');
          if (!completedOrCancelledIds.includes(sessionId)) {
            completedOrCancelledIds.push(sessionId);
            localStorage.setItem('completedCancelledSessions', JSON.stringify(completedOrCancelledIds));
          }
          fetchDashboardData();
        }
      } catch (error) {
        const completedOrCancelledIds = JSON.parse(localStorage.getItem('completedCancelledSessions') || '[]');
        if (!completedOrCancelledIds.includes(sessionId)) {
          completedOrCancelledIds.push(sessionId);
          localStorage.setItem('completedCancelledSessions', JSON.stringify(completedOrCancelledIds));
        }
        setUpcomingSessions(prev => prev.filter(s => s.id !== sessionId));
        setStats(prev => ({
          ...prev,
          upcomingSessions: Math.max(0, prev.upcomingSessions - 1)
        }));
      }
    }
  };

  // Filter out completed/cancelled sessions
  const completedCancelledIds = JSON.parse(localStorage.getItem('completedCancelledSessions') || '[]');

  // Sort upcoming sessions by closest date/time first, excluding completed/cancelled
  const sortedUpcomingSessions = [...upcomingSessions]
    .filter(s => s.status === 'upcoming' && !completedCancelledIds.includes(s.id))
    .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

  const pastoralStats = [
    { label: 'New Referrals', value: stats.pendingReferrals, icon: '📨', color: '#e8f0fe', textColor: '#1a73e8', path: '/chaplain/referrals' },
    { label: 'Active Cases', value: stats.activeCounseling, icon: '🙏', color: '#e6f4ea', textColor: '#0d904f', path: '/chaplain/sessions' },
    { label: 'Completed Cases', value: stats.completedSessions, icon: '✝️', color: '#e0f2f1', textColor: '#00695c', path: '/chaplain/sessions' },
    { label: 'Returned to OSAS', value: stats.casesReturned, icon: '📤', color: '#fce8e6', textColor: '#d93025', path: '/chaplain/referrals' },
    { label: 'Upcoming Sessions', value: stats.upcomingSessions, icon: '📅', color: '#e8eaf6', textColor: '#283593', path: '/chaplain/sessions' },
    { label: 'Notifications', value: stats.unreadNotifications, icon: '🔔', color: '#fce4ec', textColor: '#c62828' }
  ];

  if (!isChaplain) {
    return null;
  }

  return (
    <div style={{ 
      minHeight: '100dvh', 
      background: '#f0f4f8', 
      fontFamily: 'DM Sans, system-ui, sans-serif',
      color: '#333'
    }}>
      <Navbar unreadNotifications={stats.unreadNotifications} />

      {isSubPage ? (
        <Outlet />
      ) : (
        <div style={{ 
          padding: '24px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Welcome Header */}
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '20px 24px',
            marginBottom: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <h1 style={{ 
                color: '#2e1a47', 
                fontSize: '24px', 
                fontWeight: 700, 
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                ✝️ Pastoral Care Dashboard
              </h1>
              <p style={{ 
                color: '#64748b', 
                fontSize: '14px', 
                margin: '4px 0 0' 
              }}>
                Welcome, {user?.first_name} {user?.last_name}!
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={fetchDashboardData}
                style={{
                  background: '#4a2d6e',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#3b2359'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#4a2d6e'}
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              background: '#fff',
              borderRadius: 12,
              marginBottom: 24
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <div style={{ fontSize: 18, color: '#4a2d6e', fontWeight: 600 }}>Loading dashboard...</div>
            </div>
          )}

          {/* Statistics Grid */}
          {!loading && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 24
            }}>
              {pastoralStats.map((stat, index) => (
                <div
                  key={index}
                  onClick={() => stat.path && navigate(stat.path)}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    borderLeft: `4px solid ${stat.textColor}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: stat.path ? 'pointer' : 'default'
                  }}
                  onMouseEnter={(e) => {
                    if (stat.path) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (stat.path) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                    }
                  }}
                >
                  <div style={{
                    width: 50,
                    height: 50,
                    borderRadius: 10,
                    background: stat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    marginBottom: 12
                  }}>
                    {stat.icon}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pending Referrals & Upcoming Sessions */}
          {!loading && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: 24
            }}>
              {/* Referral Inbox */}
              <div style={{
                background: '#fff',
                borderRadius: 12,
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 16
                }}>
                  <h3 style={{ 
                    color: '#2e1a47', 
                    fontSize: '18px', 
                    fontWeight: 600,
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    📨 Pending Referrals
                    {stats.pendingReferrals > 0 && (
                      <span style={{
                        background: '#d93025',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {stats.pendingReferrals} new
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => navigate('/chaplain/referrals')}
                    style={{
                      background: 'none',
                      border: '1px solid #4a2d6e',
                      color: '#4a2d6e',
                      padding: '6px 12px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500
                    }}
                  >
                    View All →
                  </button>
                </div>

                {recentReferrals.filter(ref => ref.status === 'pending').length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>📨</div>
                    <p>No pending referrals</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                          <th style={{ padding: '12px 8px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '12px' }}>Student</th>
                          <th style={{ padding: '12px 8px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '12px' }}>Referred By</th>
                          <th style={{ padding: '12px 8px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '12px' }}>Date</th>
                          <th style={{ padding: '12px 8px', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '12px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentReferrals.filter(ref => ref.status === 'pending').slice(0, 5).map((ref, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '12px 8px' }}>
                              <div style={{ fontWeight: 600 }}>{ref.studentName}</div>
                              <div style={{ fontSize: 12, color: '#64748b' }}>{ref.department}</div>
                            </td>
                            <td style={{ padding: '12px 8px', fontSize: 13 }}>{ref.referredBy}</td>
                            <td style={{ padding: '12px 8px', fontSize: 13 }}>
                              {new Date(ref.dateReferred).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                                <button
                                  onClick={() => acceptReferral(ref.id)}
                                  style={{
                                    background: '#0d904f',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 500
                                  }}
                                >
                                  ✓ Accept
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedReferral(ref);
                                    setShowReturnModal(true);
                                  }}
                                  style={{
                                    background: '#d93025',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 500
                                  }}
                                >
                                  ↩ Return
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Upcoming Sessions - Sorted by Closest Date/Time */}
              <div style={{
                background: '#fff',
                borderRadius: 12,
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 16
                }}>
                  <h3 style={{ 
                    color: '#2e1a47', 
                    fontSize: '18px', 
                    fontWeight: 600,
                    margin: 0
                  }}>
                    📅 Upcoming Sessions
                  </h3>
                  <button
                    onClick={() => navigate('/chaplain/sessions')}
                    style={{
                      background: 'none',
                      border: '1px solid #4a2d6e',
                      color: '#4a2d6e',
                      padding: '6px 12px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500
                    }}
                  >
                    View All →
                  </button>
                </div>

                {sortedUpcomingSessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>📅</div>
                    <p>No upcoming sessions</p>
                  </div>
                ) : (
                  sortedUpcomingSessions.slice(0, 5).map((session, index) => (
                    <div
                      key={index}
                      style={{
                        padding: 16,
                        background: '#f3e8fd',
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <div style={{ color: '#4a2d6e', fontWeight: 600, fontSize: 13 }}>
                            📅 {new Date(session.date).toLocaleDateString()} at {session.time}
                          </div>
                          <div style={{ fontWeight: 600, marginTop: 4 }}>{session.studentName}</div>
                          <div style={{ fontSize: 13, color: '#64748b' }}>{session.type}</div>
                        </div>
                        <button
                          onClick={() => cancelSession(session.id)}
                          style={{
                            background: 'none',
                            border: '1px solid #d93025',
                            color: '#d93025',
                            padding: '4px 8px',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 500
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Recent Notifications */}
          {!loading && notifications.length > 0 && (
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              marginTop: 24
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 16
              }}>
                <h3 style={{ color: '#2e1a47', fontSize: '18px', fontWeight: 600, margin: 0 }}>
                  🔔 Recent Notifications
                </h3>
              </div>

              {notifications.slice(0, 5).map((notif, index) => (
                <div
                  key={index}
                  onClick={() => !notif.isRead && markAsRead(notif.id)}
                  style={{
                    padding: '16px',
                    borderRadius: 8,
                    marginBottom: 8,
                    cursor: 'pointer',
                    background: !notif.isRead ? '#f3e8fd' : 'transparent',
                    borderBottom: index < notifications.slice(0, 5).length - 1 ? '1px solid #e2e8f0' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {!notif.isRead && (
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4a2d6e', display: 'inline-block' }} />
                        )}
                        {notif.title}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: 4 }}>{notif.message}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: 12 }}>{notif.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Return to OSAS Modal */}
      {showReturnModal && selectedReferral && (
        <div
          onClick={() => setShowReturnModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 32,
              maxWidth: 500,
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ color: '#2e1a47', fontSize: '20px', fontWeight: 600, margin: 0 }}>
                ↩ Return Referral to OSAS
              </h2>
              <button onClick={() => setShowReturnModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 20 }}>
              <p style={{ margin: '0 0 8px', fontWeight: 600 }}>{selectedReferral.studentName}</p>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{selectedReferral.department} • Referred by {selectedReferral.referredBy}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Return Reason *</label>
                <select
                  required
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm({...returnForm, reason: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#333', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  <option value="">Select reason...</option>
                  <option value="not-qualified">Not Qualified for Counseling</option>
                  <option value="student-declined">Student Declined</option>
                  <option value="no-show">Student No Show</option>
                  <option value="resolved">Case Resolved</option>
                  <option value="referred-elsewhere">Referred to Another Department</option>
                  <option value="invalid-referral">Invalid Referral</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Additional Notes</label>
                <textarea
                  value={returnForm.notes}
                  onChange={(e) => setReturnForm({...returnForm, notes: e.target.value})}
                  rows={4}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#333', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}
                  placeholder="Explain why this case is being returned to OSAS..."
                />
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowReturnModal(false)} style={{ background: 'none', border: '1px solid #64748b', color: '#64748b', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>Cancel</button>
              <button
                onClick={() => returnToOSAS(selectedReferral.id)}
                disabled={!returnForm.reason}
                style={{ background: returnForm.reason ? '#d93025' : '#ccc', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: returnForm.reason ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                ↩ Return to OSAS
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}