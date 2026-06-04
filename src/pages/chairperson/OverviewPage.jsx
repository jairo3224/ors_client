import { useOutletContext } from 'react-router-dom';
import './components/OverviewPage.css';

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

const PRIORITY_CLASS = {
  low: 'priority--low',
  medium: 'priority--medium',
  high: 'priority--high',
};

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon" style={{ backgroundColor: accent + '22', color: accent }}>
        {icon}
      </div>
      <div>
        <div className="stat-card__value">{value}</div>
        <div className="stat-card__label">{label}</div>
        {sub && <div className="stat-card__sub" style={{ color: accent }}>{sub}</div>}
      </div>
    </div>
  );
}

function Avatar({ name }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return <div className="avatar">{initials}</div>;
}

export default function OverviewPage() {
  const { students, reports, cases, user } = useOutletContext();

  const studentsWithCases = students.filter(s => s.cases_count > 0).length;
  const pendingReports = reports.filter(r => r.displayStatus === 'pending').length;
  const openCases = cases.filter(c => c.status === 'open').length;
  const highPriority = cases.filter(c => c.priority === 'high').length;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <h1 className="page-title">📊 Overview</h1>
            <p className="page-subtitle">
              {user?.department_name || 'Department'} ·{' '}
              {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon="👥" label="Total Students" value={students.length} accent="#1a3a5c" />
        <StatCard icon="⚠️" label="Students with Cases" value={studentsWithCases} sub={studentsWithCases ? 'Needs attention' : 'All clear'} accent={studentsWithCases ? '#c62828' : '#2e7d32'} />
        <StatCard icon="📄" label="Pending Reports" value={pendingReports} sub="Awaiting review" accent="#f57f17" />
        <StatCard icon="🗂️" label="Active Cases" value={openCases} sub={highPriority ? `${highPriority} high priority` : undefined} accent="#4527a0" />
      </div>

      <div className="overview-panels">
        <div className="card">
          <h3 className="card__title">Recent Reports</h3>
          {reports.slice(0, 3).map(r => (
            <div key={r.id} className="report-item">
              <Avatar name={r.student_name} />
              <div className="report-item__info">
                <div className="report-item__name">{r.student_name}</div>
                <div className="report-item__meta">{r.subject} · {r.teacher_name}</div>
                <div className="report-item__badges">
                  <span className={`badge ${SEVERITY_CLASS[r.severity] || 'badge--moderate'}`}>{r.severity}</span>
                  <span className={`badge ${STATUS_CLASS[r.displayStatus] || ''}`}>{r.displayStatus}</span>
                </div>
              </div>
              <div className="report-item__date">{r.date_submitted}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 className="card__title">Case Tracker</h3>
          {cases.map(c => (
            <div key={c.id} className="case-item">
              <span className={`priority-dot ${PRIORITY_CLASS[c.priority] || 'priority--medium'}`} />
              <div className="case-item__info">
                <div className="case-item__title">{c.title}</div>
                <div className="case-item__student">{c.student_name}</div>
              </div>
              <span className={`badge ${STATUS_CLASS[c.status] || ''}`}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}