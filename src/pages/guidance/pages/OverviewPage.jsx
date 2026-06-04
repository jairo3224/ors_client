import { useNavigate } from 'react-router-dom';
import { useGuidanceData } from '../hooks/useGuidanceData';

export default function OverviewPage() {
  const navigate = useNavigate();
  const {
    pendingReferralCount,
    openCasesCount,
    upcomingMeetingsCount,
    totalReferralsCount,
    referralsToGuidance,
    upcomingMeetings,
    openCases,
  } = useGuidanceData();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Guidance Office Overview</h1>
        <p className="page-subtitle">
          {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#e3f2fd', color: '#1565c0' }}>📨</div>
          <div>
            <div className="stat-card__value">{pendingReferralCount}</div>
            <div className="stat-card__label">Pending Referrals</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#fff3e0', color: '#e65100' }}>📋</div>
          <div>
            <div className="stat-card__value">{openCasesCount}</div>
            <div className="stat-card__label">Open Cases</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#e8f5e9', color: '#2e7d32' }}>🛋️</div>
          <div>
            <div className="stat-card__value">{upcomingMeetingsCount}</div>
            <div className="stat-card__label">Upcoming Sessions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#fce4ec', color: '#c62828' }}>🔄</div>
          <div>
            <div className="stat-card__value">{totalReferralsCount}</div>
            <div className="stat-card__label">Total Referrals</div>
          </div>
        </div>
      </div>

      <div className="overview-panels">
        <div className="card">
          <h3 className="card__title">Recent Referrals</h3>
          {referralsToGuidance.length === 0 ? (
            <div className="empty-state">No referrals received.</div>
          ) : (
            referralsToGuidance.slice(0, 5).map(ref => (
              <div key={ref.id} className="report-item">
                <div className="report-item__info">
                  <div className="report-item__name">{ref.student_name}</div>
                  <div className="report-item__meta">{ref.subject} · {ref.from_office}</div>
                  <div className="report-item__badges">
                    <span className={`badge badge--${ref.status}`}>{ref.status}</span>
                  </div>
                </div>
                <div className="report-item__date">{ref.date_sent}</div>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h3 className="card__title">Upcoming Sessions</h3>
          {upcomingMeetings.length === 0 ? (
            <div className="empty-state">No upcoming sessions scheduled.</div>
          ) : (
            upcomingMeetings.slice(0, 5).map(mtg => (
              <div key={mtg.id} className="report-item">
                <div className="report-item__info">
                  <div className="report-item__name">{mtg.student_name}</div>
                  <div className="report-item__meta">{mtg.title}</div>
                  <div className="report-item__badges">
                    <span className={`badge badge--${mtg.status === 'in_progress' ? 'warning' : 'pending'}`}>
                      {mtg.status}
                    </span>
                  </div>
                </div>
                <div className="report-item__date">{mtg.date} {mtg.time}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="card__title">Active Cases</h3>
        {openCases.length === 0 ? (
          <div className="empty-state">No active cases.</div>
        ) : (
          <div className="table-card">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Opened</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {openCases.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div
                        style={{ cursor: 'pointer', color: '#1a3a5c', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'underline', textDecorationColor: '#94a3b8', textUnderlineOffset: 2 }}
                        onClick={() => navigate(`/guidance/student/${encodeURIComponent(c.student_name)}`)}
                      >
                        Name: {c.student_name}
                      </div>
                    </td>
                    <td>{c.type}</td>
                    <td>
                      <span className={`badge badge--${c.priority}`}>{c.priority}</span>
                    </td>
                    <td className="mono">{c.opened_date}</td>
                    <td>
                      <span className={`badge badge--${c.status}`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
