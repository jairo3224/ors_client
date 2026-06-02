import { useState } from 'react';
import { FileText, Clock, Activity, CheckCircle } from 'lucide-react';

const STAT_CONFIG = [
  { key: 'total',      label: 'Total Referrals',   icon: FileText,    bg: '#b8e8a0', border: '#7cc06a', numColor: '#27500a', labelColor: '#3b6d11' },
  { key: 'pending',    label: 'Pending Review',    icon: Clock,       bg: '#f0eea8', border: '#c8c060', numColor: '#4a3c00', labelColor: '#6b5800' },
  { key: 'active',     label: 'Active Pastoral',   icon: Activity,    bg: '#a8d4f0', border: '#5898c8', numColor: '#0c447c', labelColor: '#185fa5' },
  { key: 'resolved',   label: 'Resolved Cases',    icon: CheckCircle, bg: '#ccc4f0', border: '#7060c0', numColor: '#3c3489', labelColor: '#534ab7' },
];

const URGENCY_STYLE = {
  Urgent:   { bg: '#fcebeb', color: '#a32d2d' },
  Moderate: { bg: '#faeeda', color: '#854f0b' },
  Low:      { bg: '#eaf3de', color: '#3b6d11' },
};

const STATUS_COLOR = {
  Open: '#e24b4a', 'In Progress': '#ef9f27', Resolved: '#639922',
};

const MOCK_STATS = { total: 42, pending: 8, active: 19, resolved: 15 };
const MOCK_REFERRALS = [
  { id: 1, student_name: 'Carlo Mendoza',   referred_by: 'Ms. Torres', urgency: 'Low',      status: 'Open',        date: '2026-05-14', description: 'Needs spiritual guidance and counseling.' },
  { id: 2, student_name: 'Bianca Reyes',    referred_by: 'Mr. Lim',    urgency: 'Moderate', status: 'In Progress', date: '2026-05-20', description: 'Grief and loss support needed.' },
  { id: 3, student_name: 'Dante Villanueva', referred_by: 'Ms. Cruz',  urgency: 'Urgent',   status: 'Open',        date: '2026-05-28', description: 'Personal crisis requiring immediate pastoral care.' },
];

export default function ChaplainHomePage() {
  const [stats] = useState(MOCK_STATS);
  const [referrals] = useState(MOCK_REFERRALS);

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">Chaplain Dashboard</h1>
        <p className="page-subtitle">Overview of spiritual care referrals and pastoral cases</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CONFIG.map(({ key, label, icon: Icon, bg, border, numColor, labelColor }) => (
          <div key={key} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 12 }} className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span style={{ color: numColor, fontSize: 26, fontWeight: 700 }}>
                {stats[key] ?? 0}
              </span>
              <Icon size={20} style={{ color: labelColor, opacity: 0.7 }} />
            </div>
            <span style={{ color: labelColor, fontSize: 12 }}>{label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Recent Referrals</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-2 font-medium">Student</th>
                <th className="text-left px-4 py-2 font-medium">Referred by</th>
                <th className="text-left px-4 py-2 font-medium">Urgency</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {referrals.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">No referrals assigned.</td></tr>
              )}
              {referrals.map((r, i) => (
                <tr key={r.id ?? i} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{r.student_name}</td>
                  <td className="px-4 py-3 text-gray-500">{r.referred_by || '—'}</td>
                  <td className="px-4 py-3">
                    <span style={{ ...URGENCY_STYLE[r.urgency], padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
                      {r.urgency}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 text-gray-700">
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[r.status] ?? '#888', display: 'inline-block', flexShrink: 0 }} />
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{r.date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
