// pages/chaplain/Referrals.jsx
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TopNavbar from './components/TopNavbar';

export default function Referrals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isChaplain = user?.role_id === 3;
  const [referrals, setReferrals] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, returned
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
      fetchAllReferrals();
    }
  }, [isChaplain]);

  const fetchAllReferrals = async () => {
    try {
      const response = await fetch('/api/chaplain/referrals/all', {
        headers: { 
          'Authorization': `Bearer ${user?.token}`,
          'X-Role-ID': '3'
        }
      });
      const data = await response.json();
      setReferrals(data.referrals || []);
    } catch (error) {
      console.error('Failed to fetch referrals:', error);
    }
  };

  const acceptReferral = async (referralId) => {
    try {
      await fetch(`/api/chaplain/referrals/${referralId}/accept`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${user?.token}`,
          'X-Role-ID': '3',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'accepted',
          acceptedBy: `${user?.first_name} ${user?.last_name}`,
          acceptedDate: new Date().toISOString()
        })
      });
      // Update local state immediately
      setReferrals(prev => prev.map(ref => 
        ref.id === referralId ? { ...ref, status: 'accepted' } : ref
      ));
    } catch (error) {
      console.error('Failed to accept referral:', error);
    }
  };

  const returnToOSAS = async (referralId) => {
    try {
      await fetch(`/api/chaplain/referrals/${referralId}/return`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${user?.token}`,
          'X-Role-ID': '3',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...returnForm,
          returnedBy: `${user?.first_name} ${user?.last_name}`,
          returnedDate: new Date().toISOString()
        })
      });
      // Update local state immediately
      setReferrals(prev => prev.map(ref => 
        ref.id === referralId ? { ...ref, status: 'returned', returnReason: returnForm.reason, returnNotes: returnForm.notes } : ref
      ));
      setShowReturnModal(false);
      setReturnForm({ reason: '', notes: '', status: 'returned' });
    } catch (error) {
      console.error('Failed to return referral:', error);
    }
  };

  const filteredReferrals = referrals.filter(ref => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ref.status === 'pending';
    if (filter === 'accepted') return ref.status === 'accepted';
    if (filter === 'returned') return ref.status === 'returned';
    return true;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: '#fff3cd', color: '#856404', text: 'Pending' },
      accepted: { bg: '#d4edda', color: '#155724', text: 'Accepted' },
      returned: { bg: '#fce8e6', color: '#d93025', text: 'Returned to OSAS' },
      completed: { bg: '#cce5ff', color: '#004085', text: 'Completed' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span style={{
        background: badge.bg,
        color: badge.color,
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: '12px',
        fontWeight: 600
      }}>
        {badge.text}
      </span>
    );
  };

  if (!isChaplain) {
    return null;
  }

  return (
    <div style={{ 
      minHeight: '100dvh', 
      background: darkMode ? '#1a1a1a' : '#f0f4f8', 
      fontFamily: 'DM Sans, system-ui, sans-serif',
      color: darkMode ? '#e0e0e0' : '#333'
    }}>
      {/* Top Navigation Bar */}
      <TopNavbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />

      {/* Main Content */}
      <div style={{ 
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: darkMode ? '#2d2d2d' : '#fff',
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
              color: darkMode ? '#fff' : '#2e1a47', 
              fontSize: '24px', 
              fontWeight: 700, 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              📨 Referral Management
            </h1>
            <p style={{ 
              color: '#64748b', 
              fontSize: '14px', 
              margin: '4px 0 0' 
            }}>
              Manage all student referrals from OSAS
            </p>
          </div>

          <button
            onClick={() => navigate('/chaplain/dashboard')}
            style={{
              background: '#4a2d6e',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          flexWrap: 'wrap'
        }}>
          {['all', 'pending', 'accepted', 'returned'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: filter === status ? '#4a2d6e' : (darkMode ? '#3d3d3d' : '#fff'),
                color: filter === status ? '#fff' : (darkMode ? '#e0e0e0' : '#333'),
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                textTransform: 'capitalize',
                boxShadow: filter === status ? '0 2px 8px rgba(74, 45, 110, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {status}
              <span style={{ 
                marginLeft: 6,
                background: filter === status ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: '11px'
              }}>
                {referrals.filter(ref => status === 'all' ? true : ref.status === status).length}
              </span>
            </button>
          ))}
        </div>

        {/* Referrals Table */}
        <div style={{
          background: darkMode ? '#2d2d2d' : '#fff',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          {filteredReferrals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>📨</div>
              <p>No {filter !== 'all' ? filter : ''} referrals found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${darkMode ? '#4d4d4d' : '#e2e8f0'}` }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '12px' }}>Student</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '12px' }}>Department</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '12px' }}>Referred By</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '12px' }}>Date</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '12px' }}>Status</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.map((ref, index) => (
                    <tr 
                      key={index}
                      style={{ borderBottom: `1px solid ${darkMode ? '#4d4d4d' : '#e2e8f0'}` }}
                    >
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontWeight: 600 }}>{ref.studentName}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{ref.studentId}</div>
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: 13 }}>{ref.department}</td>
                      <td style={{ padding: '12px 8px', fontSize: 13 }}>{ref.referredBy}</td>
                      <td style={{ padding: '12px 8px', fontSize: 13 }}>
                        {new Date(ref.dateReferred).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {getStatusBadge(ref.status)}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        {ref.status === 'pending' && (
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
                              title="Accept Referral"
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
                              title="Return to OSAS"
                            >
                              ↩ Return
                            </button>
                          </div>
                        )}
                        {ref.status === 'accepted' && (
                          <button
                            onClick={() => {
                              setSelectedReferral(ref);
                              setShowReturnModal(true);
                            }}
                            style={{
                              background: '#f0ad4e',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 500
                            }}
                          >
                            ↩ Return to OSAS
                          </button>
                        )}
                        {ref.status === 'returned' && (
                          <button
                            onClick={() => {
                              setSelectedReferral(ref);
                              setShowReturnModal(true);
                            }}
                            style={{
                              background: 'none',
                              border: '1px solid #4a2d6e',
                              color: '#4a2d6e',
                              padding: '6px 12px',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            View Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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
                background: darkMode ? '#2d2d2d' : '#fff',
                borderRadius: 12,
                padding: 32,
                maxWidth: 500,
                width: '100%',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 24
              }}>
                <h2 style={{ 
                  color: darkMode ? '#fff' : '#2e1a47', 
                  fontSize: '20px', 
                  fontWeight: 600,
                  margin: 0
                }}>
                  ↩ Return Referral to OSAS
                </h2>
                <button
                  onClick={() => setShowReturnModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 24,
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{
                background: darkMode ? '#3d3d3d' : '#f8f9fa',
                padding: 16,
                borderRadius: 8,
                marginBottom: 20
              }}>
                <p style={{ margin: '0 0 8px', fontWeight: 600 }}>
                  {selectedReferral.studentName}
                </p>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                  {selectedReferral.department} • Referred by {selectedReferral.referredBy}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                    Return Reason *
                  </label>
                  <select
                    required
                    value={returnForm.reason}
                    onChange={(e) => setReturnForm({...returnForm, reason: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 6,
                      border: `2px solid ${darkMode ? '#4d4d4d' : '#e2e8f0'}`,
                      background: darkMode ? '#3d3d3d' : '#f8fafc',
                      color: darkMode ? '#e0e0e0' : '#333',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
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
                  <label style={{ display: 'block', marginBottom: 8, color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                    Additional Notes
                  </label>
                  <textarea
                    value={returnForm.notes}
                    onChange={(e) => setReturnForm({...returnForm, notes: e.target.value})}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 6,
                      border: `2px solid ${darkMode ? '#4d4d4d' : '#e2e8f0'}`,
                      background: darkMode ? '#3d3d3d' : '#f8fafc',
                      color: darkMode ? '#e0e0e0' : '#333',
                      fontSize: '14px',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Explain why this case is being returned to OSAS..."
                  />
                </div>
              </div>

              <div style={{ 
                marginTop: 24, 
                display: 'flex', 
                gap: 12,
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  style={{
                    background: 'none',
                    border: '1px solid #64748b',
                    color: '#64748b',
                    padding: '10px 20px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => returnToOSAS(selectedReferral.id)}
                  disabled={!returnForm.reason}
                  style={{
                    background: returnForm.reason ? '#d93025' : '#ccc',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 8,
                    cursor: returnForm.reason ? 'pointer' : 'not-allowed',
                    fontWeight: 600,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  ↩ Return to OSAS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}