const STAT_CONFIG = [
  { key: 'total',    label: 'Total Referrals', emoji: '📋', bg: '#b8e8a0', border: '#7cc06a', numColor: '#27500a', labelColor: '#3b6d11' },
  { key: 'pending',  label: 'Pending Review',  emoji: '⏱️',  bg: '#f0eea8', border: '#c8c060', numColor: '#4a3c00', labelColor: '#6b5800' },
  { key: 'active',   label: 'Active Cases',    emoji: '⚡', bg: '#a8d4f0', border: '#5898c8', numColor: '#0c447c', labelColor: '#185fa5' },
  { key: 'resolved', label: 'Resolved Cases',  emoji: '✅', bg: '#ccc4f0', border: '#7060c0', numColor: '#3c3489', labelColor: '#534ab7' },
];

const URGENCY_STYLE = {
  Urgent:   { bg: '#fcebeb', color: '#a32d2d' },
  Moderate: { bg: '#faeeda', color: '#854f0b' },
  Low:      { bg: '#eaf3de', color: '#3b6d11' },
};

const STATUS_COLOR = {
  Open:        '#e24b4a',
  'In Progress': '#ef9f27',
  Resolved:    '#639922',
};

// ── Fallback mock data (remove when backend is ready) ─────────────
const MOCK_STATS = { total: 124, pending: 18, active: 41, resolved: 65 };
const MOCK_REFERRALS = [
  { id: 1, student_name: 'Juan dela Cruz',  referred_by: 'Ms. Reyes',  urgency: 'Urgent',   routed_to: 'Guidance',   status: 'Open' },
  { id: 2, student_name: 'Maria Santos',    referred_by: 'Mr. Garcia', urgency: 'Moderate', routed_to: 'Dept. Head', status: 'In Progress' },
  { id: 3, student_name: 'Carlo Mendoza',   referred_by: 'Ms. Torres', urgency: 'Low',      routed_to: 'Chaplain',   status: 'Resolved' },
  { id: 4, student_name: 'Ana Flores',      referred_by: 'Mr. Lim',    urgency: 'Urgent',   routed_to: 'OSAS',       status: 'Open' },
  { id: 5, student_name: 'Paolo Reyes',     referred_by: 'Ms. Cruz',   urgency: 'Moderate', routed_to: 'Guidance',   status: 'In Progress' },
];

export default function Dashboard() {
  const stats = MOCK_STATS;
  const referrals = MOCK_REFERRALS;

  return (
    <div className="space-y-4">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CONFIG.map(({ key, label, emoji, bg, border, numColor, labelColor }) => (
          <div key={key} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 12 }} className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span style={{ color: numColor, fontSize: 26, fontWeight: 700 }}>
                {stats[key] ?? 0}
              </span>
              <span style={{ fontSize: 20 }}>{emoji}</span>
            </div>
            <span style={{ color: labelColor, fontSize: 12 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Recent Referrals Table ── */}
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
                <th className="text-left px-4 py-2 font-medium">Routed to</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r, i) => (
                <tr key={r.id ?? i} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{r.student_name}</td>
                  <td className="px-4 py-3 text-gray-500">{r.referred_by || '—'}</td>
                  <td className="px-4 py-3">
                    <span style={{ ...URGENCY_STYLE[r.urgency], padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
                      {r.urgency}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{r.routed_to || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 text-gray-700">
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[r.status] ?? '#888', display: 'inline-block', flexShrink: 0 }} />
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
