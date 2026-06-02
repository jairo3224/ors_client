import { useState } from 'react';
import { Plus } from 'lucide-react';

const MOCK_MEETINGS = [
  { id: 1, title: 'Student Case Conference - Juan dela Cruz', date: '2026-06-03', time: '10:00', type: 'Case Conference', status: 'Scheduled', participants: 'Guidance, OSAS, Dept Head', notes: 'Discuss behavioral intervention plan.', outcome: '' },
  { id: 2, title: 'Parent-Teacher Meeting - Maria Santos', date: '2026-06-01', time: '14:00', type: 'Parent Meeting', status: 'Completed', participants: 'Guidance, Teacher, Parent', notes: 'Discussed academic progress and support strategies.', outcome: 'Parent agreed to weekly check-ins.' },
  { id: 3, title: 'Referral Review - Carlo Mendoza', date: '2026-05-28', time: '09:00', type: 'Review', status: 'Completed', participants: 'Guidance, Chaplain', notes: 'Reviewed referral and assessed student needs.', outcome: 'Referred to Chaplain for spiritual support.' },
];

const BLANK_FORM = { title: '', date: '', time: '', type: 'Case Conference', status: 'Scheduled', participants: '', notes: '', outcome: '' };
const TYPE_OPTIONS = ['Case Conference', 'Parent Meeting', 'Review', 'Disciplinary Hearing', 'Planning Session'];
const STATUS_OPTIONS = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'];

const STATUS_CLASS = {
  Completed: 'badge--closed',
  Scheduled: 'badge--open',
  Cancelled: 'badge--high',
  Rescheduled: 'badge--pending',
};

const TYPE_COLORS = {
  'Case Conference': { bg: '#dbeafe', color: '#1d4ed8' },
  'Parent Meeting': { bg: '#dcfce7', color: '#16a34a' },
  'Review': { bg: '#f3e8ff', color: '#9333ea' },
  'Disciplinary Hearing': { bg: '#fce4ec', color: '#c62828' },
};

function Modal({ title, onClose, children }) {
  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal__box">
        <div className="modal__header">
          <h3>{title}</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '0 0 8px' }}>{children}</div>
      </div>
    </div>
  );
}

function MeetingFormModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial ?? BLANK_FORM);
  const [err, setErr] = useState('');

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function handleSubmit() {
    if (!form.title.trim() || !form.date) {
      setErr('Title and date are required.'); return;
    }
    onSave(form);
  }

  return (
    <Modal title={initial ? 'Edit Meeting' : 'Schedule Meeting'} onClose={onClose}>
      {err && <div className="form-error" style={{ marginBottom: 12 }}>{err}</div>}
      <div className="form-group">
        <label className="form-label">Meeting Title *</label>
        <input value={form.title} onChange={e => set('title', e.target.value)}
          className="input" style={{ maxWidth: '100%', width: '100%' }} placeholder="e.g., Case Conference - Student Name" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Date *</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
            className="input" style={{ maxWidth: '100%', width: '100%' }} />
        </div>
        <div className="form-group">
          <label className="form-label">Time</label>
          <input type="time" value={form.time} onChange={e => set('time', e.target.value)}
            className="input" style={{ maxWidth: '100%', width: '100%' }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value)}
            className="select" style={{ width: '100%' }}>
            {TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="select" style={{ width: '100%' }}>
            {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Participants</label>
        <input value={form.participants} onChange={e => set('participants', e.target.value)}
          className="input" style={{ maxWidth: '100%', width: '100%' }}
          placeholder="e.g., Guidance, OSAS, Teacher, Parent" />
      </div>
      <div className="form-group">
        <label className="form-label">Meeting Notes / Agenda</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
          className="textarea" placeholder="Document agenda, discussion points, and decisions..." />
      </div>
      <div className="form-group">
        <label className="form-label">Outcome / Resolution</label>
        <textarea value={form.outcome} onChange={e => set('outcome', e.target.value)} rows={2}
          className="textarea" placeholder="Document the outcome or resolution reached..." />
      </div>
      <div className="modal__actions">
        <button className="btn btn--outline" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={handleSubmit}>{initial ? 'Save Changes' : 'Schedule Meeting'}</button>
      </div>
    </Modal>
  );
}

export default function GuidanceMeetingsPage() {
  const [meetings, setMeetings] = useState(MOCK_MEETINGS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null);

  const filtered = meetings.filter(m => {
    const q = search.toLowerCase();
    return (!q || m.title.toLowerCase().includes(q)) &&
           (!filterStatus || m.status === filterStatus);
  });

  function handleDelete(id) {
    if (!window.confirm('Delete this meeting?')) return;
    setMeetings(prev => prev.filter(m => m.id !== id));
  }

  function handleSave(form) {
    if (modal?.data) {
      setMeetings(prev => prev.map(m => m.id === form.id ? form : m));
    } else {
      setMeetings(prev => [{ ...form, id: Date.now() }, ...prev]);
    }
    setModal(null);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Case Meetings</h1>
        <p className="page-subtitle">Schedule and document case meetings, conferences, and reviews</p>
      </div>

      <div className="filters">
        <input
          className="input"
          placeholder="Search meetings..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
        <button className="btn" style={{ marginLeft: 'auto' }} onClick={() => setModal({ type: 'form', data: null })}>
          <Plus size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Schedule Meeting
        </button>
      </div>

      <div>
        {filtered.length === 0 && <div className="empty-state">No meetings scheduled.</div>}
        {filtered.map(meeting => {
          const typeColor = TYPE_COLORS[meeting.type] || { bg: '#f5f5f5', color: '#757575' };
          return (
            <div key={meeting.id} className="card" style={{ padding: '18px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 8,
                    background: typeColor.bg, color: typeColor.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, flexShrink: 0
                  }}>
                    📅
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: '#1a3a5c', fontWeight: 700, fontSize: '0.95rem' }}>{meeting.title}</h4>
                    <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.78rem' }}>{meeting.date} at {meeting.time} · {meeting.type}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge ${STATUS_CLASS[meeting.status] || ''}`}>{meeting.status}</span>
                  <button className="btn btn--sm btn--outline" onClick={() => setModal({ type: 'form', data: meeting })}>Edit</button>
                  <button className="btn btn--sm btn--danger" onClick={() => handleDelete(meeting.id)}>Delete</button>
                </div>
              </div>
              <p style={{ fontSize: '0.83rem', color: '#64748b', margin: '0 0 8px', paddingLeft: 52 }}>
                Participants: {meeting.participants}
              </p>
              {meeting.notes && (
                <p style={{ fontSize: '0.83rem', color: '#334155', background: '#f7f9fc', borderRadius: 8, padding: '8px 12px', margin: '0 0 8px' }}>
                  {meeting.notes}
                </p>
              )}
              {meeting.outcome && (
                <p style={{ fontSize: '0.83rem', color: '#2e7d32', background: '#e8f5e9', borderRadius: 8, padding: '8px 12px', margin: 0 }}>
                  <strong>Outcome:</strong> {meeting.outcome}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {modal?.type === 'form' && (
        <MeetingFormModal
          initial={modal.data}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
