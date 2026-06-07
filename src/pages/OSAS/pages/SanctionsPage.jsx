import { useState, useMemo } from 'react';
import { AlertTriangle, Ban, Clock, FileText, ShieldAlert } from 'lucide-react';
import Avatar from '../../../components/Avatar';
import Modal, { ModalHeader, ModalActions } from '../../../components/Modal';
import { osasService } from '../../../services/osasService';
import { useOSASSanctions } from '../hooks/useOSASSanctions';

const SANCTION_TYPES = [
  { id: 'warning', label: 'Warning', icon: '\u26A0\uFE0F', color: '#f57f17' },
  { id: 'probation', label: 'Probation', icon: '\uD83D\uDCCB', color: '#1565c0' },
  { id: 'suspension', label: 'Suspension', icon: '\uD83D\uDEAB', color: '#c62828' },
  { id: 'community_service', label: 'Community Service', icon: '\uD83E\uDD1D', color: '#2e7d32' },
  { id: 'expulsion', label: 'Expulsion', icon: '\u26D4', color: '#b71c1c' },
];

function IssueSanctionModal({ onClose, onSubmit }) {
  const [studentName, setStudentName] = useState('');
  const [type, setType] = useState('');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  return (
    <Modal onClose={onClose} maxWidth={540}>
      <ModalHeader onClose={onClose}>Issue Sanction</ModalHeader>
      <div className="form-group">
        <label className="form-label">Student Name</label>
        <input className="input" style={{ width: '100%', maxWidth: '100%' }} value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Full name" />
      </div>
      <div className="form-group">
        <label className="form-label">Sanction Type</label>
        <div className="forward-options">
          {SANCTION_TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t.id)}
              className="forward-option" style={type === t.id ? { borderColor: t.color, background: `${t.color}18`, color: t.color } : {}}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Reason</label>
        <textarea className="textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for issuing this sanction..." />
      </div>
      <div className="form-group">
        <label className="form-label">Duration (optional)</label>
        <input className="input" style={{ width: '100%', maxWidth: '100%' }} value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 3 days, 1 semester, 20 hours" />
      </div>
      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea className="textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes or conditions..." />
      </div>
      <ModalActions>
        <button className="btn btn--outline" onClick={onClose}>Cancel</button>
        <button className="btn" disabled={!studentName || !type || !reason} onClick={() => { onSubmit({ studentName, type, reason, duration, notes }); onClose(); }}>Issue Sanction</button>
      </ModalActions>
    </Modal>
  );
}

export default function SanctionsPage() {
  const { sanctions, loading, refetch } = useOSASSanctions();
  const [showIssue, setShowIssue] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleIssue = async (data) => {
    await osasService.createSanction({ student_name: data.studentName, student_id: 'TBD', type: data.type, reason: data.reason, notes: data.notes, duration: data.duration || null });
    refetch();
  };
  const handleComplete = async (id) => {
    try { await osasService.updateSanction(id, { status: 'completed' }); } catch { /* fallback */ }
    refetch();
  };

  const filtered = (sanctions || []).filter(s => {
    const matchSearch = `${s.student_name} ${s.type} ${s.reason}`.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || s.type === filterType;
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });
  const stats = useMemo(() => ({ total: (sanctions || []).length, active: (sanctions || []).filter(s => s.status === 'active').length, pending: (sanctions || []).filter(s => s.status === 'pending').length, completed: (sanctions || []).filter(s => s.status === 'completed').length }), [sanctions]);

  if (loading) return <div className="loading">Loading sanctions...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1 className="page-title">Sanctions Management</h1><p className="page-subtitle">Issue and track warnings, probation, suspension, community service, and expulsion.</p></div>
        <button className="btn" onClick={() => setShowIssue(true)}><ShieldAlert size={14} style={{ marginRight: 6 }} />Issue Sanction</button>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}><FileText size={20} /></div><div><div className="stat-card__value">{stats.total}</div><div className="stat-card__label">Total Sanctions</div></div></div>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}><AlertTriangle size={20} /></div><div><div className="stat-card__value">{stats.pending}</div><div className="stat-card__label">Pending</div></div></div>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#fce4ec', color: '#c62828' }}><Ban size={20} /></div><div><div className="stat-card__value">{stats.active}</div><div className="stat-card__label">Active</div></div></div>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}><Clock size={20} /></div><div><div className="stat-card__value">{stats.completed}</div><div className="stat-card__label">Completed</div></div></div>
      </div>
      <div className="filters">
        <input className="input" placeholder="Search student or reason..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          {SANCTION_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option><option value="pending">Pending</option><option value="completed">Completed</option>
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(s => {
          const typeInfo = SANCTION_TYPES.find(t => t.id === s.type);
          return (
            <div key={s.id} className="card" style={{ borderLeft: `4px solid ${typeInfo?.color || '#ccc'}`, margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div className="report-card__student">
                  <Avatar name={s.student_name} />
                  <div>
                    <div className="report-card__name">{s.student_name}</div>
                    <div className="report-card__meta">{s.student_id} · {s.date_issued}</div>
                  </div>
                </div>
                <div className="report-card__labels">
                  <span className="badge" style={{ background: `${typeInfo?.color}18`, color: typeInfo?.color }}>{typeInfo?.icon} {typeInfo?.label}</span>
                  <span className="badge" style={s.status === 'active' ? { background: '#fce4ec', color: '#c62828' } : s.status === 'completed' ? { background: '#e8f5e9', color: '#2e7d32' } : { background: '#fff3e0', color: '#e65100' }}>{s.status}</span>
                </div>
              </div>
              <p className="report-card__desc" style={{ marginLeft: 46 }}>{s.reason}</p>
              <div style={{ marginLeft: 46, fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: s.notes ? 8 : 0 }}>
                <span>Issued by: <strong style={{ color: '#1a3a5c' }}>{s.issued_by}</strong></span>
                {s.duration && <span>Duration: <strong style={{ color: '#1a3a5c' }}>{s.duration}</strong></span>}
              </div>
              {s.notes && <div className="case-card__notes" style={{ marginLeft: 46 }}>{s.notes}</div>}
              {s.status === 'active' && <div className="report-card__actions" style={{ marginLeft: 46 }}><button className="btn btn--sm btn--success" onClick={() => handleComplete(s.id)}>Mark Completed</button></div>}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="empty-state" style={{ padding: 60 }}>No sanctions found.</div>}
      </div>
      {showIssue && <IssueSanctionModal onClose={() => setShowIssue(false)} onSubmit={handleIssue} />}
    </div>
  );
}
