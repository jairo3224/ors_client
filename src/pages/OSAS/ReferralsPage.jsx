import { useEffect, useState } from 'react';
import { Plus, Search, Filter, X, Upload, Eye, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { getReferrals, createReferral, updateReferral, deleteReferral } from './api';

// ── Constants ─────────────────────────────────────────────────────
const URGENCY_OPTIONS  = ['Low', 'Moderate', 'Urgent'];
const ROUTE_OPTIONS    = ['Department Head', 'Guidance Office', 'Chaplain', 'OSAS'];
const STATUS_OPTIONS   = ['Open', 'In Progress', 'Resolved'];

const URGENCY_STYLE = {
  Urgent:   { bg: '#fcebeb', color: '#a32d2d' },
  Moderate: { bg: '#faeeda', color: '#854f0b' },
  Low:      { bg: '#eaf3de', color: '#3b6d11' },
};
const STATUS_COLOR = { Open: '#e24b4a', 'In Progress': '#ef9f27', Resolved: '#639922' };

// ── Mock fallback ─────────────────────────────────────────────────
const MOCK = [
  { id: 1, student_name: 'Juan dela Cruz',  referred_by: 'Ms. Reyes',  urgency: 'Urgent',   routed_to: 'Guidance Office',  status: 'Open',        date: '2026-05-10', description: 'Repeated disruptive behavior in class.' },
  { id: 2, student_name: 'Maria Santos',    referred_by: 'Mr. Garcia', urgency: 'Moderate', routed_to: 'Department Head',  status: 'In Progress', date: '2026-05-12', description: 'Excessive absences this semester.' },
  { id: 3, student_name: 'Carlo Mendoza',   referred_by: 'Ms. Torres', urgency: 'Low',      routed_to: 'Chaplain',         status: 'Resolved',    date: '2026-05-14', description: 'Needs spiritual guidance and counseling.' },
  { id: 4, student_name: 'Ana Flores',      referred_by: 'Mr. Lim',    urgency: 'Urgent',   routed_to: 'OSAS',             status: 'Open',        date: '2026-05-15', description: 'Serious incident involving property damage.' },
  { id: 5, student_name: 'Paolo Reyes',     referred_by: 'Ms. Cruz',   urgency: 'Moderate', routed_to: 'Guidance Office',  status: 'In Progress', date: '2026-05-18', description: 'Bullying complaint from a classmate.' },
];

const BLANK_FORM = { student_name: '', description: '', urgency: 'Low', routed_to: 'Guidance Office', status: 'Open', evidence_file: null };

// ── Modal ─────────────────────────────────────────────────────────
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

// ── View Modal ────────────────────────────────────────────────────
function ViewModal({ referral, onClose, onStatusChange }) {
  const [status, setStatus] = useState(referral.status);
  const [saving, setSaving] = useState(false);

  async function handleStatusSave() {
    setSaving(true);
    try {
      await updateReferral(referral.id, { status });
      onStatusChange(referral.id, status);
      onClose();
    } catch {
      // keep mock behavior
      onStatusChange(referral.id, status);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Referral Details" onClose={onClose}>
      <dl className="space-y-3 text-sm">
        {[
          ['Student',     referral.student_name],
          ['Referred by', referral.referred_by],
          ['Date',        referral.date],
          ['Routed to',   referral.routed_to],
        ].map(([label, val]) => (
          <div key={label} className="flex gap-2">
            <dt className="text-gray-500 w-28 shrink-0">{label}</dt>
            <dd className="text-gray-800 font-medium">{val}</dd>
          </div>
        ))}
        <div className="flex gap-2 items-center">
          <dt className="text-gray-500 w-28 shrink-0">Urgency</dt>
          <dd><span style={{ ...URGENCY_STYLE[referral.urgency], padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{referral.urgency}</span></dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-gray-500 w-28 shrink-0">Description</dt>
          <dd className="text-gray-800">{referral.description}</dd>
        </div>
        <div className="flex gap-2 items-center">
          <dt className="text-gray-500 w-28 shrink-0">Status</dt>
          <dd>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </dd>
        </div>
      </dl>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
        <button onClick={handleStatusSave} disabled={saving}
          style={{ background: '#4a7c8a' }}
          className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
          {saving ? 'Saving…' : 'Update Status'}
        </button>
      </div>
    </Modal>
  );
}

// ── Create/Edit Form Modal ────────────────────────────────────────
function FormModal({ initial, onClose, onSaved }) {
  const [form, setForm]     = useState(initial ?? BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');
  const isEdit = !!initial?.id;

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSubmit() {
    if (!form.student_name.trim() || !form.description.trim()) {
      setErr('Student name and description are required.'); return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.evidence_file; // handle file separately if needed
      if (isEdit) {
        await updateReferral(initial.id, payload);
        onSaved({ ...initial, ...payload });
      } else {
        const res = await createReferral(payload);
        onSaved({ id: res.data.id ?? Date.now(), ...payload, referred_by: 'You', date: new Date().toISOString().slice(0,10) });
      }
    } catch {
      // mock success
      onSaved({ id: initial?.id ?? Date.now(), ...form, referred_by: initial?.referred_by ?? 'You', date: initial?.date ?? new Date().toISOString().slice(0,10) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isEdit ? 'Edit Referral' : 'New Referral'} onClose={onClose}>
      {err && <p className="text-red-600 text-xs mb-3 flex items-center gap-1"><AlertCircle size={13}/>{err}</p>}
      <div className="space-y-3 text-sm">
        <div>
          <label className="block text-gray-600 mb-1">Student Name *</label>
          <input value={form.student_name} onChange={e => set('student_name', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Full name" />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Description *</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" placeholder="Describe the incident..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-600 mb-1">Urgency</label>
            <select value={form.urgency} onChange={e => set('urgency', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200">
              {URGENCY_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Route to</label>
            <select value={form.routed_to} onChange={e => set('routed_to', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200">
              {ROUTE_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        {isEdit && (
          <div>
            <label className="block text-gray-600 mb-1">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200">
              {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="block text-gray-600 mb-1">Attach Evidence (optional)</label>
          <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload size={14} className="text-gray-400" />
            <span className="text-gray-400 text-xs">{form.evidence_file?.name ?? 'Click to upload image or file'}</span>
            <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => set('evidence_file', e.target.files[0])} />
          </label>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
        <button onClick={handleSubmit} disabled={saving}
          style={{ background: '#4a7c8a' }}
          className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Submit Referral'}
        </button>
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function ReferralsPage() {
  const [referrals, setReferrals] = useState(MOCK);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [modal, setModal] = useState(null); // null | {type:'view'|'form'|'edit', data?}

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getReferrals();
        setReferrals(res.data.data ?? res.data);
      } catch { /* use mock */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  // ── Derived filtered list ─────────────────────────────────────
  const filtered = referrals.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.student_name.toLowerCase().includes(q) || r.referred_by?.toLowerCase().includes(q);
    const matchUrgency = !filterUrgency || r.urgency === filterUrgency;
    const matchStatus  = !filterStatus  || r.status  === filterStatus;
    return matchSearch && matchUrgency && matchStatus;
  });

  // ── CRUD handlers ─────────────────────────────────────────────
  function handleSaved(saved) {
    setReferrals(prev => {
      const idx = prev.findIndex(r => r.id === saved.id);
      return idx >= 0 ? prev.map(r => r.id === saved.id ? saved : r) : [saved, ...prev];
    });
    setModal(null);
  }

  function handleStatusChange(id, status) {
    setReferrals(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this referral?')) return;
    try { await deleteReferral(id); } catch { /* mock */ }
    setReferrals(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div className="space-y-4">

      {/* ── Toolbar ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search student or teacher…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <select value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">All urgencies</option>
          {URGENCY_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
        <button onClick={() => setModal({ type: 'form' })}
          style={{ background: '#4a7c8a' }}
          className="ml-auto flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity">
          <Plus size={15} /> New Referral
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading && <div className="text-center py-8 text-sm text-gray-400">Loading referrals…</div>}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-4 py-2 font-medium">Student</th>
                  <th className="text-left px-4 py-2 font-medium">Referred by</th>
                  <th className="text-left px-4 py-2 font-medium">Urgency</th>
                  <th className="text-left px-4 py-2 font-medium">Routed to</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">No referrals found.</td></tr>
                )}
                {filtered.map(r => (
                  <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{r.student_name}</td>
                    <td className="px-4 py-3 text-gray-500">{r.referred_by}</td>
                    <td className="px-4 py-3">
                      <span style={{ ...URGENCY_STYLE[r.urgency], padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{r.urgency}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{r.routed_to}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 text-gray-700">
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[r.status] ?? '#888', display: 'inline-block' }} />
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{r.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal({ type: 'view', data: r })} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="View"><Eye size={14} /></button>
                        <button onClick={() => setModal({ type: 'edit', data: r })} className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Edit"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal?.type === 'view' && (
        <ViewModal referral={modal.data} onClose={() => setModal(null)} onStatusChange={handleStatusChange} />
      )}
      {(modal?.type === 'form' || modal?.type === 'edit') && (
        <FormModal initial={modal.data} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
    </div>
  );
}
