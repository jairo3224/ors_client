import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, AlertCircle } from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser } from './hooks/api';

const ROLES = ['Teacher', 'Department Head', 'Principal', 'Guidance Office', 'Chaplain', 'OSAS'];
const DEPARTMENTS = ['College of Engineering', 'College of Arts', 'College of Science', 'College of Business', 'College of Education', 'Institution-wide'];

const ROLE_COLOR = {
  'OSAS':             { bg: '#ccc4f0', color: '#3c3489' },
  'Guidance Office':  { bg: '#a8d4f0', color: '#0c447c' },
  'Chaplain':         { bg: '#a8d4f0', color: '#0c447c' },
  'Department Head':  { bg: '#f0eea8', color: '#4a3c00' },
  'Principal':        { bg: '#f0eea8', color: '#4a3c00' },
  'Teacher':          { bg: '#eaf3de', color: '#27500a' },
};

const MOCK_USERS = [
  { id: 1, first_name: 'Marisol',   last_name: 'Reyes',    email: 'reyes@school.edu',    role_name: 'Teacher',          department_name: 'College of Science',   status: 'Active' },
  { id: 2, first_name: 'Eduardo',   last_name: 'Garcia',   email: 'garcia@school.edu',   role_name: 'Department Head',  department_name: 'College of Engineering', status: 'Active' },
  { id: 3, first_name: 'Luisa',     last_name: 'Torres',   email: 'torres@school.edu',   role_name: 'Teacher',          department_name: 'College of Arts',      status: 'Active' },
  { id: 4, first_name: 'Ramon',     last_name: 'Lim',      email: 'lim@school.edu',      role_name: 'Guidance Office',  department_name: 'Institution-wide',     status: 'Active' },
  { id: 5, first_name: 'Carmela',   last_name: 'Cruz',     email: 'cruz@school.edu',     role_name: 'Chaplain',         department_name: 'Institution-wide',     status: 'Active' },
  { id: 6, first_name: 'Admin',     last_name: 'OSAS',     email: 'osas@school.edu',     role_name: 'OSAS',             department_name: 'Institution-wide',     status: 'Active' },
];

const BLANK = { first_name: '', last_name: '', email: '', password: '', role_name: 'Teacher', department_name: 'Institution-wide', status: 'Active' };

// ── Modal ─────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-base">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function UserForm({ initial, onClose, onSaved }) {
  const [form, setForm]     = useState(initial ?? BLANK);
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');
  const isEdit = !!initial?.id;

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit() {
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
      setErr('First name, last name, and email are required.'); return;
    }
    if (!isEdit && !form.password.trim()) {
      setErr('Password is required for new users.'); return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateUser(initial.id, form);
        onSaved({ ...initial, ...form });
      } else {
        const res = await createUser(form);
        onSaved({ id: res.data.id ?? Date.now(), ...form });
      }
    } catch {
      onSaved({ id: initial?.id ?? Date.now(), ...form });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isEdit ? 'Edit User' : 'Add User'} onClose={onClose}>
      {err && <p className="text-red-600 text-xs mb-3 flex items-center gap-1"><AlertCircle size={13} />{err}</p>}
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-600 mb-1">First Name *</label>
            <input value={form.first_name} onChange={e => set('first_name', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Last Name *</label>
            <input value={form.last_name} onChange={e => set('last_name', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Email *</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        {!isEdit && (
          <div>
            <label className="block text-gray-600 mb-1">Password *</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-600 mb-1">Role</label>
            <select value={form.role_name} onChange={e => set('role_name', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200">
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Department</label>
          <select value={form.department_name} onChange={e => set('department_name', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200">
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
        <button onClick={handleSubmit} disabled={saving}
          style={{ background: '#4a7c8a' }}
          className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add User'}
        </button>
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers]     = useState(MOCK_USERS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState('');
  const [filterRole, setRole] = useState('');
  const [modal, setModal]     = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getUsers();
        setUsers(res.data.data ?? res.data);
      } catch { /* use mock */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole   = !filterRole || u.role_name === filterRole;
    return matchSearch && matchRole;
  });

  function handleSaved(saved) {
    setUsers(prev => {
      const idx = prev.findIndex(u => u.id === saved.id);
      return idx >= 0 ? prev.map(u => u.id === saved.id ? saved : u) : [saved, ...prev];
    });
    setModal(null);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this user?')) return;
    try { await deleteUser(id); } catch { /* mock */ }
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  return (
    <div className="space-y-4">

      {/* ── Toolbar ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <select value={filterRole} onChange={e => setRole(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">All roles</option>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
        <button onClick={() => setModal({ type: 'add' })}
          style={{ background: '#4a7c8a' }}
          className="ml-auto flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity">
          <Plus size={15} /> Add User
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading && <div className="text-center py-8 text-sm text-gray-400">Loading users…</div>}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-4 py-2 font-medium">Name</th>
                  <th className="text-left px-4 py-2 font-medium">Email</th>
                  <th className="text-left px-4 py-2 font-medium">Role</th>
                  <th className="text-left px-4 py-2 font-medium">Department</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">No users found.</td></tr>
                )}
                {filtered.map(u => {
                  const roleStyle = ROLE_COLOR[u.role_name] ?? { bg: '#f0f0f0', color: '#555' };
                  const initials = `${u.first_name[0] ?? ''}${u.last_name[0] ?? ''}`.toUpperCase();
                  return (
                    <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: roleStyle.bg, color: roleStyle.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {initials}
                          </div>
                          <span className="font-medium text-gray-800">{u.first_name} {u.last_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span style={{ ...roleStyle, padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{u.role_name}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{u.department_name}</td>
                      <td className="px-4 py-3">
                        <span style={{
                          padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                          background: u.status === 'Active' ? '#eaf3de' : '#f5f5f5',
                          color: u.status === 'Active' ? '#3b6d11' : '#888',
                        }}>{u.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setModal({ type: 'edit', data: u })} className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Edit"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {(modal?.type === 'add' || modal?.type === 'edit') && (
        <UserForm initial={modal.data} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
    </div>
  );
}
