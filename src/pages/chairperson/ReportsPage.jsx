import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import './components/ReportsPage.css';

function Avatar({ name }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return <div className="avatar">{initials}</div>;
}

const SEVERITY_CLASS = {
  low: 'badge--low',
  medium: 'badge--moderate',
  high: 'badge--high',
  critical: 'badge--high',
};

const STATUS_CLASS = {
  pending: 'badge--pending',
  reviewed: 'badge--reviewed',
  forwarded: 'badge--forwarded',
  in_progress: 'badge--in_progress',
  resolved: 'badge--resolved',
  referred: 'badge--referred',
  closed: 'badge--closed',
};

export default function ReportsPage() {
  const { reports, setRemarkTarget, setForwardTarget, setForwardType, user } = useOutletContext();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  const filtered = reports.filter(r => {
    const matchSearch = r.student_name.toLowerCase().includes(search.toLowerCase()) || r.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.displayStatus === filterStatus;
    const matchSev = filterSeverity === 'all' || r.severity === filterSeverity;
    return matchSearch && matchStatus && matchSev;
  });

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <h1 className="page-title">📄 Reports</h1>
            <p className="page-subtitle">
              {user?.department_name || 'Department'} ·{' '}
              {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <div className="filters">
        <input className="input" placeholder="Search student or subject..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="referred">Referred</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select className="select" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
          <option value="all">All Severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {filtered.map(report => (
        <div key={report.id} className="card report-card">
          <div className="report-card__header">
            <div className="report-card__student">
              <Avatar name={report.student_name} />
              <div>
                <div className="report-card__name">{report.student_name}</div>
                <div className="report-card__meta">{report.subject} · Reported by {report.teacher_name}</div>
              </div>
            </div>
            <div className="report-card__labels">
              <span className={`badge ${SEVERITY_CLASS[report.severity] || 'badge--moderate'}`}>{report.severity}</span>
              <span className={`badge ${STATUS_CLASS[report.displayStatus] || ''}`}>{report.displayStatus}</span>
              <span className="report-card__date">{report.date_submitted}</span>
            </div>
          </div>
          <p className="report-card__desc">{report.description}</p>
          {report.remarks?.length > 0 && (
            <div className="remarks-box">
              <div className="remarks-box__heading">CHAIRPERSON REMARKS</div>
              {report.remarks.map((rem, i) => (
                <div key={i} className="remark-item">
                  <span className="remark-item__author">{rem.author}</span>
                  <span className="remark-item__date">{rem.date}</span>
                  <div className="remark-item__text">{rem.text}</div>
                </div>
              ))}
            </div>
          )}
          <div className="report-card__actions">
            <button className="btn btn--sm" onClick={() => setRemarkTarget(report)}>Add Remark</button>
            {/* Only allow forwarding if the incident is NOT already referred, closed, resolved, or in progress */}
            {report.displayStatus !== 'referred' &&
              report.displayStatus !== 'closed' &&
              report.displayStatus !== 'resolved' &&
              report.displayStatus !== 'in_progress' && (
              <button className="btn btn--sm btn--warning" onClick={() => { setForwardTarget(report); setForwardType('report'); }}>
                Forward to OSAS
              </button>
            )}
          </div>
        </div>
      ))}
      {filtered.length === 0 && <div className="card empty-state">No reports found.</div>}
    </div>
  );
}