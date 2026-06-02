import { useOutletContext } from 'react-router-dom';

function Avatar({ name }) {
  const initials = (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return <div className="avatar">{initials}</div>;
}

export default function ReportsPage() {
  const context = useOutletContext();
  const { myIncidents = [], loading = false, setForwardTarget } = context || {};

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>📋 My Reports</h1>
          <div className="date">
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="reports-view"><p>Loading...</p></div>
      </div>
    );
  }

  if (myIncidents.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h1>📋 My Reports</h1>
          <div className="date">
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="reports-view">
          <div className="card empty-state">
            <p>No incident reports yet.</p>
          </div>
        </div>
      </div>
    );
  }

  function severityClass(level) {
    const map = { low: 'badge-low', medium: 'badge-moderate', high: 'badge-high', critical: 'badge-critical' };
    return map[level] || 'badge-low';
  }

  function severityLabel(level) {
    const labels = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };
    return labels[level] || level;
  }

  function statusClass(status) {
    const map = { reported: 'badge-reported', under_review: 'badge-reviewed', referred: 'badge-forwarded', in_progress: 'badge-pending', resolved: 'badge-resolved', closed: 'badge-dismissed' };
    return map[status] || 'badge-pending';
  }

  function statusLabel(status) {
    const labels = { reported: 'Reported', under_review: 'Under Review', referred: 'Referred', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' };
    return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
  }

  return (
    <div>
      <div className="page-header">
        <h1>📋 My Reports</h1>
        <div className="date">
          {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="reports-view">
        <div className="reports-list">
          {Array.isArray(myIncidents) && myIncidents.map(incident => (
            <div key={incident.id} className="report-card card">
              <div className="report-top">
                <div className="report-student">
                  <Avatar name={incident.student_name} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.95rem' }}>
                      {incident.student_name || 'Unknown Student'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {incident.type_name} · {incident.urgency_level} urgency
                    </div>
                  </div>
                </div>
                <div className="report-meta">
                  <span className={`badge ${severityClass(incident.urgency_level)}`}>{severityLabel(incident.urgency_level)}</span>
                  <span className={`badge ${statusClass(incident.current_status)}`}>{statusLabel(incident.current_status)}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: 4 }}>
                    {new Date(incident.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="report-desc">{incident.description}</p>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {incident.current_status === 'reported' && (
                  <button className="btn btn--sm btn--warning" onClick={() => setForwardTarget?.(incident)}>Forward</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
