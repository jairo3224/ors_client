import { useEffect, useState } from 'react';
import { Plus, Search, X, Upload, Eye, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { getReferrals, createReferral, updateReferral, deleteReferral } from './hooks/api';

const URGENCY_OPTIONS  = ['Low', 'Moderate', 'Urgent'];
const ROUTE_OPTIONS    = ['Department Head', 'Guidance Office', 'Chaplain', 'OSAS'];
const STATUS_OPTIONS   = ['Open', 'In Progress', 'Resolved'];

const URGENCY_BADGE = { Urgent: 'badge--high', Moderate: 'badge--moderate', Low: 'badge--low' };
const STATUS_BADGE = { Open: 'badge--open', 'In Progress': 'badge--pending', Resolved: 'badge--closed' };

const MOCK = [
  { id: 1, student_name: 'Juan dela Cruz',  referred_by: 'Ms. Reyes',  urgency: 'Urgent',   routed_to: 'Guidance Office',  status: 'Open',        date: '2026-05-10', description: 'Repeated disruptive behavior in class.' },
  { id: 2, student_name: 'Maria Santos',    referred_by: 'Mr. Garcia', urgency: 'Moderate', routed_to: 'Department Head',  status: 'In Progress', date: '2026-05-12', description: 'Excessive absences this semester.' },
  { id: 3, student_name: 'Carlo Mendoza',   referred_by: 'Ms. Torres', urgency: 'Low',      routed_to: 'Chaplain',         status: 'Resolved',    date: '2026-05-14', description: 'Needs spiritual guidance and counseling.' },
  { id: 4, student_name: 'Ana Flores',      referred_by: 'Mr. Lim',    urgency: 'Urgent',   routed_to: 'OSAS',             status: 'Open',        date: '2026-05-15', description: 'Serious incident involving property damage.' },
  { id: 5, student_name: 'Paolo Reyes',     referred_by: 'Ms. Cruz',   urgency: 'Moderate', routed_to: 'Guidance Office',  status: 'In Progress', date: '2026-05-18', description: 'Bullying complaint from a classmate.' },
];

const BLANK_FORM = { student_name: '', description: '', urgency: 'Low', routed_to: 'Guidance Office', status: 'Open', evidence_file: null };

function Modal({ title, onClose, children }) {
  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal__box">
        <div className="modal__header">
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1a3a5c' }}>{title}</h3>
          <button className="modal__close" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

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
      onStatusChange(referral.id, status);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Referral Details" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20, fontSize: '0.85rem' }}>
        <div><div className="form-label" style={{ textTransform: 'none', letterSpacing: 0 }}>Student</div><span style={{ fontWeight: 600, color: '#1a3a5c' }}>{referral.student_name}</span></div>
        <div><div className="form-label" style={{ textTransform: 'none', letterSpacing: 0 }}>Referred by</div><span style={{ fontWeight: 600, color: '#1a3a5c' }}>{referral.referred_by}</span></div>
        <div><div className="form-label" style={{ textTransform: 'none', letterSpacing: 0 }}>Date</div><span style={{ fontWeight: 600, color: '#1a3a5c' }}>{referral.date || '—'}</span></div>
        <div><div className="form-label" style={{ textTransform: 'none', letterSpacing: 0 }}>Routed to</div><span style={{ fontWeight: 600, color: '#1a3a5c' }}>{referral.routed_to}</span></div>
        <div><div className="form-label" style={{ textTransform: 'none', letterSpacing: 0 }}>Urgency</div><span className={`badge ${URGENCY_BADGE[referral.urgency] || ''}`}>{referral.urgency}</span></div>
        <div><div className="form-label" style={{ textTransform: 'none', letterSpacing: 0 }}>Status</div>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="select" style={{ maxWidth: '100%', marginTop: 4 }}>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ background: '#f7f9fc', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.83rem', color: '#334155' }}>
        {referral.description || '—'}
      </div>

      <div className="modal__actions">
        <button className="btn btn--outline" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={handleStatusSave} disabled={saving}>
          {saving ? 'Saving…' : 'Update Status'}
        </button>
      </div>
    </Modal>
  );
}

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
      delete payload.evidence_file;
      if (isEdit) {
        await updateReferral(initial.id, payload);
        onSaved({ ...initial, ...payload });
      } else {
        const res = await createReferral(payload);
        onSaved({ id: res.data.id ?? Date.now(), ...payload, referred_by: 'You', date: new Date().toISOString().slice(0, 10) });
      }
    } catch {
      onSaved({ id: initial?.id ?? Date.now(), ...form, referred_by: initial?.referred_by ?? 'You', date: initial?.date ?? new Date().toISOString().slice(0, 10) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isEdit ? 'Edit Referral' : 'New Referral'} onClose={onClose}>
      {err && <div className="form-error">{err}</div>}

      <div className="form-group">
        <label className="form-label">Student Name *</label>
        <input value={form.student_name} onChange={e => set('student_name', e.target.value)}
          className="input" style={{ maxWidth: 'none' }} placeholder="Full name" />
      </div>

      <div className="form-group">
        <label className="form-label">Description *</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
          className="textarea" placeholder="Describe the incident..." />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Urgency</label>
          <select value={form.urgency} onChange={e => set('urgency', e.target.value)}
            className="select" style={{ maxWidth: '100%' }}>
            {URGENCY_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Route to</label>
          <select value={form.routed_to} onChange={e => set('routed_to', e.target.value)}
            className="select" style={{ maxWidth: '100%' }}>
            {ROUTE_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {isEdit && (
        <div className="form-group">
          <label className="form-label">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="select" style={{ maxWidth: '100%' }}>
            {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Attach Evidence (optional)</label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px dashed #d1dae6', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: '0.85rem', color: '#94a3b8' }}>
          <Upload size={14} />
          <span>{form.evidence_file?.name ?? 'Click to upload image or file'}</span>
          <input type="file" hidden accept="image/*,.pdf" onChange={e => set('evidence_file', e.target.files[0])} />
        </label>
      </div>

      <div className="modal__actions">
        <button className="btn btn--outline" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Submit Referral'}
        </button>
      </div>
    </Modal>
  );
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState(MOCK);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [modal, setModal] = useState(null);

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

  const filtered = referrals.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.student_name.toLowerCase().includes(q) || r.referred_by?.toLowerCase().includes(q);
    const matchUrgency = !filterUrgency || r.urgency === filterUrgency;
    const matchStatus  = !filterStatus  || r.status  === filterStatus;
    return matchSearch && matchUrgency && matchStatus;
  });

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
    <div>
      <div className="page-header">
        <h1 className="page-title">Referrals</h1>
        <p className="page-subtitle">Manage referrals assigned to OSAS</p>
      </div>

      <div className="filters">
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by student or teacher name…"
            className="input" style={{ paddingLeft: 32, maxWidth: 'none' }} />
        </div>
        <select value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)} className="select">
          <option value="">All urgencies</option>
          {URGENCY_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="select">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
        <button onClick={() => setModal({ type: 'form' })}
          className="btn" style={{ marginLeft: 'auto' }}>
          <Plus size={15} /> New Referral
        </button>
      </div>

      <div className="card table-card">
        {loading && <div className="loading">Loading referrals…</div>}
        {!loading && (
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Referred by</th>
                <th>Urgency</th>
                <th>Routed to</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      {referrals.length === 0 ? (
                        <>
                          <p>No referrals yet.</p>
                          <button onClick={() => setModal({ type: 'form' })} className="btn btn--sm">
                            <Plus size={15} /> Create First Referral
                          </button>
                        </>
                      ) : (
                        <>
                          <p>No referrals match your search.</p>
                          <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Try adjusting your filters or search term.</p>
                          <button onClick={() => { setSearch(''); setFilterUrgency(''); setFilterStatus(''); }}
                            className="btn btn--sm btn--outline">
                            Clear all filters
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map(r => (
                <tr key={r.id}>
                  <td><span className="student-name">{r.student_name}</span></td>
                  <td className="text-muted">{r.referred_by || '—'}</td>
                  <td><span className={`badge ${URGENCY_BADGE[r.urgency] || ''}`}>{r.urgency}</span></td>
                  <td className="text-muted">{r.routed_to || '—'}</td>
                  <td><span className={`badge ${STATUS_BADGE[r.status] || ''}`}>{r.status}</span></td>
                  <td className="text-muted">{r.date || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => setModal({ type: 'view', data: r })}
                        className="btn btn--sm btn--outline" title="View" style={{ padding: '4px 10px' }}>
                        <Eye size={14} />
                      </button>
                      <button onClick={() => setModal({ type: 'edit', data: r })}
                        className="btn btn--sm btn--outline" title="Edit" style={{ padding: '4px 10px' }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(r.id)}
                        className="btn btn--sm btn--danger" title="Delete" style={{ padding: '4px 10px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal?.type === 'view' && (
        <ViewModal referral={modal.data} onClose={() => setModal(null)} onStatusChange={handleStatusChange} />
      )}
      {(modal?.type === 'form' || modal?.type === 'edit') && (
        <FormModal initial={modal.data} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
    </div>
  );
}
