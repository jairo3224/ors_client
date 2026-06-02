import { useState } from 'react';
import { Search, User, FileText, Shield, Settings, Activity } from 'lucide-react';

const MOCK_LOGS = [
  { id: 1, user: 'OSAS Admin', role: 'OSAS', action: 'Created referral', target: 'Juan dela Cruz', details: 'Referred to Guidance Office (Urgent)', timestamp: '2026-06-01 09:15:23', ip: '192.168.1.100' },
  { id: 2, user: 'Ms. Reyes', role: 'Teacher', action: 'Reported incident', target: 'Maria Santos', details: 'Incident type: Disrespectful Behavior', timestamp: '2026-06-01 08:45:10', ip: '192.168.1.105' },
  { id: 3, user: 'OSAS Admin', role: 'OSAS', action: 'Updated user', target: 'Mr. Garcia', details: 'Changed role from Teacher to Department Head', timestamp: '2026-05-31 16:20:00', ip: '192.168.1.100' },
  { id: 4, user: 'Guidance Counselor', role: 'Guidance Office', action: 'Updated referral status', target: 'Carlo Mendoza', details: 'Status changed from Open to In Progress', timestamp: '2026-05-31 14:30:45', ip: '192.168.1.110' },
  { id: 5, user: 'OSAS Admin', role: 'OSAS', action: 'Created user', target: 'New Teacher', details: 'Created account with role: Teacher', timestamp: '2026-05-31 11:00:12', ip: '192.168.1.100' },
  { id: 6, user: 'Chairperson', role: 'Department Head', action: 'Added remark', target: 'Ana Flores', details: 'Added remark to report: "Schedule parent meeting"', timestamp: '2026-05-30 10:15:33', ip: '192.168.1.115' },
  { id: 7, user: 'Chaplain', role: 'Chaplain', action: 'Updated referral status', target: 'Carlo Mendoza', details: 'Status changed from In Progress to Resolved', timestamp: '2026-05-29 15:45:00', ip: '192.168.1.120' },
  { id: 8, user: 'OSAS Admin', role: 'OSAS', action: 'Issued sanction', target: 'Juan dela Cruz', details: 'Sanction type: Warning. Duration: N/A', timestamp: '2026-05-29 09:30:00', ip: '192.168.1.100' },
  { id: 9, user: 'OSAS Admin', role: 'OSAS', action: 'Logged in', target: 'System', details: 'Successful login from IP 192.168.1.100', timestamp: '2026-05-29 08:00:00', ip: '192.168.1.100' },
  { id: 10, user: 'Ms. Torres', role: 'Teacher', action: 'Reported incident', target: 'Carlo Mendoza', details: 'Incident type: Bullying', timestamp: '2026-05-28 13:20:00', ip: '192.168.1.105' },
  { id: 11, user: 'OSAS Admin', role: 'OSAS', action: 'Deleted referral', target: 'Referral #12', details: 'Referral removed by admin request', timestamp: '2026-05-28 11:10:00', ip: '192.168.1.100' },
  { id: 12, user: 'Guidance Counselor', role: 'Guidance Office', action: 'Added counseling note', target: 'Bianca Reyes', details: 'Added pastoral care note to referral', timestamp: '2026-05-27 16:00:00', ip: '192.168.1.110' },
];

const ACTION_ICONS = {
  'Created referral': FileText,
  'Reported incident': Activity,
  'Updated user': Settings,
  'Updated referral status': Activity,
  'Created user': User,
  'Added remark': FileText,
  'Issued sanction': Shield,
  'Logged in': Shield,
  'Deleted referral': FileText,
  'Added counseling note': FileText,
};

const ROLE_COLORS = {
  'OSAS': 'bg-purple-100 text-purple-700',
  'Teacher': 'bg-blue-100 text-blue-700',
  'Guidance Office': 'bg-green-100 text-green-700',
  'Department Head': 'bg-amber-100 text-amber-700',
  'Chaplain': 'bg-rose-100 text-rose-700',
};

export default function AuditLogPage() {
  const [logs] = useState(MOCK_LOGS);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const uniqueActions = [...new Set(logs.map(l => l.action))];
  const uniqueRoles = [...new Set(logs.map(l => l.role))];

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    return (!q || l.user.toLowerCase().includes(q) || l.target.toLowerCase().includes(q) || l.details.toLowerCase().includes(q)) &&
           (!filterAction || l.action === filterAction) &&
           (!filterRole || l.role === filterRole);
  });

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">Audit Log</h1>
        <p className="page-subtitle">Complete trail of all system actions and user activity</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by user, target, or details…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">All actions</option>
          {uniqueActions.map(a => <option key={a}>{a}</option>)}
        </select>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">All roles</option>
          {uniqueRoles.map(r => <option key={r}>{r}</option>)}
        </select>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} entries</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                <th className="text-left px-4 py-2 font-medium">Timestamp</th>
                <th className="text-left px-4 py-2 font-medium">User</th>
                <th className="text-left px-4 py-2 font-medium">Role</th>
                <th className="text-left px-4 py-2 font-medium">Action</th>
                <th className="text-left px-4 py-2 font-medium">Target</th>
                <th className="text-left px-4 py-2 font-medium">Details</th>
                <th className="text-left px-4 py-2 font-medium">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                  <Search size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No log entries match your filters.</p>
                </td></tr>
              )}
              {filtered.map(log => {
                const Icon = ACTION_ICONS[log.action] || Activity;
                return (
                  <tr key={log.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap font-mono">{log.timestamp}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{log.user}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[log.role] || 'bg-gray-100 text-gray-600'}`}>
                        {log.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 text-gray-700">
                        <Icon size={13} className="text-gray-400" />
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{log.target}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{log.details}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{log.ip}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
