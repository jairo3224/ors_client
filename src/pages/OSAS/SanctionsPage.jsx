import { useState } from 'react';
import { Plus, Search, X, Eye, AlertCircle, Gavel, ShieldAlert, Clock, Ban, UserCheck } from 'lucide-react';

const SANCTION_TYPES = ['Warning', 'Suspension', 'Probation', 'Community Service', 'Expulsion'];
const STATUS_OPTIONS = ['Issued', 'Served', 'Completed', 'Appealed', 'Revoked'];

const TYPE_STYLE = {
  Warning:          { bg: '#fef9c3', color: '#854d0e', icon: AlertCircle },
  Suspension:       { bg: '#fce4ec', color: '#a32d2d', icon: Ban },
  Probation:        { bg: '#fff3e0', color: '#e65100', icon: Clock },
  'Community Service': { bg: '#e8f5e9', color: '#2e7d32', icon: UserCheck },
  Expulsion:        { bg: '#f3e5f5', color: '#7b1fa2', icon: ShieldAlert },
};

const STATUS_COLOR = {
  Issued: 'bg-purple-100 text-purple-700',
  Served: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Appealed: 'bg-amber-100 text-amber-700',
  Revoked: 'bg-gray-100 text-gray-600',
};

const MOCK = [
  { id: 1, student_name: 'Juan dela Cruz',    type: 'Warning',          status: 'Issued',    date_issued: '2026-05-15', issued_by: 'OSAS', description: 'First formal warning for disruptive classroom behavior.', duration: '', notes: '' },
  { id: 2, student_name: 'Maria Santos',       type: 'Probation',       status: 'Served',    date_issued: '2026-05-01', issued_by: 'OSAS', description: 'Academic probation for failing grades in two subjects.', duration: '1 semester', notes: 'Monthly progress reports required.' },
  { id: 3, student_name: 'Carlo Mendoza',      type: 'Community Service', status: 'Completed', date_issued: '2026-04-10', issued_by: 'OSAS', description: 'Required 40 hours community service for vandalism.', duration: '40 hours', notes: 'Completed at university library. Positive feedback from supervisor.' },
  { id: 4, student_name: 'Ana Flores',         type: 'Suspension',       status: 'Issued',    date_issued: '2026-05-20', issued_by: 'OSAS', description: '3-day suspension for physical altercation with classmate.', duration: '3 days', notes: '' },
  { id: 5, student_name: 'Dante Villanueva',   type: 'Expulsion',       status: 'Appealed',  date_issued: '2026-05-25', issued_by: 'OSAS', description: 'Expulsion recommended for repeated serious offenses.', duration: 'Permanent', notes: 'Appeal pending review by disciplinary committee.' },
];

