import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuidanceData } from '../hooks/useGuidanceData';

function sessionStatusClass(status) {
  const map = { scheduled: 'badge--pending', in_progress: 'badge--warning', completed: 'badge--success' };
  return map[status] || 'badge--pending';
}

export default function CounselingSessionsPage() {
  const navigate = useNavigate();
  const { guidanceMeetings, addSession, isLoading, error } = useGuidanceData();
  const [showForm, setShowForm] = useState(false);
  const [newSession, setNewSession] = useState({
    student_name: '',
    title: '',
    date: '',
    time: '',
    location: 'Guidance Office',
    agenda: '',
  });

  if (isLoading) {
    return <div className="card empty-state" style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading sessions...</div>;
  }

  if (error) {
    return <div className="card empty-state" style={{ padding: 40, textAlign: 'center', color: '#c62828' }}>Error: {error}</div>;
  }

  const handleCreate = async () => {
    if (!newSession.student_name.trim() || !newSession.date || !newSession.time) return;
    try {
      await addSession({
        student_name: newSession.student_name.trim(),
        title: newSession.title.trim() || 'Counseling Session',
        date: newSession.date,
        time: newSession.time,
        location: newSession.location,
        agenda: newSession.agenda.trim(),
      });
    } catch (e) {
      alert('Failed to create session: ' + e.message);
    }
    setNewSession({ student_name: '', title: '', date: '', time: '', location: 'Guidance Office', agenda: '' });
    setShowForm(false);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">🛋️ Counseling Sessions</h1>
          <p className="page-subtitle">Schedule and manage student counseling sessions</p>
        </div>
        <button className="btn btn--sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Session'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 18 }}>
          <h4 style={{ margin: '0 0 14px', color: '#1a3a5c' }}>Schedule Counseling Session</h4>
          <div className="form-group">
            <label className="form-label">Student Name</label>
            <input
              className="input"
              style={{ width: '100%' }}
              value={newSession.student_name}
              onChange={e => setNewSession({ ...newSession, student_name: e.target.value })}
              placeholder="e.g. Juan Dela Cruz"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Session Title</label>
            <input
              className="input"
              style={{ width: '100%' }}
              value={newSession.title}
              onChange={e => setNewSession({ ...newSession, title: e.target.value })}
              placeholder="e.g. Initial Counseling Session"
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Date</label>
              <input
                type="date"
                className="input"
                style={{ width: '100%' }}
                value={newSession.date}
                onChange={e => setNewSession({ ...newSession, date: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Time</label>
              <input
                type="time"
                className="input"
                style={{ width: '100%' }}
                value={newSession.time}
                onChange={e => setNewSession({ ...newSession, time: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              className="input"
              style={{ width: '100%' }}
              value={newSession.location}
              onChange={e => setNewSession({ ...newSession, location: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Agenda / Notes</label>
            <textarea
              className="textarea"
              value={newSession.agenda}
              onChange={e => setNewSession({ ...newSession, agenda: e.target.value })}
              placeholder="What will be discussed in this session?"
            />
          </div>
          <div className="form-actions">
            <button
              className="btn btn--primary"
              onClick={handleCreate}
              disabled={!newSession.student_name.trim() || !newSession.date || !newSession.time}
            >
              Schedule Session
            </button>
          </div>
        </div>
      )}

      <div className="card table-card">
        {guidanceMeetings.length === 0 ? (
          <div className="empty-state">No counseling sessions scheduled.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Session</th>
                <th>Date</th>
                <th>Time</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {guidanceMeetings.map(mtg => (
                <tr key={mtg.id}>
                  <td>
                    <div
                      style={{ cursor: 'pointer', color: '#1a3a5c', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'underline', textDecorationColor: '#94a3b8', textUnderlineOffset: 2 }}
                      onClick={() => navigate(`/guidance/student/${encodeURIComponent(mtg.student_name)}`)}
                    >
                      Name: {mtg.student_name}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1a3a5c', fontSize: '0.83rem' }}>{mtg.title}</div>
                  </td>
                  <td className="mono">{mtg.date}</td>
                  <td>{mtg.time}</td>
                  <td className="text-muted">{mtg.location}</td>
                  <td>
                    <span className={`badge ${sessionStatusClass(mtg.status)}`}>{mtg.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {guidanceMeetings.filter(m => m.minutes).length > 0 && (
        <div className="card">
          <h3 className="card__title">Session Notes</h3>
          {guidanceMeetings.filter(m => m.minutes).map(mtg => (
            <div key={mtg.id} className="report-item">
              <div className="report-item__info">
                <div className="report-item__name">{mtg.student_name} · {mtg.title}</div>
                <div className="remarks-box" style={{ marginTop: 6 }}>
                  <div className="remarks-box__heading">Minutes</div>
                  {mtg.minutes}
                </div>
                {mtg.outcomes && (
                  <div className="remarks-box" style={{ marginTop: 6 }}>
                    <div className="remarks-box__heading">Outcomes</div>
                    {mtg.outcomes}
                  </div>
                )}
              </div>
              <div className="report-item__date">{mtg.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
