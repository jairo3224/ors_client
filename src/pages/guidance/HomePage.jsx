import { useState } from 'react';

const MOCK_STATS = { total: 87, pending: 12, active: 33, resolved: 42 };
const MOCK_REFERRALS = [
  { id: 1, student_name: 'Juan dela Cruz',  referred_by: 'Ms. Reyes',  urgency: 'Urgent',   routed_to: 'Guidance Office', status: 'Open',        date: '2026-05-28', description: 'Behavioral concerns in class.' },
  { id: 2, student_name: 'Maria Santos',    referred_by: 'Mr. Garcia', urgency: 'Moderate', routed_to: 'Guidance Office', status: 'In Progress', date: '2026-05-25', description: 'Academic stress and anxiety.' },
  { id: 3, student_name: 'Carlo Mendoza',   referred_by: 'Ms. Torres', urgency: 'Low',      routed_to: 'Guidance Office', status: 'Resolved',    date: '2026-05-20', description: 'Peer relationship issues.' },
  { id: 4, student_name: 'Ana Flores',      referred_by: 'Mr. Lim',    urgency: 'Urgent',   routed_to: 'Guidance Office', status: 'Open',        date: '2026-05-30', description: 'Family concerns affecting studies.' },
  { id: 5, student_name: 'Paolo Reyes',     referred_by: 'Ms. Cruz',   urgency: 'Moderate', routed_to: 'Guidance Office', status: 'In Progress', date: '2026-05-27', description: 'Career guidance consultation.' },
];

const URGENCY_BADGE = { Urgent: 'badge--high', Moderate: 'badge--moderate', Low: 'badge--low' };
const STATUS_BADGE = { Open: 'badge--open', 'In Progress': 'badge--pending', Resolved: 'badge--closed' };

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

export default function GuidanceHomePage() {
  const [stats] = useState(MOCK_STATS);
  const [referrals] = useState(MOCK_REFERRALS);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Guidance Office Dashboard</h1>
        <p className="page-subtitle">Overview of referrals and counseling cases</p>
      </div>

      <div className="stats-grid">
        <StatCard icon="📋" label="Total Referrals" value={stats.total} accent="#2e7d32" />
        <StatCard icon="⏳" label="Pending Review" value={stats.pending} accent="#f57f17" />
        <StatCard icon="🧠" label="Active Counsel" value={stats.active} accent="#1565c0" />
        <StatCard icon="✅" label="Resolved Cases" value={stats.resolved} accent="#4527a0" />
      </div>

      <div className="card table-card">
        <h3 className="card__title">Recent Referrals</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Referred by</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {referrals.length === 0 && (
              <tr><td colSpan={5}><div className="empty-state">No referrals assigned.</div></td></tr>
            )}
            {referrals.map(r => (
              <tr key={r.id}>
                <td><span className="student-name">{r.student_name}</span></td>
                <td className="text-muted">{r.referred_by || '—'}</td>
                <td><span className={`badge ${URGENCY_BADGE[r.urgency] || ''}`}>{r.urgency}</span></td>
                <td><span className={`badge ${STATUS_BADGE[r.status] || ''}`}>{r.status}</span></td>
                <td className="text-muted">{r.date || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
