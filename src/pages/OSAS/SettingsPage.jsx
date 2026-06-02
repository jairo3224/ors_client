import { useState } from 'react';
import { Plus, X, Save, AlertCircle, Calendar, Tag, BookOpen, Trash2 } from 'lucide-react';

const INITIAL_STATE = {
  schoolYears: [
    { id: 1, label: '2025-2026', is_current: true },
    { id: 2, label: '2024-2025', is_current: false },
  ],
  semesters: [
    { id: 1, school_year: '2025-2026', label: '1st Semester', start_date: '2025-08-01', end_date: '2025-12-20', is_current: true },
    { id: 2, school_year: '2025-2026', label: '2nd Semester', start_date: '2026-01-05', end_date: '2026-05-30', is_current: false },
  ],
  incidentTypes: [
    { id: 1, name: 'Disrespectful Behavior', category: 'Behavioral', severity: 'Moderate' },
    { id: 2, name: 'Physical Altercation', category: 'Behavioral', severity: 'High' },
    { id: 3, name: 'Bullying', category: 'Behavioral', severity: 'High' },
    { id: 4, name: 'Cheating', category: 'Academic', severity: 'Moderate' },
    { id: 5, name: 'Attendance Issue', category: 'Academic', severity: 'Low' },
    { id: 6, name: 'Vandalism', category: 'Behavioral', severity: 'High' },
  ],
};

const CATEGORIES = ['Behavioral', 'Academic', 'Other'];
const SEVERITIES = ['Low', 'Moderate', 'High'];

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

