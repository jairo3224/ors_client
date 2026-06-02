import { useState } from 'react';
import { Search, X, Eye } from 'lucide-react';

const URGENCY_OPTIONS = ['Low', 'Moderate', 'Urgent'];
const STATUS_OPTIONS  = ['Open', 'In Progress', 'Resolved'];

const URGENCY_STYLE = {
  Urgent:   { bg: '#fcebeb', color: '#a32d2d' },
  Moderate: { bg: '#faeeda', color: '#854f0b' },
  Low:      { bg: '#eaf3de', color: '#3b6d11' },
};
const STATUS_COLOR = { Open: '#e24b4a', 'In Progress': '#ef9f27', Resolved: '#639922' };

const MOCK = [
  { id: 1, student_name: 'Juan dela Cruz',  referred_by: 'Ms. Reyes',  urgency: 'Urgent',   routed_to: 'Guidance Office', status: 'Open',        date: '2026-05-28', description: 'Behavioral concerns in class. Student shows signs of aggression towards classmates.', notes: '' },
  { id: 2, student_name: 'Maria Santos',    referred_by: 'Mr. Garcia', urgency: 'Moderate', routed_to: 'Guidance Office', status: 'In Progress', date: '2026-05-25', description: 'Academic stress and anxiety. Student reports difficulty coping with workload.', notes: 'Initial counseling session completed. Student agrees to weekly check-ins.' },
  { id: 3, student_name: 'Carlo Mendoza',   referred_by: 'Ms. Torres', urgency: 'Low',      routed_to: 'Guidance Office', status: 'Resolved',    date: '2026-05-20', description: 'Peer relationship issues. Student had falling out with friend group.', notes: 'Three sessions completed. Student reports improved relationships.' },
  { id: 4, student_name: 'Ana Flores',      referred_by: 'Mr. Lim',    urgency: 'Urgent',   routed_to: 'Guidance Office', status: 'Open',        date: '2026-05-30', description: 'Family concerns affecting studies. Student distracted and withdrawn.', notes: '' },
  { id: 5, student_name: 'Paolo Reyes',     referred_by: 'Ms. Cruz',   urgency: 'Moderate', routed_to: 'Guidance Office', status: 'In Progress', date: '2026-05-27', description: 'Career guidance consultation. Student unsure about course selection.', notes: 'Assessment completed. Discussed career options aligned with interests.' },
];

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

function ViewModal({ referral, onClose, onStatusChange, onAddNote }) {
  const [status, setStatus] = useState(referral.status);
  const [noteText, setNoteText] = useState('');

  function handleStatusSave() {
    onStatusChange(referral.id, status);
    onClose();
  }

  function handleAddNote() {
    if (!noteText.trim()) return;
    onAddNote(referral.id, noteText.trim());
    setNoteText('');
  }

  return (
    <Modal title="Referral Details" onClose={onClose}>
      <dl className="space-y-3 text-sm">
        {[
          ['Student', referral.student_name],
          ['Referred by', referral.referred_by],
          ['Date', referral.date],
          ['Routed to', referral.routed_to],
        ].map(([label, val]) => (
          <div key={label} className="flex gap-2">
            <dt className="text-gray-500 w-28 shrink-0">{label}</dt>
            <dd className={`font-medium ${val ? 'text-gray-800' : 'text-gray-300'}`}>{val || '—'}</dd>
          </div>
        ))}
        <div className="flex gap-2 items-center">
          <dt className="text-gray-500 w-28 shrink-0">Urgency</dt>
          <dd><span style={{ ...URGENCY_STYLE[referral.urgency], padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{referral.urgency}</span></dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-gray-500 w-28 shrink-0">Description</dt>
          <dd className="font-medium text-gray-800">{referral.description || '—'}</dd>
        </div>
        {referral.notes && (
          <div className="flex gap-2">
            <dt className="text-gray-500 w-28 shrink-0">Counseling Notes</dt>
            <dd className="font-medium text-gray-800">{referral.notes}</dd>
          </div>
        )}
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

      <div className="mt-4 pt-4 border-t border-gray-100">
        <label className="block text-sm font-medium text-gray-600 mb-2">Add Counseling Note</label>
        <div className="flex gap-2">
          <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={2}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
            placeholder="Document your session notes..." />
          <button onClick={handleAddNote} disabled={!noteText.trim()}
            style={{ background: '#4a7c8a' }}
            className="px-3 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 self-end">
            Add
          </button>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
        <button onClick={handleStatusSave}
          style={{ background: '#4a7c8a' }}
          className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity">
          Update Status
        </button>
      </div>
    </Modal>
  );
}

export default function GuidanceReferralsPage() {
  const [referrals, setReferrals] = useState(MOCK);
  const [search, setSearch] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null);

  const filtered = referrals.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.student_name.toLowerCase().includes(q) || r.referred_by?.toLowerCase().includes(q);
    const matchUrgency = !filterUrgency || r.urgency === filterUrgency;
    const matchStatus  = !filterStatus  || r.status  === filterStatus;
    return matchSearch && matchUrgency && matchStatus;
  });

  function handleStatusChange(id, status) {
    setReferrals(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }

  function handleAddNote(id, note) {
    setReferrals(prev => prev.map(r =>
      r.id === id ? { ...r, notes: r.notes ? `${r.notes}\n${note}` : note } : r
    ));
  }

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">Referrals</h1>
        <p className="page-subtitle">Manage referrals assigned to Guidance Office</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by student or referrer…"
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
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                <th className="text-left px-4 py-2 font-medium">Student</th>
                <th className="text-left px-4 py-2 font-medium">Referred by</th>
                <th className="text-left px-4 py-2 font-medium">Urgency</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No referrals found.</td></tr>
              )}
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{r.student_name}</td>
                  <td className="px-4 py-3 text-gray-500">{r.referred_by || '—'}</td>
                  <td className="px-4 py-3">
                    <span style={{ ...URGENCY_STYLE[r.urgency], padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{r.urgency}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 text-gray-700">
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[r.status] ?? '#888', display: 'inline-block' }} />
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{r.date || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModal({ type: 'view', data: r })}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="View">
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal?.type === 'view' && (
        <ViewModal
          referral={modal.data}
          onClose={() => setModal(null)}
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
        />
      )}
    </div>
  );
}
