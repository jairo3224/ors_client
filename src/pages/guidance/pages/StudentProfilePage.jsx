import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGuidanceData } from '../hooks/useGuidanceData';

function priorityClass(p) {
  const map = { low: 'badge--low', moderate: 'badge--moderate', high: 'badge--high', critical: 'badge--critical' };
  return map[p] || 'badge--low';
}

function statusBadgeClass(s) {
  const map = { reported: 'badge--reported', under_review: 'badge--reviewed', investigating: 'badge--warning', referred: 'badge--forwarded', in_progress: 'badge--pending', resolved: 'badge--resolved', closed: 'badge--dismissed', dismissed: 'badge--dismissed' };
  return map[s] || 'badge--pending';
}

export default function StudentProfilePage() {
  const { studentName } = useParams();
  const navigate = useNavigate();
  const decodedName = decodeURIComponent(studentName || '');
  const { getStudentHistory, isLoading: globalLoading } = useGuidanceData();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!decodedName) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getStudentHistory(decodedName)
      .then(h => { setHistory(h); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [decodedName, getStudentHistory]);

  if (loading || globalLoading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Student Profile</h1>
        </div>
        <div className="card empty-state" style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading student profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Student Profile</h1>
        </div>
        <div className="card empty-state" style={{ color: '#c62828' }}>Error: {error}</div>
      </div>
    );
  }

  if (!decodedName || !history) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Student Profile</h1>
        </div>
        <div className="card empty-state">Student not found.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>Name: {decodedName}</h1>
            <p className="page-subtitle" style={{ margin: '2px 0 0' }}>
              Student Profile · Incident & Referral History
            </p>
          </div>
        </div>
        <button className="btn btn--outline btn--sm" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#fce4ec', color: '#c62828' }}>⚠️</div>
          <div>
            <div className="stat-card__value">{history.incidents.length}</div>
            <div className="stat-card__label">Total Incidents</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#fff3e0', color: '#e65100' }}>📨</div>
          <div>
            <div className="stat-card__value">{history.referrals.length}</div>
            <div className="stat-card__label">Referrals</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#e3f2fd', color: '#1565c0' }}>🛋️</div>
          <div>
            <div className="stat-card__value">{history.meetings.length}</div>
            <div className="stat-card__label">Counseling Sessions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#e8f5e9', color: '#2e7d32' }}>📋</div>
          <div>
            <div className="stat-card__value">{history.assessments.length}</div>
            <div className="stat-card__label">Assessments</div>
          </div>
        </div>
      </div>

      {/* Incident History */}
      <div className="card">
        <h3 className="card__title">Incident History</h3>
        {history.incidents.length === 0 ? (
          <div className="empty-state">No incidents recorded.</div>
        ) : (
          <div className="table-card">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date Reported</th>
                  <th>Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {history.incidents.map(inc => (
                  <tr key={inc.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1a3a5c', fontSize: '0.85rem' }}>{inc.type}</div>
                    </td>
                    <td><span className={`badge ${priorityClass(inc.priority)}`}>{inc.priority}</span></td>
                    <td><span className={`badge ${statusBadgeClass(inc.status)}`}>{inc.status}</span></td>
                    <td className="mono">{inc.date_reported}</td>
                    <td className="text-muted">{inc.assigned_to || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Referral History */}
      <div className="card">
        <h3 className="card__title">Referral History</h3>
        {history.referrals.length === 0 ? (
          <div className="empty-state">No referrals found.</div>
        ) : (
          history.referrals.map(ref => (
            <div key={ref.id} className="report-item">
              <div className="report-item__info">
                <div className="report-item__name">{ref.subject}</div>
                <div className="report-item__meta">{ref.from_office} → {ref.to_office}</div>
                <div className="report-item__badges">
                  <span className={`badge ${statusBadgeClass(ref.status)}`}>{ref.status}</span>
                </div>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.8rem' }}>{ref.description}</p>
                {ref.response && (
                  <div className="remarks-box" style={{ marginTop: 6 }}>
                    <div className="remarks-box__heading">Response</div>
                    <div style={{ whiteSpace: 'pre-line' }}>{ref.response}</div>
                  </div>
                )}
              </div>
              <div className="report-item__date">{ref.date_sent}</div>
            </div>
          ))
        )}
      </div>

      {/* Counseling Sessions */}
      <div className="card">
        <h3 className="card__title">Counseling Sessions</h3>
        {history.meetings.length === 0 ? (
          <div className="empty-state">No counseling sessions recorded.</div>
        ) : (
          history.meetings.map(mtg => (
            <div key={mtg.id} className="report-item">
              <div className="report-item__info">
                <div className="report-item__name">{mtg.title}</div>
                <div className="report-item__meta">{mtg.location} · {mtg.date} {mtg.time}</div>
                <div className="report-item__badges">
                  <span className={`badge badge--${mtg.status === 'completed' ? 'success' : mtg.status === 'scheduled' ? 'pending' : 'warning'}`}>
                    {mtg.status}
                  </span>
                </div>
                {mtg.minutes && (
                  <div className="remarks-box" style={{ marginTop: 6 }}>
                    <div className="remarks-box__heading">Minutes</div>
                    {mtg.minutes}
                  </div>
                )}
                {mtg.outcomes && (
                  <div className="remarks-box" style={{ marginTop: 6 }}>
                    <div className="remarks-box__heading">Outcomes</div>
                    {mtg.outcomes}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assessments */}
      {history.assessments.length > 0 && (
        <div className="card">
          <h3 className="card__title">Assessments</h3>
          {history.assessments.map(a => (
            <div key={a.id} className="report-item">
              <div className="report-item__info">
                <div className="report-item__name">{a.type} · {a.assessor}</div>
                <div className="report-item__badges">
                  <span className={`badge badge--${a.status}`}>{a.status}</span>
                </div>
                {a.assessment && (
                  <div className="remarks-box" style={{ marginTop: 6 }}>
                    <div className="remarks-box__heading">Assessment</div>
                    {a.assessment}
                  </div>
                )}
                {a.recommendation && (
                  <div className="remarks-box" style={{ marginTop: 6 }}>
                    <div className="remarks-box__heading">Recommendation</div>
                    {a.recommendation}
                  </div>
                )}
              </div>
              <div className="report-item__date">{a.date}</div>
            </div>
          ))}
        </div>
      )}

      {/* Sanctions */}
      {history.sanctions.length > 0 && (
        <div className="card">
          <h3 className="card__title">Sanctions</h3>
          {history.sanctions.map(s => (
            <div key={s.id} className="report-item">
              <div className="report-item__info">
                <div className="report-item__name">{s.type.replace('_', ' ')}</div>
                <div className="report-item__meta">Issued by: {s.issued_by} · {s.date_issued}</div>
                <div className="report-item__badges">
                  <span className={`badge badge--${s.status}`}>{s.status}</span>
                </div>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.8rem' }}>{s.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
