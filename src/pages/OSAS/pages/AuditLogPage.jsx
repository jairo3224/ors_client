import { useState, useEffect, useSyncExternalStore } from 'react';
import { ClipboardList, Search } from 'lucide-react';
import { mockStore, filterBySchoolYear } from '../../../shared/mockStore';

const ACTION_COLORS = {
  INCIDENT_CREATED: '#1565c0',
  INCIDENT_REVIEWED: '#f57f17',
  INCIDENT_ASSIGNED: '#4527a0',
  INCIDENT_RESOLVED: '#2e7d32',
  INCIDENT_DISMISSED: '#757575',
  SANCTION_ISSUED: '#c62828',
  SANCTION_COMPLETED: '#2e7d32',
  REFERRAL_SENT: '#1565c0',
  USER_CREATED: '#1565c0',
  LOGIN: '#64748b',
  RESPONSE_COMPLETED: '#2e7d32',
  SETTINGS_UPDATED: '#64748b',
};

export default function AuditLogPage() {
  const store = useSyncExternalStore(mockStore.subscribe, () => mockStore.getState());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const logs = filterBySchoolYear(store.auditLogs, store.settings.schoolYear, 'timestamp');

  const filtered = logs.filter(l => {
    const matchSearch = `${l.action} ${l.user} ${l.target} ${l.details}`.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === 'all' || l.action === filterAction;
    return matchSearch && matchAction;
  });

  const uniqueActions = [...new Set(logs.map(l => l.action))];

  if (loading) return <div className="loading">Loading audit logs...</div>;

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Audit Log Viewer</h1><p className="page-subtitle">Complete trail of all system actions across modules.</p></div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}><ClipboardList size={20} /></div><div><div className="stat-card__value">{logs.length}</div><div className="stat-card__label">Total Entries</div></div></div>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}><ClipboardList size={20} /></div><div><div className="stat-card__value">{uniqueActions.length}</div><div className="stat-card__label">Action Types</div></div></div>
      </div>

      <div className="filters">
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="input" style={{ paddingLeft: 36, width: '100%', maxWidth: '100%' }} placeholder="Search action, user, target..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" value={filterAction} onChange={e => setFilterAction(e.target.value)}>
          <option value="all">All Actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div className="card table-card">
        <table className="table">
          <thead><tr><th>Timestamp</th><th>Action</th><th>User</th><th>Role</th><th>Target</th><th>Details</th><th>IP</th></tr></thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id}>
                <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }}>{log.timestamp}</td>
                <td><span className="badge" style={{ background: `${ACTION_COLORS[log.action] || '#64748b'}18`, color: ACTION_COLORS[log.action] || '#64748b' }}>{log.action.replace(/_/g, ' ')}</span></td>
                <td><strong style={{ color: '#1a3a5c', fontSize: '0.85rem' }}>{log.user}</strong></td>
                <td><span style={{ color: '#64748b', fontSize: '0.78rem' }}>{log.role}</span></td>
                <td style={{ fontSize: '0.83rem' }}>{log.target}</td>
                <td style={{ fontSize: '0.78rem', color: '#64748b', maxWidth: 240 }}>{log.details}</td>
                <td style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">No log entries found.</div>}
      </div>
    </div>
  );
}
