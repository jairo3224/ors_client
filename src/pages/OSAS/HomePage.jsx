import { useEffect, useState } from 'react';
import { getStats, getReferrals } from './hooks/api';

const STAT_CONFIG = [
  { key: 'total',    label: 'Total Referrals', icon: '📋', accent: '#2e7d32' },
  { key: 'pending',  label: 'Pending Review',  icon: '⏳', accent: '#f57f17' },
  { key: 'active',   label: 'Active Cases',    icon: '🧠', accent: '#1565c0' },
  { key: 'resolved', label: 'Resolved Cases',  icon: '✅', accent: '#4527a0' },
];

const URGENCY_BADGE = { Urgent: 'badge--high', Moderate: 'badge--moderate', Low: 'badge--low' };
const STATUS_BADGE = { Open: 'badge--open', 'In Progress': 'badge--pending', Resolved: 'badge--closed' };

const MOCK_STATS = { total: 124, pending: 18, active: 41, resolved: 65 };
const MOCK_REFERRALS = [
  { id: 1, student_name: 'Juan dela Cruz',  referred_by: 'Ms. Reyes',  urgency: 'Urgent',   routed_to: 'Guidance',   status: 'Open',        date: '2026-05-10' },
  { id: 2, student_name: 'Maria Santos',    referred_by: 'Mr. Garcia', urgency: 'Moderate', routed_to: 'Dept. Head', status: 'In Progress', date: '2026-05-12' },
  { id: 3, student_name: 'Carlo Mendoza',   referred_by: 'Ms. Torres', urgency: 'Low',      routed_to: 'Chaplain',   status: 'Resolved',    date: '2026-05-14' },
  { id: 4, student_name: 'Ana Flores',      referred_by: 'Mr. Lim',    urgency: 'Urgent',   routed_to: 'OSAS',       status: 'Open',        date: '2026-05-15' },
  { id: 5, student_name: 'Paolo Reyes',     referred_by: 'Ms. Cruz',   urgency: 'Moderate', routed_to: 'Guidance',   status: 'In Progress', date: '2026-05-18' },
];

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon" style={{ backgroundColor: accent + '22', color: accent }}>
        {icon}
      </div>
      <div>
        <div className="stat-card__value">{value}</div>
        <div className="stat-card__label">{label}</div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [stats, setStats]         = useState(MOCK_STATS);
  const [referrals, setReferrals] = useState(MOCK_REFERRALS);
  const [loading, setLoading]     = useState(false);
  const [error]                   = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [sRes, rRes] = await Promise.all([
          getStats(),
          getReferrals({ limit: 5, sort: 'newest' }),
        ]);
        setStats(sRes.data.data);
        setReferrals(rRes.data.data ?? rRes.data);
      } catch {
        // Backend not ready yet — keep mock data, no crash
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">OSAS Dashboard</h1>
        <p className="page-subtitle">Overview of referrals and disciplinary cases</p>
      </div>

      {error && (
        <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>
      )}

      <div className="stats-grid">
        {STAT_CONFIG.map(({ key, label, icon, accent }) => (
          <StatCard key={key} icon={icon} label={label}
            value={loading ? '—' : (stats[key] ?? 0)} accent={accent} />
        ))}
      </div>

      <div className="card table-card">
        <h3 className="card__title">Recent Referrals</h3>
        {loading && <div className="loading">Loading…</div>}
        {!loading && (
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Referred by</th>
                <th>Urgency</th>
                <th>Routed to</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {referrals.length === 0 && (
                <tr><td colSpan={5}><div className="empty-state">No recent referrals.</div></td></tr>
              )}
              {referrals.map((r, i) => (
                <tr key={r.id ?? i}>
                  <td><span className="student-name">{r.student_name}</span></td>
                  <td className="text-muted">{r.referred_by || '—'}</td>
                  <td><span className={`badge ${URGENCY_BADGE[r.urgency] || ''}`}>{r.urgency}</span></td>
                  <td className="text-muted">{r.routed_to || '—'}</td>
                  <td><span className={`badge ${STATUS_BADGE[r.status] || ''}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
