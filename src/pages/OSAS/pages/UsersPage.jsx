import { useState, useEffect, useSyncExternalStore } from 'react';
import { Users, UserPlus, Shield, Search } from 'lucide-react';
import { mockStore } from '../../../shared/mockStore';

const ROLES = ['OSAS', 'Guidance Office', 'Chaplain', 'Department Head', 'Teacher'];

function UserModal({ user, onClose, onSave, mode }) {
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', email: user?.email || '', role_name: user?.role_name || 'Teacher', department_name: user?.department_name || '', password: '', status: user?.status || 'active' });
  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal__box" style={{ maxWidth: 520 }}>
        <div className="modal__header">
          <h3 style={{ margin: 0, color: '#1a3a5c', fontSize: '1.1rem' }}>{mode === 'create' ? 'Create User' : 'Edit User'}</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group"><label className="form-label">First Name</label><input className="input" style={{ width: '100%', maxWidth: '100%' }} value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Last Name</label><input className="input" style={{ width: '100%', maxWidth: '100%' }} value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} /></div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Email</label><input className="input" style={{ width: '100%', maxWidth: '100%' }} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Role</label><select className="select" style={{ width: '100%' }} value={form.role_name} onChange={e => setForm({ ...form, role_name: e.target.value })}>{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Department</label><input className="input" style={{ width: '100%', maxWidth: '100%' }} value={form.department_name} onChange={e => setForm({ ...form, department_name: e.target.value })} /></div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">{mode === 'create' ? 'Password' : 'New Password (leave blank to keep)'}</label><input className="input" type="password" style={{ width: '100%', maxWidth: '100%' }} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
        </div>
        <div className="modal__actions">
          <button className="btn btn--outline" onClick={onClose}>Cancel</button>
          <button className="btn" disabled={!form.first_name || !form.last_name || !form.email} onClick={() => { onSave({ ...form, id: user?.id || Date.now() }); onClose(); }}>{mode === 'create' ? 'Create User' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const store = useSyncExternalStore(mockStore.subscribe, () => mockStore.getState());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [editTarget, setEditTarget] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const users = store.users;

  const handleSave = (data) => {
    if (data.id && users.find(u => u.id === data.id)) {
      mockStore.updateUser(data.id, data);
    } else {
      mockStore.addUser(data);
    }
  };
  const handleToggleStatus = (id) => mockStore.toggleUserStatus(id);

  const filtered = users.filter(u => {
    const matchSearch = `${u.first_name} ${u.last_name} ${u.email} ${u.role_name}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role_name === filterRole;
    return matchSearch && matchRole;
  });
  const stats = { total: users.length, active: users.filter(u => u.status === 'active').length, roles: new Set(users.map(u => u.role_name)).size };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1 className="page-title">User Management</h1><p className="page-subtitle">Manage all staff accounts across offices.</p></div>
        <button className="btn" onClick={() => setShowCreate(true)}><UserPlus size={14} style={{ marginRight: 6 }} />Create User</button>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}><Users size={20} /></div><div><div className="stat-card__value">{stats.total}</div><div className="stat-card__label">Total Users</div></div></div>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}><Shield size={20} /></div><div><div className="stat-card__value">{stats.active}</div><div className="stat-card__label">Active</div></div></div>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#ede7f6', color: '#4527a0' }}><Users size={20} /></div><div><div className="stat-card__value">{stats.roles}</div><div className="stat-card__label">Roles</div></div></div>
      </div>
      <div className="filters">
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="input" style={{ paddingLeft: 36, width: '100%' }} placeholder="Search name, email, role..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>{ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div className="card table-card">
        <table className="table">
          <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td><div className="student-cell"><div className="avatar">{u.first_name[0]}{u.last_name[0]}</div><div><div className="student-name">{u.first_name} {u.last_name}</div></div></div></td>
                <td><span className="mono">{u.email}</span></td>
                <td><span className="badge" style={{ background: '#ede7f6', color: '#4527a0' }}>{u.role_name}</span></td>
                <td className="text-muted">{u.department_name}</td>
                <td><span className={`badge ${u.status === 'active' ? 'badge--active' : ''}`} style={u.status !== 'active' ? { background: '#f5f5f5', color: '#757575' } : {}}>{u.status}</span></td>
                <td className="text-muted">{u.last_login}</td>
                <td><div style={{ display: 'flex', gap: 6 }}><button className="btn btn--sm" onClick={() => setEditTarget(u)}>Edit</button><button className={`btn btn--sm ${u.status === 'active' ? 'btn--danger' : 'btn--success'}`} onClick={() => handleToggleStatus(u.id)}>{u.status === 'active' ? 'Deactivate' : 'Activate'}</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">No users found.</div>}
      </div>
      {editTarget && <UserModal user={editTarget} mode="edit" onClose={() => setEditTarget(null)} onSave={handleSave} />}
      {showCreate && <UserModal user={null} mode="create" onClose={() => setShowCreate(false)} onSave={handleSave} />}
    </div>
  );
}
