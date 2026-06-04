import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, UserCheck, MessageSquare, AlertTriangle, FileText, Clock } from 'lucide-react';
import Avatar from '../../../components/Avatar';
import Badge from '../../../components/Badge';
import StatusDropdown from '../../../components/StatusDropdown';
import Modal, { ModalHeader, ModalActions } from '../../../components/Modal';
import { PRIORITY_COLORS, INCIDENT_STATUSES, INCIDENT_STATUS_COLORS } from '../../../constants';
import { useOSASIncidents } from '../hooks/useOSASIncidents';

function AssignModal({ incident, onClose, onAssign }) {
  const [selected, setSelected] = useState('');
  const [reason, setReason] = useState('');
  const [confirming, setConfirming] = useState(false);
  const offices = ['Guidance Office', 'Department Head', 'Chaplain'];
  if (!incident) return null;

  if (confirming) {
    return (
      <Modal onClose={onClose}>
        <ModalHeader onClose={onClose}>Confirm Assignment</ModalHeader>
        <p className="modal__context">{incident.student_name} · {incident.type}</p>
        <div className="remarks-box" style={{ margin: '16px 0' }}>
          <div className="remarks-box__heading">Forwarding to</div>
          <strong style={{ color: '#1a3a5c' }}>{selected}</strong>
        </div>
        {reason && <div className="remarks-box" style={{ marginBottom: 16 }}><div className="remarks-box__heading">Reason</div>{reason}</div>}
        <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>This will forward the incident to <strong>{selected}</strong> and update the status to <strong>forwarded</strong>. Continue?</p>
        <ModalActions>
          <button className="btn btn--outline" onClick={() => setConfirming(false)}>Cancel</button>
          <button className="btn" onClick={() => { onAssign(incident.id, selected, reason); onClose(); }}>Continue</button>
        </ModalActions>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <ModalHeader onClose={onClose}>Assign Incident</ModalHeader>
      <p className="modal__context">{incident.student_name} · {incident.type}</p>
      <div className="form-group">
        <label className="form-label">Assign to Office</label>
        <div className="forward-options">
          {offices.map(o => (
            <button key={o} onClick={() => setSelected(o)} className={`forward-option ${selected === o ? 'forward-option--selected' : ''}`}>{o}</button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Reason for Assignment</label>
        <textarea className="textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain why this incident is being assigned to this office..." style={{ minHeight: 80 }} />
      </div>
      <ModalActions>
        <button className="btn btn--outline" onClick={onClose}>Cancel</button>
        <button className="btn" disabled={!selected || !reason.trim()} onClick={() => setConfirming(true)}>Assign</button>
      </ModalActions>
    </Modal>
  );
}

function NoteModal({ incident, onClose, onSave }) {
  const [note, setNote] = useState(incident?.notes || '');
  if (!incident) return null;
  return (
    <Modal onClose={onClose}>
      <ModalHeader onClose={onClose}>Investigation Notes</ModalHeader>
      <p className="modal__context">{incident.student_name} · {incident.type}</p>
      <textarea className="textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="Add investigation notes, findings, or action items..." style={{ minHeight: 120 }} />
      <ModalActions>
        <button className="btn btn--outline" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={() => { onSave(incident.id, note); onClose(); }}>Save Notes</button>
      </ModalActions>
    </Modal>
  );
}

export default function IncidentsPage() {
  const {
    loading,
    filteredIncidents,
    stats,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    updateStatus,
    assignIncident,
    saveIncidentNote,
  } = useOSASIncidents();
  const [assignTarget, setAssignTarget] = useState(null);
  const [noteTarget, setNoteTarget] = useState(null);

  const handleStatusChange = updateStatus;
  const handleAssign = assignIncident;
  const handleSaveNote = saveIncidentNote;

  const filtered = filteredIncidents;

  if (loading) return <div className="loading">Loading incidents...</div>;

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Incident Management</h1><p className="page-subtitle">Review, assign, investigate, and resolve incident reports.</p></div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}><FileText size={20} /></div><div><div className="stat-card__value">{stats.total}</div><div className="stat-card__label">Total Incidents</div></div></div>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#ede7f6', color: '#4527a0' }}><Clock size={20} /></div><div><div className="stat-card__value">{stats.reported}</div><div className="stat-card__label">Pending Review</div></div></div>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}><UserCheck size={20} /></div><div><div className="stat-card__value">{stats.underReview}</div><div className="stat-card__label">Under Review</div></div></div>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#fce4ec', color: '#c62828' }}><AlertTriangle size={20} /></div><div><div className="stat-card__value">{stats.critical}</div><div className="stat-card__label">Critical</div></div></div>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}><CheckCircle size={20} /></div><div><div className="stat-card__value">{stats.resolved}</div><div className="stat-card__label">Resolved</div></div></div>
      </div>
      <div className="filters">
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="input" style={{ paddingLeft: 36, width: '100%' }} placeholder="Search student, teacher, type..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          {INCIDENT_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select className="select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">All Priority</option>
          {Object.keys(PRIORITY_COLORS).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(incident => (
          <div key={incident.id} className="card" style={{ borderLeft: `4px solid ${PRIORITY_COLORS[incident.priority] || '#ccc'}`, margin: 0 }}>
            <div className="report-card__header">
              <div className="report-card__student">
                <Avatar name={incident.student_name} />
                <div>
                  <div className="report-card__name">{incident.student_name}</div>
                  <div className="report-card__meta">{incident.teacher_name} · {incident.student_id}</div>
                </div>
              </div>
              <div className="report-card__labels">
                <Badge label={incident.type} color={PRIORITY_COLORS[incident.priority] || '#64748b'} />
                <Badge label={incident.priority} color={PRIORITY_COLORS[incident.priority] || '#64748b'} />
                <StatusDropdown options={INCIDENT_STATUSES} colors={INCIDENT_STATUS_COLORS} current={incident.status} onChange={(s) => handleStatusChange(incident.id, s)} />
              </div>
            </div>
            <p className="report-card__desc" style={{ marginLeft: 46 }}>{incident.description}</p>
            <div style={{ marginLeft: 46, display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.78rem', color: '#64748b', marginBottom: incident.notes || incident.assigned_to || incident.assignment_reason ? 10 : 0 }}>
              <span>Reported: {incident.date_reported}</span>
              {incident.assigned_to && <span>· Assigned to: <strong style={{ color: '#1a3a5c' }}>{incident.assigned_to}</strong></span>}
            </div>
            {incident.assignment_reason && <div className="remarks-box" style={{ marginLeft: 46 }}><div className="remarks-box__heading">Reason for Assignment</div>{incident.assignment_reason}</div>}
            {incident.notes && <div className="remarks-box" style={{ marginLeft: 46 }}><div className="remarks-box__heading">Notes</div>{incident.notes}</div>}
            <div className="report-card__actions" style={{ marginLeft: 46 }}>
              <button className="btn btn--sm" onClick={() => setAssignTarget(incident)}><UserCheck size={13} style={{ marginRight: 4 }} />Assign</button>
              <button className="btn btn--sm btn--outline" onClick={() => setNoteTarget(incident)}><MessageSquare size={13} style={{ marginRight: 4 }} />Notes</button>
              {incident.status !== 'resolved' && incident.status !== 'dismissed' && (
                <><button className="btn btn--sm btn--success" onClick={() => handleStatusChange(incident.id, 'resolved')}><CheckCircle size={13} style={{ marginRight: 4 }} />Resolve</button>
                  <button className="btn btn--sm btn--danger" onClick={() => handleStatusChange(incident.id, 'dismissed')}><XCircle size={13} style={{ marginRight: 4 }} />Dismiss</button></>
              )}

            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="empty-state" style={{ padding: 60 }}>No incidents match your filters.</div>}
      </div>
      {assignTarget && <AssignModal incident={assignTarget} onClose={() => setAssignTarget(null)} onAssign={handleAssign} />}
      {noteTarget && <NoteModal incident={noteTarget} onClose={() => setNoteTarget(null)} onSave={handleSaveNote} />}
    </div>
  );
}
