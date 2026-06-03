// pages/chaplain/Sessions.jsx
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import apiService from '../../services/api';

export default function Sessions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isChaplain = user?.role_id === 3;
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [scheduleForm, setScheduleForm] = useState({
    studentName: '',
    studentId: '',
    date: '',
    time: '',
    type: 'individual',
    notes: ''
  });

  const sessionTypes = {
    individual: { label: 'Individual', color: '#1a73e8', bg: '#e8f0fe' },
    group: { label: 'Group', color: '#0d904f', bg: '#e6f4ea' },
    assessment: { label: 'Assessment', color: '#f9ab00', bg: '#fef7e0' },
    'follow-up': { label: 'Follow-up', color: '#9334e6', bg: '#f3e8fd' },
    crisis: { label: 'Crisis', color: '#d93025', bg: '#fce8e6' }
  };

  useEffect(() => {
    if (!isChaplain) navigate('/unauthorized');
  }, [isChaplain, navigate]);

  useEffect(() => {
    if (isChaplain) { fetchSessions(); loadLocalSessions(); }
  }, [isChaplain]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSessions();
      if (response.success) setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLocalSessions = () => {
    const savedSessions = JSON.parse(localStorage.getItem('chaplainSessions') || '[]');
    const completedCancelledIds = JSON.parse(localStorage.getItem('completedCancelledSessions') || '[]');
    if (savedSessions.length > 0) {
      setSessions(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const newSessions = savedSessions.filter(s => 
          !existingIds.has(s.id) && 
          !completedCancelledIds.includes(s.id)
        );
        return [...newSessions, ...prev];
      });
    }
  };

  const markSessionInLocalStorage = (sessionId, status) => {
    const savedSessions = JSON.parse(localStorage.getItem('chaplainSessions') || '[]');
    const updatedSessions = savedSessions.map(s => 
      s.id === sessionId ? { ...s, status } : s
    );
    localStorage.setItem('chaplainSessions', JSON.stringify(updatedSessions));
    
    const completedOrCancelledIds = JSON.parse(localStorage.getItem('completedCancelledSessions') || '[]');
    if (!completedOrCancelledIds.includes(sessionId)) {
      completedOrCancelledIds.push(sessionId);
      localStorage.setItem('completedCancelledSessions', JSON.stringify(completedOrCancelledIds));
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.scheduleSession(scheduleForm);
      if (response.success) {
        setShowScheduleModal(false);
        setScheduleForm({ studentName: '', studentId: '', date: '', time: '', type: 'individual', notes: '' });
        fetchSessions();
      } else { saveSessionLocally(); }
    } catch (error) {
      console.log('API not available, saving locally');
      saveSessionLocally();
    }
  };

  const saveSessionLocally = () => {
    const newSession = {
      id: Date.now().toString(),
      studentName: scheduleForm.studentName,
      studentId: scheduleForm.studentId,
      date: scheduleForm.date,
      time: scheduleForm.time,
      type: scheduleForm.type,
      status: 'upcoming',
      notes: scheduleForm.notes
    };
    const existingSessions = JSON.parse(localStorage.getItem('chaplainSessions') || '[]');
    existingSessions.push(newSession);
    localStorage.setItem('chaplainSessions', JSON.stringify(existingSessions));
    setSessions(prev => [newSession, ...prev]);
    setShowScheduleModal(false);
    setScheduleForm({ studentName: '', studentId: '', date: '', time: '', type: 'individual', notes: '' });
  };

  const cancelSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to cancel this session?')) {
      try {
        const response = await apiService.cancelSession(sessionId);
        if (response.success) {
          markSessionInLocalStorage(sessionId, 'cancelled');
          fetchSessions();
        }
      } catch (error) {
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'cancelled' } : s));
        markSessionInLocalStorage(sessionId, 'cancelled');
      }
    }
  };

  const completeSession = async (sessionId) => {
    try {
      const response = await apiService.completeSession(sessionId);
      if (response.success) {
        markSessionInLocalStorage(sessionId, 'completed');
        fetchSessions();
      }
    } catch (error) {
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'completed' } : s));
      markSessionInLocalStorage(sessionId, 'completed');
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filter !== 'all' && session.status !== filter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (session.studentName?.toLowerCase().includes(s) || session.studentId?.toLowerCase().includes(s) || session.type?.toLowerCase().includes(s) || session.notes?.toLowerCase().includes(s));
    }
    return true;
  });

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
    if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
    return new Date(b.date) - new Date(a.date);
  });

  const earliestUpcoming = [...sessions]
    .filter(s => s.status === 'upcoming')
    .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time))
    .slice(0, 5);

  const stats = {
    total: sessions.length,
    upcoming: sessions.filter(s => s.status === 'upcoming').length,
    completed: sessions.filter(s => s.status === 'completed').length,
    cancelled: sessions.filter(s => s.status === 'cancelled').length
  };

  if (!isChaplain) return null;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '24px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ color: '#2e1a47', fontSize: '24px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>📅 Session Management</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>Manage all your counseling sessions</p>
        </div>
        <button onClick={() => setShowScheduleModal(true)} style={{ background: '#0d904f', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: 8 }}>📅 + Schedule Session</button>
      </div>

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[{ label: 'Total Sessions', value: stats.total, color: '#1a73e8' }, { label: 'Upcoming', value: stats.upcoming, color: '#0d904f' }, { label: 'Completed', value: stats.completed, color: '#9334e6' }, { label: 'Cancelled', value: stats.cancelled, color: '#d93025' }].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: `4px solid ${s.color}` }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {!loading && earliestUpcoming.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid #0d904f' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: '#2e1a47', fontSize: '16px', fontWeight: 600, margin: 0 }}>⏰ Upcoming Sessions ({earliestUpcoming.length})</h3>
            <button onClick={() => setShowScheduleModal(true)} style={{ background: '#0d904f', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>+ Schedule New</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {earliestUpcoming.map((session, index) => {
              const typeStyle = sessionTypes[session.type] || sessionTypes.individual;
              const sessionDate = new Date(session.date + ' ' + session.time);
              const isPast = sessionDate < new Date();
              return (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: isPast ? '#fff3f3' : '#f0fdf4', borderRadius: 8, borderLeft: `3px solid ${isPast ? '#d93025' : typeStyle.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: typeStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📅</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{session.studentName}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {sessionDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {session.time}
                        {isPast && <span style={{ color: '#d93025', marginLeft: 8, fontWeight: 500 }}>⚠️ Past due</span>}
                      </div>
                    </div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: '11px', fontWeight: 600, background: typeStyle.bg, color: typeStyle.color }}>{typeStyle.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input type="text" placeholder="🔍 Search sessions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 16px', borderRadius: 8, border: '2px solid #e2e8f0', background: '#fff', color: '#333', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[{ value: 'all', label: 'All Sessions' }, { value: 'upcoming', label: 'Upcoming' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }].map(o => (
              <button key={o.value} onClick={() => setFilter(o.value)}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: filter === o.value ? '#4a2d6e' : '#fff', color: filter === o.value ? '#fff' : '#333', cursor: 'pointer', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', boxShadow: filter === o.value ? '0 2px 8px rgba(74, 45, 110, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)' }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '60px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <div style={{ fontSize: 18, color: '#4a2d6e', fontWeight: 600 }}>Loading Sessions...</div>
        </div>
      )}

      {!loading && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {sortedSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📅</div>
              <h3 style={{ color: '#333', marginBottom: 8 }}>No sessions found</h3>
              <p>{searchTerm ? 'No sessions match your search criteria' : filter !== 'all' ? `No ${filter} sessions` : 'Schedule your first counseling session'}</p>
              <button onClick={() => setShowScheduleModal(true)} style={{ marginTop: 16, background: '#0d904f', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>📅 Schedule Session</button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '12px' }}>Student</th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '12px' }}>Date & Time</th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '12px' }}>Type</th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '12px' }}>Status</th>
                    <th style={{ padding: '16px 12px', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSessions.map((session, index) => {
                    const typeStyle = sessionTypes[session.type] || sessionTypes.individual;
                    const isUpcoming = session.status === 'upcoming';
                    const isPast = new Date(session.date + ' ' + session.time) < new Date() && session.status === 'upcoming';
                    return (
                      <tr key={session.id || index} style={{ borderBottom: '1px solid #e2e8f0', background: isPast ? '#fff3f3' : 'transparent' }}>
                        <td style={{ padding: '16px 12px' }}>
                          <div style={{ fontWeight: 600 }}>{session.studentName}</div>
                          {session.studentId && <div style={{ fontSize: 12, color: '#64748b' }}>ID: {session.studentId}</div>}
                        </td>
                        <td style={{ padding: '16px 12px', fontSize: 14 }}>
                          <div>{new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{session.time}</div>
                          {isPast && <div style={{ fontSize: 11, color: '#d93025', marginTop: 4, fontWeight: 500 }}>⚠️ Past due</div>}
                        </td>
                        <td style={{ padding: '16px 12px' }}><span style={{ padding: '4px 10px', borderRadius: 12, fontSize: '12px', fontWeight: 600, background: typeStyle.bg, color: typeStyle.color }}>{typeStyle.label}</span></td>
                        <td style={{ padding: '16px 12px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: '12px', fontWeight: 600,
                            background: session.status === 'upcoming' ? '#e8f0fe' : session.status === 'completed' ? '#e6f4ea' : session.status === 'cancelled' ? '#fce8e6' : '#f3e8fd',
                            color: session.status === 'upcoming' ? '#1a73e8' : session.status === 'completed' ? '#0d904f' : session.status === 'cancelled' ? '#d93025' : '#9334e6'
                          }}>{session.status.charAt(0).toUpperCase() + session.status.slice(1)}</span>
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            <button onClick={() => { setSelectedSession(session); setShowDetailsModal(true); }} style={{ background: '#4a2d6e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>View</button>
                            {isUpcoming && (
                              <>
                                <button onClick={() => completeSession(session.id)} style={{ background: '#0d904f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>✓ Complete</button>
                                <button onClick={() => cancelSession(session.id)} style={{ background: 'none', border: '1px solid #d93025', color: '#d93025', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>✕ Cancel</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedSession && (
        <div onClick={() => setShowDetailsModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: 32, maxWidth: 600, width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ color: '#2e1a47', fontSize: '20px', fontWeight: 600, margin: 0 }}>📅 Session Details</h2>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{selectedSession.studentName}</div>
                {selectedSession.studentId && <div style={{ fontSize: 14, color: '#64748b' }}>Student ID: {selectedSession.studentId}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Date</div><div style={{ fontWeight: 600 }}>{new Date(selectedSession.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
                <div><div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Time</div><div style={{ fontWeight: 600 }}>{selectedSession.time}</div></div>
              </div>
              <div><div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Session Type</div><span style={{ padding: '4px 10px', borderRadius: 12, fontSize: '13px', fontWeight: 600, background: sessionTypes[selectedSession.type]?.bg, color: sessionTypes[selectedSession.type]?.color }}>{sessionTypes[selectedSession.type]?.label}</span></div>
              <div><div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Status</div><span style={{ padding: '4px 10px', borderRadius: 12, fontSize: '13px', fontWeight: 600, background: selectedSession.status === 'upcoming' ? '#e8f0fe' : selectedSession.status === 'completed' ? '#e6f4ea' : '#fce8e6', color: selectedSession.status === 'upcoming' ? '#1a73e8' : selectedSession.status === 'completed' ? '#0d904f' : '#d93025' }}>{selectedSession.status.charAt(0).toUpperCase() + selectedSession.status.slice(1)}</span></div>
              {selectedSession.notes && <div><div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Notes</div><div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, fontSize: 14, lineHeight: 1.6 }}>{selectedSession.notes}</div></div>}
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: '1px solid #64748b', color: '#64748b', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div onClick={() => setShowScheduleModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: 32, maxWidth: 500, width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ color: '#2e1a47', fontSize: '20px', fontWeight: 600, margin: 0 }}>📅 Schedule New Session</h2>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            <form onSubmit={handleScheduleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div><label style={{ display: 'block', marginBottom: 8, color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Student Name *</label><input type="text" required value={scheduleForm.studentName} onChange={(e) => setScheduleForm({...scheduleForm, studentName: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#333', fontSize: '14px', boxSizing: 'border-box' }} placeholder="Enter student name" /></div>
                <div><label style={{ display: 'block', marginBottom: 8, color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Student ID</label><input type="text" value={scheduleForm.studentId} onChange={(e) => setScheduleForm({...scheduleForm, studentId: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#333', fontSize: '14px', boxSizing: 'border-box' }} placeholder="Enter student ID (optional)" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={{ display: 'block', marginBottom: 8, color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Date *</label><input type="date" required value={scheduleForm.date} onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})} min={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#333', fontSize: '14px', boxSizing: 'border-box' }} /></div>
                  <div><label style={{ display: 'block', marginBottom: 8, color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Time *</label><input type="time" required value={scheduleForm.time} onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#333', fontSize: '14px', boxSizing: 'border-box' }} /></div>
                </div>
                <div><label style={{ display: 'block', marginBottom: 8, color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Session Type *</label><select required value={scheduleForm.type} onChange={(e) => setScheduleForm({...scheduleForm, type: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#333', fontSize: '14px', boxSizing: 'border-box' }}><option value="individual">Individual Counseling</option><option value="group">Group Session</option><option value="assessment">Spiritual Assessment</option><option value="follow-up">Follow-up Meeting</option><option value="crisis">Crisis Intervention</option></select></div>
                <div><label style={{ display: 'block', marginBottom: 8, color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Notes</label><textarea value={scheduleForm.notes} onChange={(e) => setScheduleForm({...scheduleForm, notes: e.target.value})} rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#333', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }} placeholder="Add any notes..." /></div>
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: '1px solid #64748b', color: '#64748b', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>Cancel</button>
                <button type="submit" style={{ background: '#0d904f', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: 8 }}>📅 Schedule Session</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}