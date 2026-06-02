import { useState } from 'react';
import { Plus, Search, X, Edit3, Trash2, AlertCircle, Users } from 'lucide-react';

const MOCK_MEETINGS = [
  { id: 1, title: 'Student Case Conference - Juan dela Cruz', date: '2026-06-03', time: '10:00', type: 'Case Conference', status: 'Scheduled', participants: 'Guidance, OSAS, Dept Head', notes: 'Discuss behavioral intervention plan.', outcome: '' },
  { id: 2, title: 'Parent-Teacher Meeting - Maria Santos', date: '2026-06-01', time: '14:00', type: 'Parent Meeting', status: 'Completed', participants: 'Guidance, Teacher, Parent', notes: 'Discussed academic progress and support strategies.', outcome: 'Parent agreed to weekly check-ins.' },
  { id: 3, title: 'Referral Review - Carlo Mendoza', date: '2026-05-28', time: '09:00', type: 'Review', status: 'Completed', participants: 'Guidance, Chaplain', notes: 'Reviewed referral and assessed student needs.', outcome: 'Referred to Chaplain for spiritual support.' },
];

const BLANK_FORM = { title: '', date: '', time: '', type: 'Case Conference', status: 'Scheduled', participants: '', notes: '', outcome: '' };
const TYPE_OPTIONS = ['Case Conference', 'Parent Meeting', 'Review', 'Disciplinary Hearing', 'Planning Session'];
const STATUS_OPTIONS = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'];

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

export default function GuidanceMeetingsPage() {
  const [meetings, setMeetings] = useState(MOCK_MEETINGS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null);

  const filtered = meetings.filter(m => {
    const q = search.toLowerCase();
    return (!q || m.title.toLowerCase().includes(q)) &&
           (!filterStatus || m.status === filterStatus);
  });

  function handleDelete(id) {
    if (!window.confirm('Delete this meeting?')) return;
    setMeetings(prev => prev.filter(m => m.id !== id));
  }

  function handleSave(form) {
    if (modal?.data) {
      setMeetings(prev => prev.map(m => m.id === form.id ? form : m));
    } else {
      setMeetings(prev => [{ ...form, id: Date.now() }, ...prev]);
    }
    setModal(null);
  }

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">Case Meetings</h1>
        <p className="page-subtitle">Schedule and document case meetings, conferences, and reviews</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search meetings…"
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
          <Plus size={15} /> Schedule Meeting
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Users size={40} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No meetings scheduled.</p>
          </div>
        )}
        {filtered.map(meeting => (
          <div key={meeting.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                  meeting.type === 'Case Conference' ? 'bg-blue-500' :
                  meeting.type === 'Parent Meeting' ? 'bg-green-500' :
                  meeting.type === 'Review' ? 'bg-purple-500' :
                  meeting.type === 'Disciplinary Hearing' ? 'bg-red-500' : 'bg-gray-500'
                }`}>
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{meeting.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{meeting.date} at {meeting.time} &middot; {meeting.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  meeting.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  meeting.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                  meeting.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>{meeting.status}</span>
                <button onClick={() => setModal({ type: 'form', data: meeting })}
                  className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDelete(meeting.id)}
                  className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-2">Participants: {meeting.participants}</div>
            {meeting.notes && <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-2">{meeting.notes}</p>}
            {meeting.outcome && (
              <p className="text-sm font-medium text-green-700 bg-green-50 rounded-lg p-3">
                <span className="font-semibold">Outcome:</span> {meeting.outcome}
              </p>
            )}
          </div>
        ))}
      </div>

      {modal?.type === 'form' && (
        <MeetingFormModal
          initial={modal.data}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function MeetingFormModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial ?? BLANK_FORM);
  const [err, setErr] = useState('');

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function handleSubmit() {
    if (!form.title.trim() || !form.date) {
      setErr('Title and date are required.'); return;
    }
    onSave(form);
  }

  return (
    <Modal title={initial ? 'Edit Meeting' : 'Schedule Meeting'} onClose={onClose}>
      {err && <p className="text-red-600 text-xs mb-3 flex items-center gap-1"><AlertCircle size={13}/>{err}</p>}
      <div className="space-y-3 text-sm">
        <div>
          <label className="block text-gray-600 mb-1">Meeting Title *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="e.g., Case Conference - Student Name" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-600 mb-1">Date *</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Time</label>
            <input type="time" value={form.time} onChange={e => set('time', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-600 mb-1">Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200">
              {TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
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
          <label className="block text-gray-600 mb-1">Participants</label>
          <input value={form.participants} onChange={e => set('participants', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="e.g., Guidance, OSAS, Teacher, Parent" />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Meeting Notes / Agenda</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
            placeholder="Document agenda, discussion points, and decisions…" />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Outcome / Resolution</label>
          <textarea value={form.outcome} onChange={e => set('outcome', e.target.value)} rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
            placeholder="Document the outcome or resolution reached…" />
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
        <button onClick={handleSubmit}
          style={{ background: '#4a7c8a' }}
          className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity">
          {initial ? 'Save Changes' : 'Schedule Meeting'}
        </button>
      </div>
    </Modal>
  );
}
