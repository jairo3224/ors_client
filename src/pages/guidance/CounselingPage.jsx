import { useState } from 'react';
import { Plus } from 'lucide-react';

const MOCK_SESSIONS = [
  { id: 1, student_name: 'Maria Santos',    date: '2026-05-29', type: 'Individual', status: 'Completed', notes: 'Discussed academic anxiety. Breathing exercises introduced.', follow_up: '2026-06-05' },
  { id: 2, student_name: 'Carlo Mendoza',   date: '2026-05-22', type: 'Individual', status: 'Completed', notes: 'Final session. Student reports improved peer relationships.', follow_up: '' },
  { id: 3, student_name: 'Paolo Reyes',     date: '2026-05-30', type: 'Assessment', status: 'Completed', notes: 'Career assessment administered. Results discussed.', follow_up: '2026-06-06' },
  { id: 4, student_name: 'Ana Flores',      date: '2026-06-01', type: 'Initial',    status: 'Scheduled', notes: '', follow_up: '' },
];

const BLANK_FORM = { student_name: '', date: '', type: 'Individual', status: 'Scheduled', notes: '', follow_up: '' };
const TYPE_OPTIONS = ['Individual', 'Group', 'Initial', 'Assessment', 'Crisis', 'Follow-up'];
const STATUS_OPTIONS = ['Scheduled', 'Completed', 'Cancelled', 'No-show'];

const STATUS_CLASS = {
  Completed: 'badge--closed',
  Scheduled: 'badge--open',
  Cancelled: 'badge--high',
  'No-show': 'badge--pending',
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

function SessionFormModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial ?? BLANK_FORM);
  const [err, setErr] = useState('');

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function handleSubmit() {
    if (!form.student_name.trim() || !form.date) {
      setErr('Student name and date are required.'); return;
    }
    onSave(form);
  }

  return (
    <Modal title={initial ? 'Edit Session' : 'New Counseling Session'} onClose={onClose}>
      {err && <div className="form-error" style={{ marginBottom: 12 }}>{err}</div>}
      <div className="form-group">
        <label className="form-label">Student Name *</label>
        <input value={form.student_name} onChange={e => set('student_name', e.target.value)}
          className="input" style={{ maxWidth: '100%', width: '100%' }} placeholder="Full name" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Date *</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
            className="input" style={{ maxWidth: '100%', width: '100%' }} />
        </div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value)}
            className="select" style={{ width: '100%' }}>
            {TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Status</label>
        <select value={form.status} onChange={e => set('status', e.target.value)}
          className="select" style={{ width: '100%' }}>
          {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Session Notes</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
          className="textarea" placeholder="Document session details, observations, and interventions..." />
      </div>
      <div className="form-group">
        <label className="form-label">Follow-up Date</label>
        <input type="date" value={form.follow_up} onChange={e => set('follow_up', e.target.value)}
          className="input" style={{ maxWidth: '100%', width: '100%' }} />
      </div>
      <div className="modal__actions">
        <button className="btn btn--outline" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={handleSubmit}>{initial ? 'Save Changes' : 'Create Session'}</button>
      </div>
    </Modal>
  );
}

export default function CounselingPage() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null);

  const filtered = sessions.filter(s => {
    const q = search.toLowerCase();
    return (!q || s.student_name.toLowerCase().includes(q)) &&
           (!filterStatus || s.status === filterStatus);
  });

  function handleDelete(id) {
    if (!window.confirm('Delete this session?')) return;
    setSessions(prev => prev.filter(s => s.id !== id));
  }

  function handleSave(form) {
    if (modal?.data) {
      setSessions(prev => prev.map(s => s.id === form.id ? form : s));
    } else {
      setSessions(prev => [{ ...form, id: Date.now() }, ...prev]);
    }
    setModal(null);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Counseling Sessions</h1>
        <p className="page-subtitle">Track counseling sessions and case notes</p>
      </div>

      <div className="filters">
        <input
          className="input"
          placeholder="Search by student name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
        <button className="btn" style={{ marginLeft: 'auto' }} onClick={() => setModal({ type: 'form', data: null })}>
          <Plus size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} /> New Session
        </button>
      </div>

      <div>
        {filtered.length === 0 && <div className="empty-state">No counseling sessions recorded.</div>}
        {filtered.map(session => (
          <div key={session.id} className="card" style={{ padding: '18px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <h4 style={{ margin: 0, color: '#1a3a5c', fontWeight: 700, fontSize: '0.95rem' }}>{session.student_name}</h4>
                <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.78rem' }}>{session.date} · {session.type}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge ${STATUS_CLASS[session.status] || ''}`}>{session.status}</span>
                <button className="btn btn--sm btn--outline" onClick={() => setModal({ type: 'form', data: session })}>Edit</button>
                <button className="btn btn--sm btn--danger" onClick={() => handleDelete(session.id)}>Delete</button>
              </div>
            </div>
            {session.notes && (
              <p style={{ fontSize: '0.83rem', color: '#334155', background: '#f7f9fc', borderRadius: 8, padding: '8px 12px', margin: '0 0 8px' }}>
                {session.notes}
              </p>
            )}
            {session.follow_up && (
              <p style={{ fontSize: '0.78rem', color: '#f57f17', margin: 0 }}>Follow-up: {session.follow_up}</p>
            )}
          </div>
        ))}
      </div>

      {modal?.type === 'form' && (
        <SessionFormModal
          initial={modal.data}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
