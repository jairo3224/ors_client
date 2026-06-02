import { useState } from 'react';

const URGENCY_OPTIONS = ['Low', 'Moderate', 'Urgent'];
const STATUS_OPTIONS  = ['Open', 'In Progress', 'Resolved'];

const URGENCY_BADGE = { Urgent: 'badge--high', Moderate: 'badge--moderate', Low: 'badge--low' };
const STATUS_BADGE = { Open: 'badge--open', 'In Progress': 'badge--pending', Resolved: 'badge--closed' };

const MOCK = [
  { id: 1, student_name: 'Juan dela Cruz',  referred_by: 'Ms. Reyes',  urgency: 'Urgent',   routed_to: 'Guidance Office', status: 'Open',        date: '2026-05-28', description: 'Behavioral concerns in class. Student shows signs of aggression towards classmates.', notes: '' },
  { id: 2, student_name: 'Maria Santos',    referred_by: 'Mr. Garcia', urgency: 'Moderate', routed_to: 'Guidance Office', status: 'In Progress', date: '2026-05-25', description: 'Academic stress and anxiety. Student reports difficulty coping with workload.', notes: 'Initial counseling session completed. Student agrees to weekly check-ins.' },
  { id: 3, student_name: 'Carlo Mendoza',   referred_by: 'Ms. Torres', urgency: 'Low',      routed_to: 'Guidance Office', status: 'Resolved',    date: '2026-05-20', description: 'Peer relationship issues. Student had falling out with friend group.', notes: 'Three sessions completed. Student reports improved relationships.' },
  { id: 4, student_name: 'Ana Flores',      referred_by: 'Mr. Lim',    urgency: 'Urgent',   routed_to: 'Guidance Office', status: 'Open',        date: '2026-05-30', description: 'Family concerns affecting studies. Student distracted and withdrawn.', notes: '' },
  { id: 5, student_name: 'Paolo Reyes',     referred_by: 'Ms. Cruz',   urgency: 'Moderate', routed_to: 'Guidance Office', status: 'In Progress', date: '2026-05-27', description: 'Career guidance consultation. Student unsure about course selection.', notes: 'Assessment completed. Discussed career options aligned with interests.' },
];

function ViewModal({ referral, onClose, onStatusChange, onAddNote }) {
  const [status, setStatus] = useState(referral.status);
  const [noteText, setNoteText] = useState('');

  function handleStatusSave() {
    onStatusChange(referral.id, status);
    onClose();
  }

  function handleAddNote() {
    if (!noteText.trim()) return;
    onAddNote(referral.id, noteText.trim());
    setNoteText('');
  }

  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal__box">
        <div className="modal__header">
          <h3>Referral Details</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__details" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20, fontSize: '0.85rem' }}>
          <div className="modal__field"><span className="modal__label">Student</span><span className="modal__value">{referral.student_name}</span></div>
          <div className="modal__field"><span className="modal__label">Referred by</span><span className="modal__value">{referral.referred_by}</span></div>
          <div className="modal__field"><span className="modal__label">Date</span><span className="modal__value">{referral.date}</span></div>
          <div className="modal__field"><span className="modal__label">Routed to</span><span className="modal__value">{referral.routed_to}</span></div>
          <div className="modal__field"><span className="modal__label">Urgency</span><span className={`badge ${URGENCY_BADGE[referral.urgency] || ''}`}>{referral.urgency}</span></div>
          <div className="modal__field"><span className="modal__label">Status</span>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="select" style={{ maxWidth: '100%', marginTop: 4 }}>
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="modal__context" style={{ background: '#f7f9fc', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.83rem', color: '#334155' }}>
          {referral.description || '—'}
        </div>

        {referral.notes && (
          <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: '0.83rem' }}>
            <strong style={{ color: '#1565c0' }}>Counseling Notes</strong>
            <p style={{ margin: '4px 0 0', color: '#1a3a5c' }}>{referral.notes}</p>
          </div>
        )}

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e8edf2' }}>
          <label className="form-label">Add Counseling Note</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={2}
              className="textarea" style={{ minHeight: 60, flex: 1 }}
              placeholder="Document your session notes..." />
            <button onClick={handleAddNote} disabled={!noteText.trim()}
              className="btn btn--sm" style={{ alignSelf: 'flex-end' }}>
              Add
            </button>
          </div>
        </div>

        <div className="modal__actions">
          <button className="btn btn--outline" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={handleStatusSave}>Update Status</button>
        </div>
      </div>
    </div>
  );
}

export default function GuidanceReferralsPage() {
  const [referrals, setReferrals] = useState(MOCK);
  const [search, setSearch] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null);

  const filtered = referrals.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.student_name.toLowerCase().includes(q) || r.referred_by?.toLowerCase().includes(q);
    const matchUrgency = !filterUrgency || r.urgency === filterUrgency;
    const matchStatus  = !filterStatus  || r.status  === filterStatus;
    return matchSearch && matchUrgency && matchStatus;
  });

  function handleStatusChange(id, status) {
    setReferrals(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }

  function handleAddNote(id, note) {
    setReferrals(prev => prev.map(r =>
      r.id === id ? { ...r, notes: r.notes ? `${r.notes}\n${note}` : note } : r
    ));
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Referrals</h1>
        <p className="page-subtitle">Manage referrals assigned to Guidance Office</p>
      </div>

      <div className="filters">
        <input
          className="input"
          placeholder="Search by student or referrer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="select" value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)}>
          <option value="">All urgencies</option>
          {URGENCY_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
        <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      <div className="card table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Referred by</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6}><div className="empty-state">No referrals found.</div></td></tr>
            )}
            {filtered.map(r => (
              <tr key={r.id}>
                <td><span className="student-name">{r.student_name}</span></td>
                <td className="text-muted">{r.referred_by || '—'}</td>
                <td><span className={`badge ${URGENCY_BADGE[r.urgency] || ''}`}>{r.urgency}</span></td>
                <td><span className={`badge ${STATUS_BADGE[r.status] || ''}`}>{r.status}</span></td>
                <td className="text-muted">{r.date || '—'}</td>
                <td>
                  <button className="btn btn--sm" onClick={() => setModal({ type: 'view', data: r })}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal?.type === 'view' && (
        <ViewModal
          referral={modal.data}
          onClose={() => setModal(null)}
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
        />
      )}
    </div>
  );
}
