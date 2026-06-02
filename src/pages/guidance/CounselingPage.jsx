import { useState } from 'react';
import { Plus, Search, X, Edit3, Trash2, AlertCircle, FileText } from 'lucide-react';

const MOCK_SESSIONS = [
  { id: 1, student_name: 'Maria Santos',    date: '2026-05-29', type: 'Individual', status: 'Completed', notes: 'Discussed academic anxiety. Breathing exercises introduced.', follow_up: '2026-06-05' },
  { id: 2, student_name: 'Carlo Mendoza',   date: '2026-05-22', type: 'Individual', status: 'Completed', notes: 'Final session. Student reports improved peer relationships.', follow_up: '' },
  { id: 3, student_name: 'Paolo Reyes',     date: '2026-05-30', type: 'Assessment', status: 'Completed', notes: 'Career assessment administered. Results discussed.', follow_up: '2026-06-06' },
  { id: 4, student_name: 'Ana Flores',      date: '2026-06-01', type: 'Initial',    status: 'Scheduled', notes: '', follow_up: '' },
];

const BLANK_FORM = { student_name: '', date: '', type: 'Individual', status: 'Scheduled', notes: '', follow_up: '' };
const TYPE_OPTIONS = ['Individual', 'Group', 'Initial', 'Assessment', 'Crisis', 'Follow-up'];
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

export default function CounselingPage() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null);

  const filtered = sessions.filter(s => {
    const q = search.toLowerCase();
    return (!q || s.student_name.toLowerCase().includes(q)) &&
           (!filterStatus || s.status === filterStatus);
  });

  function handleDelete(id) {
    if (!window.confirm('Delete this session?')) return;
    setSessions(prev => prev.filter(s => s.id !== id));
  }

  function handleSave(form) {
    if (modal?.data) {
      setSessions(prev => prev.map(s => s.id === form.id ? form : s));
    } else {
      setSessions(prev => [{ ...form, id: Date.now() }, ...prev]);
    }
    setModal(null);
  }

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">Counseling Sessions</h1>
        <p className="page-subtitle">Track counseling sessions and case notes</p>
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
          <Plus size={15} /> New Session
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FileText size={40} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No counseling sessions recorded.</p>
          </div>
        )}
        {filtered.map(session => (
          <div key={session.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">{session.student_name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{session.date} &middot; {session.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  session.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  session.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                  session.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{session.status}</span>
                <button onClick={() => setModal({ type: 'form', data: session })}
                  className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDelete(session.id)}
                  className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {session.notes && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-2">{session.notes}</p>
            )}
            {session.follow_up && (
              <p className="text-xs text-amber-600">Follow-up: {session.follow_up}</p>
            )}
          </div>
        ))}
      </div>

      {modal?.type === 'form' && (
        <SessionFormModal
          initial={modal.data}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function SessionFormModal({ initial, onClose, onSave }) {
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
    <Modal title={initial ? 'Edit Session' : 'New Counseling Session'} onClose={onClose}>
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
          <label className="block text-gray-600 mb-1">Session Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
            placeholder="Document session details, observations, and interventions…" />
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
          {initial ? 'Save Changes' : 'Create Session'}
        </button>
      </div>
    </Modal>
  );
}
