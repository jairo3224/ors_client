import { useState, useEffect, useSyncExternalStore } from 'react';
import { Calendar, Clock, MapPin, Users, FileText, CheckCircle, Plus, MessageSquare } from 'lucide-react';
import Avatar from '../../../components/Avatar';
import Badge from '../../../components/Badge';
import Modal, { ModalHeader, ModalActions } from '../../../components/Modal';
import { MEETING_STATUSES, MEETING_STATUS_COLORS } from '../../../constants';
import { mockStore, filterBySchoolYear } from '../../../shared/mockStore';

function ScheduleModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [studentName, setStudentName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [participants, setParticipants] = useState([]);
  const [agenda, setAgenda] = useState('');

  const allOffices = ['OSAS', 'Guidance Office', 'Chaplain', 'Department Head'];
  const toggleParticipant = (o) => setParticipants(prev => prev.includes(o) ? prev.filter(p => p !== o) : [...prev, o]);

  return (
    <Modal onClose={onClose} maxWidth={540}>
      <ModalHeader onClose={onClose}>Schedule Meeting</ModalHeader>
        <div className="form-group">
          <label className="form-label">Meeting Title</label>
          <input className="input" style={{ width: '100%', maxWidth: '100%' }} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Behavioral Intervention Meeting" />
        </div>
        <div className="form-group">
          <label className="form-label">Student Name</label>
          <input className="input" style={{ width: '100%', maxWidth: '100%' }} value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="e.g. Juan Dela Cruz" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="input" type="date" style={{ width: '100%', maxWidth: '100%' }} value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Time</label>
            <input className="input" type="time" style={{ width: '100%', maxWidth: '100%' }} value={time} onChange={e => setTime(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input className="input" style={{ width: '100%', maxWidth: '100%' }} value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. OSAS Conference Room" />
        </div>
        <div className="form-group">
          <label className="form-label">Participants (Offices)</label>
          <div className="forward-options">
            {allOffices.map(o => (
              <button key={o} type="button" onClick={() => toggleParticipant(o)} className={`forward-option ${participants.includes(o) ? 'forward-option--selected' : ''}`}>{o}</button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Agenda</label>
          <textarea className="textarea" value={agenda} onChange={e => setAgenda(e.target.value)} placeholder="Topics to discuss..." />
        </div>
        <ModalActions>
          <button className="btn btn--outline" onClick={onClose}>Cancel</button>
          <button className="btn" disabled={!title || !studentName || !date || !time} onClick={() => { onSubmit({ title, studentName, date, time, location, participants, agenda }); onClose(); }}>Schedule Meeting</button>
        </ModalActions>
      </Modal>
  );
}

function MeetingDetailModal({ meeting, onClose, onSaveMinutes, onSaveOutcomes }) {
  const [minutes, setMinutes] = useState(meeting?.minutes || '');
  const [outcomes, setOutcomes] = useState(meeting?.outcomes || '');
  const [editing, setEditing] = useState(false);

  if (!meeting) return null;

  const canEdit = meeting.status === 'in_progress' || meeting.status === 'scheduled';

  return (
    <Modal onClose={onClose} maxWidth={560}>
      <ModalHeader onClose={onClose}>{meeting.title}</ModalHeader>
        <div className="modal__details" style={{ marginBottom: 16 }}>
          <div className="modal__field"><span className="modal__label">Student</span><span className="modal__value">{meeting.student_name}</span></div>
          <div className="modal__field"><span className="modal__label">Case</span><span className="modal__value">{meeting.case_id}</span></div>
          <div className="modal__field"><span className="modal__label">Date & Time</span><span className="modal__value">{meeting.date} @ {meeting.time}</span></div>
          <div className="modal__field"><span className="modal__label">Location</span><span className="modal__value">{meeting.location}</span></div>
          <div className="modal__field" style={{ gridColumn: '1 / -1' }}><span className="modal__label">Participants</span><span className="modal__value">{meeting.participants.join(', ')}</span></div>
          <div className="modal__field" style={{ gridColumn: '1 / -1' }}><span className="modal__label">Status</span><span className="modal__value"><Badge label={meeting.status} color={MEETING_STATUS_COLORS[meeting.status]} /></span></div>
        </div>
        <div className="modal__section-title">Agenda</div>
        <div className="modal__context">{meeting.agenda}</div>

        <div className="modal__section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Minutes</span>
          {canEdit && !editing && <button className="btn btn--sm btn--outline" onClick={() => setEditing(true)}><MessageSquare size={13} style={{ marginRight: 4 }} />Edit</button>}
        </div>
        {editing ? (
          <textarea className="textarea" value={minutes} onChange={e => setMinutes(e.target.value)} style={{ minHeight: 100 }} />
        ) : (
          <div className="modal__context" style={!minutes ? { color: '#94a3b8', fontStyle: 'italic' } : {}}>{minutes || 'No minutes recorded yet.'}</div>
        )}

        <div className="modal__section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <span>Outcomes</span>
          {canEdit && !editing && <button className="btn btn--sm btn--outline" onClick={() => setEditing(true)}><FileText size={13} style={{ marginRight: 4 }} />Edit</button>}
        </div>
        {editing ? (
          <textarea className="textarea" value={outcomes} onChange={e => setOutcomes(e.target.value)} style={{ minHeight: 80 }} />
        ) : (
          <div className="modal__context" style={!outcomes ? { color: '#94a3b8', fontStyle: 'italic' } : {}}>{outcomes || 'No outcomes documented yet.'}</div>
        )}

        {editing && <div className="modal__actions">
          <button className="btn btn--outline" onClick={() => { setEditing(false); setMinutes(meeting.minutes); setOutcomes(meeting.outcomes); }}>Cancel</button>
          <button className="btn" onClick={() => { onSaveMinutes(meeting.id, minutes); onSaveOutcomes(meeting.id, outcomes); setEditing(false); }}>Save</button>
        </div>}
      </Modal>
  );
}

export default function MeetingsPage() {
  const store = useSyncExternalStore(mockStore.subscribe, () => mockStore.getState());
  const meetings = filterBySchoolYear(store.meetings, store.settings.schoolYear, 'date');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showSchedule, setShowSchedule] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const handleSchedule = (data) => {
    mockStore.addMeeting({ student_name: data.studentName, title: data.title, date: data.date, time: data.time, location: data.location, participants: data.participants, agenda: data.agenda });
  };
  const handleSaveMinutes = (id, text) => mockStore.updateMeeting(id, { minutes: text });
  const handleSaveOutcomes = (id, text) => mockStore.updateMeeting(id, { outcomes: text });

  const filtered = meetings.filter(m => {
    const matchSearch = `${m.title} ${m.student_name} ${m.case_id} ${m.location}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: meetings.length,
    scheduled: meetings.filter(m => m.status === 'scheduled').length,
    inProgress: meetings.filter(m => m.status === 'in_progress').length,
    completed: meetings.filter(m => m.status === 'completed').length,
  };

  if (loading) return <div className="loading">Loading meetings...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1 className="page-title">Case Meetings</h1><p className="page-subtitle">Schedule, document minutes, and track meeting outcomes.</p></div>
        <button className="btn" onClick={() => setShowSchedule(true)}><Plus size={14} style={{ marginRight: 6 }} />Schedule Meeting</button>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}><Calendar size={20} /></div><div><div className="stat-card__value">{stats.total}</div><div className="stat-card__label">Total Meetings</div></div></div>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}><Clock size={20} /></div><div><div className="stat-card__value">{stats.scheduled}</div><div className="stat-card__label">Scheduled</div></div></div>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#fce4ec', color: '#c62828' }}><Users size={20} /></div><div><div className="stat-card__value">{stats.inProgress}</div><div className="stat-card__label">In Progress</div></div></div>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}><CheckCircle size={20} /></div><div><div className="stat-card__value">{stats.completed}</div><div className="stat-card__label">Completed</div></div></div>
      </div>
      <div className="filters">
        <input className="input" style={{ maxWidth: 320 }} placeholder="Search title, student, case..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          {MEETING_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(meeting => (
          <div key={meeting.id} className="card" style={{ margin: 0, borderLeft: `4px solid ${MEETING_STATUS_COLORS[meeting.status] || '#ccc'}`, cursor: 'pointer' }} onClick={() => setDetailTarget(meeting)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div className="report-card__student">
                <Avatar name={meeting.student_name} />
                <div>
                  <div className="report-card__name">{meeting.title}</div>
                  <div className="report-card__meta">{meeting.student_name} · {meeting.case_id}</div>
                </div>
              </div>
              <Badge label={meeting.status} color={MEETING_STATUS_COLORS[meeting.status]} />
            </div>
            <div style={{ display: 'flex', gap: 16, marginLeft: 46, fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} /> {meeting.date}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} /> {meeting.time}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {meeting.location}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={13} /> {meeting.participants.length} participant{meeting.participants.length > 1 ? 's' : ''}</span>
            </div>
            {meeting.outcomes && <div className="remarks-box" style={{ marginLeft: 46, marginTop: 10 }}><div className="remarks-box__heading">Outcome</div>{meeting.outcomes}</div>}
          </div>
        ))}
        {filtered.length === 0 && <div className="empty-state" style={{ padding: 60 }}>No meetings found.</div>}
      </div>
      {showSchedule && <ScheduleModal onClose={() => setShowSchedule(false)} onSubmit={handleSchedule} />}
      {detailTarget && <MeetingDetailModal meeting={detailTarget} onClose={() => setDetailTarget(null)} onSaveMinutes={handleSaveMinutes} onSaveOutcomes={handleSaveOutcomes} />}
    </div>
  );
}
