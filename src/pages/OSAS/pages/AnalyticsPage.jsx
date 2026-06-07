import { useState, useMemo } from 'react';
import { AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { useOSASAnalytics } from '../hooks/useOSASAnalytics';

const TYPE_CATEGORY = {
  'Disrespectful Behavior': 'behavioral',
  'Bullying': 'behavioral',
  'Physical Altercation': 'disciplinary',
  'Cheating': 'academic',
  'Attendance Issue': 'attendance',
  'Other': 'other',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function computeTrends(reports) {
  const counts = {};
  reports.forEach(r => {
    const m = new Date(r.date_submitted).getMonth();
    const cat = TYPE_CATEGORY[r.type] || 'other';
    if (!counts[m]) counts[m] = { behavioral: 0, academic: 0, disciplinary: 0, attendance: 0, other: 0 };
    counts[m][cat]++;
  });
  return MONTHS.map((month, i) => ({
    month,
    behavioral: counts[i]?.behavioral || 0,
    academic: counts[i]?.academic || 0,
    disciplinary: counts[i]?.disciplinary || 0,
    attendance: counts[i]?.attendance || 0,
  }));
}

function computeWorkload(cases) {
  const offices = {};
  cases.forEach(c => {
    const name = c.assigned_to || 'Unassigned';
    if (!offices[name]) offices[name] = { total: 0, resolved: 0 };
    offices[name].total++;
    if (c.status === 'closed' || c.status === 'resolved') offices[name].resolved++;
  });
  return Object.entries(offices).map(([name, d]) => ({
    name, total: d.total, pending: d.total - d.resolved, resolved: d.resolved,
  }));
}

function computeRecidivism(reports, sanctions) {
  const counts = {};
  reports.forEach(r => {
    if (!counts[r.student_name]) counts[r.student_name] = { incidents: 0, sanctions: 0 };
    counts[r.student_name].incidents++;
  });
  sanctions.forEach(s => {
    if (counts[s.student_name]) counts[s.student_name].sanctions++;
  });
  return Object.entries(counts)
    .filter(([, c]) => c.incidents > 1)
    .map(([student, c]) => ({
      student,
      incidents: c.incidents,
      sanctions: c.sanctions,
      period: 'This period',
      trend: c.incidents >= 3 ? 'increasing' : c.sanctions > 0 ? 'decreasing' : 'stable',
    }));
}

export default function AnalyticsPage() {
  const { analytics, loading } = useOSASAnalytics();
  const [tab, setTab] = useState('workload');
  const [expanded, setExpanded] = useState(false);

  const reports = useMemo(() => analytics?.reports || [], [analytics]);
  const cases = useMemo(() => analytics?.cases || [], [analytics]);
  const sanctions = useMemo(() => analytics?.sanctions || [], [analytics]);
  const MOCK_TRENDS = useMemo(() => computeTrends(reports), [reports]);
  const MONTHLY_TOTALS = useMemo(() => MOCK_TRENDS.map(m => ({ month: m.month, total: m.behavioral + m.academic + m.disciplinary + m.attendance })), [MOCK_TRENDS]);
  const MOCK_STAFF_WORKLOAD = useMemo(() => computeWorkload(cases), [cases]);
  const MOCK_RECIDIVISM = useMemo(() => computeRecidivism(reports, sanctions), [reports, sanctions]);

  if (loading) return <div className="loading">Loading analytics...</div>;

  const totalByType = MOCK_TRENDS.reduce((acc, m) => ({ behavioral: acc.behavioral + m.behavioral, academic: acc.academic + m.academic, disciplinary: acc.disciplinary + m.disciplinary, attendance: acc.attendance + m.attendance }), { behavioral: 0, academic: 0, disciplinary: 0, attendance: 0 });
  const totalIncidents = MONTHLY_TOTALS.reduce((sum, m) => sum + m.total, 0);

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Reports & Records</h1><p className="page-subtitle">Incident trends, staff workload, and recidivism tracking.</p></div>

      <div className="card" style={{ padding: '24px 28px', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#1a3a5c', lineHeight: 1 }}>{totalIncidents}</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Incidents</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>▼</span>
        </div>
        {expanded && (
          <div style={{ marginTop: 14, borderTop: '1px solid #e8edf2', paddingTop: 14, textAlign: 'center', overflowX: 'auto' }}>
            <table className="table" style={{ margin: '0 auto' }}>
              <thead>
                <tr>
                  <th>MONTH</th>
                  {MONTHLY_TOTALS.map(m => (
                    <th key={m.month} style={{ textAlign: 'center' }}>{m.month}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Total</strong></td>
                  {MONTHLY_TOTALS.map(m => (
                    <td key={m.month} style={{ textAlign: 'center' }}>{m.total}</td>
                  ))}
                </tr>
              </tbody>
            </table>
            <div style={{ marginTop: 8, fontSize: '0.85rem', color: '#1a3a5c', fontWeight: 700 }}>
              TOTAL: {totalIncidents}
            </div>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#fce4ec', color: '#c62828' }}><AlertTriangle size={20} /></div><div><div className="stat-card__value">{totalByType.disciplinary}</div><div className="stat-card__label">Disciplinary</div><div className="stat-card__sub" style={{ color: '#c62828' }}>{Math.round(totalByType.disciplinary / totalIncidents * 100)}% of total (YTD)</div></div></div>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}><TrendingUp size={20} /></div><div><div className="stat-card__value">{MOCK_RECIDIVISM.filter(r => r.trend === 'increasing').length}</div><div className="stat-card__label">Repeat Offenders</div><div className="stat-card__sub" style={{ color: '#e65100' }}>Needs intervention</div></div></div>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}><Users size={20} /></div><div><div className="stat-card__value">{MOCK_STAFF_WORKLOAD.length}</div><div className="stat-card__label">Offices Tracking</div><div className="stat-card__sub" style={{ color: '#2e7d32' }}>Active this period</div></div></div>
      </div>

      <div style={{ display: 'flex', gap: 0, marginBottom: 18, borderBottom: '2px solid #e8edf2' }}>
        {['workload', 'recidivism'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 20px', border: 'none', background: 'transparent', color: tab === t ? '#1a3a5c' : '#64748b', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', borderBottom: tab === t ? '2px solid #1a3a5c' : '2px solid transparent', marginBottom: -2, textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {tab === 'workload' && (
        <div>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {MOCK_STAFF_WORKLOAD.map(w => (
              <div key={w.name} className="workload-card">
                <div className="workload-card__header">
                  <span className="workload-card__label">{w.name}</span>
                  <span className="workload-card__value" style={{ fontSize: '1rem' }}>{w.total} cases</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: 8 }}>
                  <span>Pending: <strong style={{ color: '#e65100' }}>{w.pending}</strong></span>
                  <span>Resolved: <strong style={{ color: '#2e7d32' }}>{w.resolved}</strong></span>
                </div>
                <div className="workload-bar">
                  <div className="workload-bar__fill" style={{ width: `${(w.resolved / w.total) * 100}%`, backgroundColor: '#1565c0' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'recidivism' && (
        <div className="card">
          <div className="card__title">Repeat Offenders</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead><tr><th>Student</th><th>Incidents</th><th>Sanctions</th><th>Period</th><th>Trend</th><th>Status</th></tr></thead>
              <tbody>
                {MOCK_RECIDIVISM.map(r => (
                  <tr key={r.student}>
                    <td><strong>{r.student}</strong></td>
                    <td>{r.incidents}</td>
                    <td>{r.sanctions}</td>
                    <td>{r.period}</td>
                    <td>
                      <span className={`badge ${r.trend === 'increasing' ? 'badge--high' : r.trend === 'decreasing' ? 'badge--low' : 'badge--moderate'}`}>
                        {r.trend}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${r.trend === 'increasing' ? 'badge--high' : 'badge--active'}`}>
                        {r.trend === 'increasing' ? 'Needs Intervention' : 'Monitoring'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}