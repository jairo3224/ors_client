import { useOutletContext } from 'react-router-dom';
import './components/OverviewPage.css'; // optional overrides

const SEVERITY_CLASS = { low: 'badge--low', moderate: 'badge--moderate', high: 'badge--high' };
const STATUS_CLASS = { pending: 'badge--pending', reviewed: 'badge--reviewed', forwarded: 'badge--forwarded',
                        open: 'badge--open', referred: 'badge--referred', closed: 'badge--closed' };
const PRIORITY_CLASS = { low: 'priority--low', medium: 'priority--medium', high: 'priority--high' };

function StatCard({ icon, label, value, sub, accent }) { /* same as before */ }
function Avatar({ name }) { /* same */ }

export default function OverviewPage() {
  const { students, reports, cases, user } = useOutletContext();

  const flagged = students.filter(s => s.status === 'flagged').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const openCases = cases.filter(c => c.status === 'open').length;
  const highPriority = cases.filter(c => c.priority === 'high').length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📊 Overview</h1>
        <p className="page-subtitle">
          {user?.department_name || 'Department'} ·{' '}
          {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat cards, recent reports, case tracker – exactly the same JSX as before */}
      <div className="stats-grid">
        <StatCard icon="👥" label="Total Students" value={students.length} accent="#1a3a5c" />
        <StatCard icon="🚩" label="Flagged Students" value={flagged} sub={flagged ? 'Needs attention' : 'All clear'} accent={flagged ? '#c62828' : '#2e7d32'} />
        <StatCard icon="📄" label="Pending Reports" value={pendingReports} sub="Awaiting review" accent="#f57f17" />
        <StatCard icon="🗂️" label="Active Cases" value={openCases} sub={highPriority ? `${highPriority} high priority` : undefined} accent="#4527a0" />
      </div>

      <div className="overview-panels">
        {/* Recent Reports */}
        <div className="card">
          <h3 className="card__title">Recent Reports</h3>
          {reports.slice(0, 3).map(r => (
            <div key={r.id} className="report-item">
              <Avatar name={r.student_name} />
              <div className="report-item__info">
                <div className="report-item__name">{r.student_name}</div>
                <div className="report-item__meta">{r.subject} · {r.teacher_name}</div>
                <div className="report-item__badges">
                  <span className={`badge ${SEVERITY_CLASS[r.severity]}`}>{r.severity}</span>
                  <span className={`badge ${STATUS_CLASS[r.status]}`}>{r.status}</span>
                </div>
              </div>
              <div className="report-item__date">{r.date_submitted}</div>
            </div>
          ))}
        </div>

        {/* Case Tracker */}
        <div className="card">
          <h3 className="card__title">Case Tracker</h3>
          {cases.map(c => (
            <div key={c.id} className="case-item">
              <span className={`priority-dot ${PRIORITY_CLASS[c.priority]}`} />
              <div className="case-item__info">
                <div className="case-item__title">{c.title}</div>
                <div className="case-item__student">{c.student_name}</div>
              </div>
              <span className={`badge ${STATUS_CLASS[c.status]}`}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}