import { useState } from 'react';
import { Plus, Search, X, Edit3, Trash2, AlertCircle, Heart } from 'lucide-react';

const MOCK_VISITS = [
  { id: 1, student_name: 'Carlo Mendoza',   date: '2026-05-21', type: 'Pastoral Counseling', status: 'Completed', notes: 'Discussed personal challenges and faith journey. Student expressed desire for continued guidance.', follow_up: '2026-06-04' },
  { id: 2, student_name: 'Bianca Reyes',    date: '2026-05-25', type: 'Grief Support',      status: 'Completed', notes: 'Provided grief counseling following loss of family member. Student coping better.', follow_up: '2026-06-01' },
  { id: 3, student_name: 'Dante Villanueva', date: '2026-05-30', type: 'Crisis Intervention', status: 'Scheduled', notes: '', follow_up: '' },
  { id: 4, student_name: 'Elena Martinez',  date: '2026-05-08', type: 'Spiritual Direction', status: 'Completed', notes: 'Final session of spiritual direction. Student feels more grounded in faith.', follow_up: '' },
];

const BLANK_FORM = { student_name: '', date: '', type: 'Pastoral Counseling', status: 'Scheduled', notes: '', follow_up: '' };
const TYPE_OPTIONS = ['Pastoral Counseling', 'Grief Support', 'Crisis Intervention', 'Spiritual Direction', 'Prayer Session', 'Bible Study', 'Follow-up'];
const STATUS_OPTIONS = ['Scheduled', 'Completed', 'Cancelled', 'No-show'];

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

export default function SpiritualCarePage() {
  const [visits, setVisits] = useState(MOCK_VISITS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null);

  const filtered = visits.filter(v => {
    const q = search.toLowerCase();
    return (!q || v.student_name.toLowerCase().includes(q)) &&
           (!filterStatus || v.status === filterStatus);
  });

  function handleDelete(id) {
    if (!window.confirm('Delete this visit record?')) return;
    setVisits(prev => prev.filter(v => v.id !== id));
  }

  function handleSave(form) {
    if (modal?.data) {
      setVisits(prev => prev.map(v => v.id === form.id ? form : v));
    } else {
      setVisits(prev => [{ ...form, id: Date.now() }, ...prev]);
    }
    setModal(null);
  }

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">Spiritual & Pastoral Care</h1>
        <p className="page-subtitle">Track pastoral visits, counseling sessions, and spiritual direction</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by student name…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
        <button onClick={() => setModal({ type: 'form', data: null })}
          style={{ background: '#4a7c8a' }}
          className="ml-auto flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity">
          <Plus size={15} /> New Pastoral Visit
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Heart size={40} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No pastoral visits recorded.</p>
          </div>
        )}
        {filtered.map(visit => (
          <div key={visit.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">{visit.student_name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{visit.date} &middot; {visit.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  visit.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  visit.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                  visit.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{visit.status}</span>
                <button onClick={() => setModal({ type: 'form', data: visit })}
                  className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDelete(visit.id)}
                  className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {visit.notes && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-2">{visit.notes}</p>
            )}
            {visit.follow_up && (
              <p className="text-xs text-amber-600">Follow-up: {visit.follow_up}</p>
            )}
          </div>
        ))}
      </div>

      {modal?.type === 'form' && (
        <PastoralFormModal
          initial={modal.data}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function PastoralFormModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial ?? BLANK_FORM);
  const [err, setErr] = useState('');

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function handleSubmit() {
    if (!form.student_name.trim() || !form.date) {
      setErr('Student name and date are required.'); return;
    }
    onSave(form);
  }

  return (
    <Modal title={initial ? 'Edit Pastoral Visit' : 'New Pastoral Visit'} onClose={onClose}>
      {err && <p className="text-red-600 text-xs mb-3 flex items-center gap-1"><AlertCircle size={13}/>{err}</p>}
      <div className="space-y-3 text-sm">
        <div>
          <label className="block text-gray-600 mb-1">Student Name *</label>
          <input value={form.student_name} onChange={e => set('student_name', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Full name" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-600 mb-1">Date *</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200">
              {TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200">
            {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Pastoral Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
            placeholder="Document pastoral session details, observations, and prayers…" />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Follow-up Date</label>
          <input type="date" value={form.follow_up} onChange={e => set('follow_up', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
        <button onClick={handleSubmit}
          style={{ background: '#4a7c8a' }}
          className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity">
          {initial ? 'Save Changes' : 'Create Record'}
        </button>
      </div>
    </Modal>
  );
}