const BLANK_FORM = { student_name: '', type: 'Warning', status: 'Issued', description: '', duration: '', notes: '' };

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-base">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function SanctionsPage() {
  const [sanctions, setSanctions] = useState(MOCK);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null);

  const filtered = sanctions.filter(s => {
    const q = search.toLowerCase();
    return (!q || s.student_name.toLowerCase().includes(q)) &&
           (!filterType || s.type === filterType) &&
           (!filterStatus || s.status === filterStatus);
  });

  function handleSave(form) {
    if (modal?.data) {
      setSanctions(prev => prev.map(s => s.id === form.id ? form : s));
    } else {
      setSanctions(prev => [{ ...form, id: Date.now(), date_issued: new Date().toISOString().slice(0,10), issued_by: 'OSAS' }, ...prev]);
    }
    setModal(null);
  }

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">Sanctions</h1>
        <p className="page-subtitle">Issue and manage disciplinary actions — warnings, suspensions, probation, community service, expulsion</p>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-2">
        {SANCTION_TYPES.map(type => {
          const count = sanctions.filter(s => s.type === type).length;
          const Icon = TYPE_STYLE[type].icon;
          return (
            <div key={type} className="bg-white rounded-lg border border-gray-200 p-3 text-center">
              <Icon size={18} className="mx-auto mb-1" style={{ color: TYPE_STYLE[type].color }} />
              <div className="text-lg font-bold text-gray-800">{count}</div>
              <div className="text-xs text-gray-500">{type}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by student name…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">All types</option>
          {SANCTION_TYPES.map(o => <option key={o}>{o}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
        <button onClick={() => setModal({ type: 'form', data: null })}
          style={{ background: '#4a7c8a' }}
          className="ml-auto flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity">
          <Plus size={15} /> Issue Sanction
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                <th className="text-left px-4 py-2 font-medium">Student</th>
                <th className="text-left px-4 py-2 font-medium">Type</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Date Issued</th>
                <th className="text-left px-4 py-2 font-medium">Duration</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                  <Gavel size={40} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No sanctions recorded.</p>
                </td></tr>
              )}
              {filtered.map(s => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{s.student_name}</td>
                  <td className="px-4 py-3">
                    <span style={{ background: TYPE_STYLE[s.type].bg, color: TYPE_STYLE[s.type].color, padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
                      {s.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLOR[s.status]}`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{s.date_issued || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{s.duration || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setModal({ type: 'view', data: s })}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="View/Edit">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal?.type === 'view' && (
        <SanctionViewModal sanction={modal.data} onClose={() => setModal(null)} onEdit={() => { const d = modal.data; setModal({ type: 'form', data: d }); }} />
      )}
      {modal?.type === 'form' && (
        <SanctionFormModal initial={modal.data} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </div>
  );
}

function SanctionViewModal({ sanction, onClose, onEdit }) {
  return (
    <Modal title="Sanction Details" onClose={onClose}>
      <dl className="space-y-3 text-sm">
        {[
          ['Student', sanction.student_name],
          ['Type', sanction.type],
          ['Status', sanction.status],
          ['Date Issued', sanction.date_issued],
          ['Issued By', sanction.issued_by],
          ['Duration', sanction.duration || '—'],
        ].map(([label, val]) => (
          <div key={label} className="flex gap-2">
            <dt className="text-gray-500 w-28 shrink-0">{label}</dt>
            <dd className="font-medium text-gray-800">{val}</dd>
          </div>
        ))}
        <div className="flex gap-2">
          <dt className="text-gray-500 w-28 shrink-0">Description</dt>
          <dd className="font-medium text-gray-800">{sanction.description}</dd>
        </div>
        {sanction.notes && (
          <div className="flex gap-2">
            <dt className="text-gray-500 w-28 shrink-0">Notes</dt>
            <dd className="font-medium text-gray-800">{sanction.notes}</dd>
          </div>
        )}
      </dl>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Close</button>
        <button onClick={onEdit}
          style={{ background: '#4a7c8a' }}
          className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity">
          Edit Sanction
        </button>
      </div>
    </Modal>
  );
}

function SanctionFormModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial ?? BLANK_FORM);
  const [err, setErr] = useState('');

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function handleSubmit() {
    if (!form.student_name.trim() || !form.description.trim()) {
      setErr('Student name and description are required.'); return;
    }
    onSave(form);
  }

  return (
    <Modal title={initial ? 'Edit Sanction' : 'Issue Sanction'} onClose={onClose}>
      {err && <p className="text-red-600 text-xs mb-3 flex items-center gap-1"><AlertCircle size={13}/>{err}</p>}
      <div className="space-y-3 text-sm">
        <div>
          <label className="block text-gray-600 mb-1">Student Name *</label>
          <input value={form.student_name} onChange={e => set('student_name', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Full name" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-600 mb-1">Sanction Type *</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200">
              {SANCTION_TYPES.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200">
              {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Description *</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
            placeholder="Describe the offense and sanction details…" />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Duration / Terms</label>
          <input value={form.duration} onChange={e => set('duration', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="e.g., 1 semester, 40 hours, Permanent, etc." />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Additional Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
            placeholder="Any additional notes or conditions…" />
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
        <button onClick={handleSubmit}
          style={{ background: '#4a7c8a' }}
          className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity">
          {initial ? 'Save Changes' : 'Issue Sanction'}
        </button>
      </div>
    </Modal>
  );
}