export default function SettingsPage() {
  const [data, setData] = useState(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState('school-years');
  const [modal, setModal] = useState(null);
  const [saved, setSaved] = useState(false);

  const tabs = [
    { key: 'school-years', label: 'School Years', icon: Calendar },
    { key: 'semesters', label: 'Semesters', icon: BookOpen },
    { key: 'incident-types', label: 'Incident Types', icon: Tag },
  ];

  function handleAddSchoolYear(form) {
    setData(prev => ({
      ...prev,
      schoolYears: [...prev.schoolYears, { ...form, id: Date.now() }],
    }));
    setModal(null);
  }

  function handleDeleteSchoolYear(id) {
    if (!window.confirm('Delete this school year?')) return;
    setData(prev => ({ ...prev, schoolYears: prev.schoolYears.filter(s => s.id !== id) }));
  }

  function handleAddSemester(form) {
    setData(prev => ({
      ...prev,
      semesters: [...prev.semesters, { ...form, id: Date.now() }],
    }));
    setModal(null);
  }

  function handleDeleteSemester(id) {
    if (!window.confirm('Delete this semester?')) return;
    setData(prev => ({ ...prev, semesters: prev.semesters.filter(s => s.id !== id) }));
  }

  function handleAddIncidentType(form) {
    setData(prev => ({
      ...prev,
      incidentTypes: [...prev.incidentTypes, { ...form, id: Date.now() }],
    }));
    setModal(null);
  }

  function handleDeleteIncidentType(id) {
    setData(prev => ({ ...prev, incidentTypes: prev.incidentTypes.filter(t => t.id !== id) }));
  }

  function handleSaveSettings() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function renderSchoolYears() {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">Manage academic school years</p>
          <button onClick={() => setModal({ type: 'school-year' })}
            style={{ background: '#4a7c8a' }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity">
            <Plus size={15} /> Add School Year
          </button>
        </div>
        <div className="space-y-2">
          {data.schoolYears.map(sy => (
            <div key={sy.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-gray-400" />
                <span className="font-medium text-gray-800">{sy.label}</span>
                {sy.is_current && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Current</span>
                )}
              </div>
              <button onClick={() => handleDeleteSchoolYear(sy.id)}
                className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderSemesters() {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">Manage semesters within each school year</p>
          <button onClick={() => setModal({ type: 'semester' })}
            style={{ background: '#4a7c8a' }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity">
            <Plus size={15} /> Add Semester
          </button>
        </div>
        <div className="space-y-2">
          {data.semesters.map(sem => (
            <div key={sem.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <BookOpen size={18} className="text-gray-400" />
                <div>
                  <span className="font-medium text-gray-800">{sem.label}</span>
                  <span className="text-gray-400 text-xs ml-2">({sem.school_year})</span>
                  {sem.is_current && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold ml-2">Current</span>
                  )}
                  <div className="text-xs text-gray-400 mt-0.5">{sem.start_date} → {sem.end_date}</div>
                </div>
              </div>
              <button onClick={() => handleDeleteSemester(sem.id)}
                className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderIncidentTypes() {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">Manage incident types for referral and reporting</p>
          <button onClick={() => setModal({ type: 'incident-type' })}
            style={{ background: '#4a7c8a' }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity">
            <Plus size={15} /> Add Incident Type
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-2 font-medium">Name</th>
                <th className="text-left px-4 py-2 font-medium">Category</th>
                <th className="text-left px-4 py-2 font-medium">Severity</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {data.incidentTypes.map(t => (
                <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{t.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      t.category === 'Behavioral' ? 'bg-red-100 text-red-700' :
                      t.category === 'Academic' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>{t.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{
                      padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                      background: t.severity === 'High' ? '#fcebeb' : t.severity === 'Moderate' ? '#faeeda' : '#eaf3de',
                      color: t.severity === 'High' ? '#a32d2d' : t.severity === 'Moderate' ? '#854f0b' : '#3b6d11',
                    }}>{t.severity}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDeleteIncidentType(t.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure school years, semesters, and incident types</p>
        </div>
        <button onClick={handleSaveSettings}
          style={{ background: saved ? '#16a34a' : '#4a7c8a' }}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-all">
          <Save size={15} /> {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-all ${
                activeTab === tab.key ? 'bg-white shadow-sm text-gray-800 font-semibold' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {activeTab === 'school-years' && renderSchoolYears()}
        {activeTab === 'semesters' && renderSemesters()}
        {activeTab === 'incident-types' && renderIncidentTypes()}
      </div>

      {modal?.type === 'school-year' && (
        <Modal title="Add School Year" onClose={() => setModal(null)}>
          <SchoolYearForm onSave={handleAddSchoolYear} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'semester' && (
        <Modal title="Add Semester" onClose={() => setModal(null)}>
          <SemesterForm schoolYears={data.schoolYears} onSave={handleAddSemester} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'incident-type' && (
        <Modal title="Add Incident Type" onClose={() => setModal(null)}>
          <IncidentTypeForm onSave={handleAddIncidentType} onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}

function SchoolYearForm({ onSave, onClose }) {
  const [label, setLabel] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [err, setErr] = useState('');

  function handleSubmit() {
    if (!label.trim()) { setErr('School year label is required.'); return; }
    onSave({ label: label.trim(), is_current: isCurrent });
  }

  return (
    <div className="space-y-3 text-sm">
      {err && <p className="text-red-600 text-xs flex items-center gap-1"><AlertCircle size={13}/>{err}</p>}
      <div>
        <label className="block text-gray-600 mb-1">School Year *</label>
        <input value={label} onChange={e => setLabel(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="e.g., 2025-2026" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={isCurrent} onChange={e => setIsCurrent(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-200" />
        <span className="text-gray-600">Set as current school year</span>
      </label>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
        <button onClick={handleSubmit}
          style={{ background: '#4a7c8a' }}
          className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity">Add School Year</button>
      </div>
    </div>
  );
}

function SemesterForm({ schoolYears, onSave, onClose }) {
  const [label, setLabel] = useState('');
  const [schoolYear, setSchoolYear] = useState(schoolYears[0]?.label || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [err, setErr] = useState('');

  function handleSubmit() {
    if (!label.trim() || !startDate || !endDate) {
      setErr('Label, start date, and end date are required.'); return;
    }
    onSave({ label: label.trim(), school_year: schoolYear, start_date: startDate, end_date: endDate, is_current: isCurrent });
  }

  return (
    <div className="space-y-3 text-sm">
      {err && <p className="text-red-600 text-xs flex items-center gap-1"><AlertCircle size={13}/>{err}</p>}
      <div>
        <label className="block text-gray-600 mb-1">Semester Label *</label>
        <input value={label} onChange={e => setLabel(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="e.g., 1st Semester" />
      </div>
      <div>
        <label className="block text-gray-600 mb-1">School Year</label>
        <select value={schoolYear} onChange={e => setSchoolYear(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200">
          {schoolYears.map(sy => <option key={sy.id}>{sy.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-600 mb-1">Start Date *</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">End Date *</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={isCurrent} onChange={e => setIsCurrent(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-200" />
        <span className="text-gray-600">Set as current semester</span>
      </label>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
        <button onClick={handleSubmit}
          style={{ background: '#4a7c8a' }}
          className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity">Add Semester</button>
      </div>
    </div>
  );
}

function IncidentTypeForm({ onSave, onClose }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Behavioral');
  const [severity, setSeverity] = useState('Moderate');
  const [err, setErr] = useState('');

  function handleSubmit() {
    if (!name.trim()) { setErr('Incident type name is required.'); return; }
    onSave({ name: name.trim(), category, severity });
  }

  return (
    <div className="space-y-3 text-sm">
      {err && <p className="text-red-600 text-xs flex items-center gap-1"><AlertCircle size={13}/>{err}</p>}
      <div>
        <label className="block text-gray-600 mb-1">Incident Type Name *</label>
        <input value={name} onChange={e => setName(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="e.g., Disrespectful Behavior" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-600 mb-1">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Default Severity</label>
          <select value={severity} onChange={e => setSeverity(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200">
            {SEVERITIES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
        <button onClick={handleSubmit}
          style={{ background: '#4a7c8a' }}
          className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity">Add Incident Type</button>
      </div>
    </div>
  );
}
