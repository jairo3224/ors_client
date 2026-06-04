import { useState, useEffect, useSyncExternalStore } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { mockStore } from '../../../shared/mockStore';

export default function SettingsPage() {
  const store = useSyncExternalStore(mockStore.subscribe, () => mockStore.getState());
  const [loading, setLoading] = useState(true);
  const [schoolYear, setSchoolYear] = useState(() => store.settings.schoolYear);
  const [semester, setSemester] = useState(() => store.settings.semester);
  const [semesters] = useState(['1st Semester', '2nd Semester', 'Summer']);
  const [newType, setNewType] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  // Re-sync form state with store when navigating back
  useEffect(() => {
    setSchoolYear(store.settings.schoolYear);
    setSemester(store.settings.semester);
  }, [store.settings.schoolYear, store.settings.semester]);

  const incidentTypes = store.settings.incidentTypes;

  const handleSave = () => {
    mockStore.updateSettings({ schoolYear, semester });
    mockStore.addAuditLog({ action: 'SETTINGS_UPDATED', user: 'Admin User', role: 'OSAS', target: 'System Settings', details: `School year updated to ${schoolYear}` });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddType = () => {
    if (!newType.trim()) return;
    mockStore.addIncidentType({ name: newType.trim(), description: newDesc.trim() });
    setNewType('');
    setNewDesc('');
  };

  const handleRemoveType = (id) => mockStore.removeIncidentType(id);
  const handleToggleType = (id) => mockStore.toggleIncidentType(id);

  if (loading) return <div className="loading">Loading settings...</div>;

  return (
    <div>
      <div className="page-header"><h1 className="page-title">System Settings</h1><p className="page-subtitle">Configure school year, semesters, and incident types.</p></div>

      {saved && <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: 10, padding: '10px 16px', marginBottom: 18, color: '#2e7d32', fontSize: '0.85rem', fontWeight: 600 }}>Settings saved successfully.</div>}

      <div className="overview-panels">
        <div className="card">
          <div className="card__title">Academic Period</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>School Year</label>
              <select className="select" value={schoolYear} onChange={e => setSchoolYear(e.target.value)} style={{ width: '100%' }}>
                {['2024-2025', '2025-2026', '2026-2027'].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Current Semester</label>
              <select className="select" value={semester} onChange={e => setSemester(e.target.value)} style={{ width: '100%' }}>
                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button className="btn" onClick={handleSave}><Save size={14} style={{ marginRight: 6 }} />Save Settings</button>
          </div>
        </div>

        <div className="card">
          <div className="card__title">Incident Types</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {incidentTypes.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f7f9fc', borderRadius: 8, fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={() => handleToggleType(t.id)}
                    style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${t.active ? '#2e7d32' : '#ccc'}`, background: t.active ? '#2e7d32' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px' }}>
                    {t.active ? '\u2713' : ''}
                  </button>
                  <div><strong style={{ color: '#1a3a5c' }}>{t.name}</strong><br /><span style={{ color: '#64748b', fontSize: '0.78rem' }}>{t.description}</span></div>
                </div>
                <button onClick={() => handleRemoveType(t.id)} style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', padding: 4 }}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #e8edf2', paddingTop: 14 }}>
            <div className="card__title" style={{ marginBottom: 10 }}>Add New Type</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="input" style={{ width: '100%', maxWidth: '100%' }} placeholder="Type name" value={newType} onChange={e => setNewType(e.target.value)} />
              <input className="input" style={{ width: '100%', maxWidth: '100%' }} placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              <button className="btn btn--sm" disabled={!newType.trim()} onClick={handleAddType} style={{ alignSelf: 'flex-start', background: !newType.trim() ? '#ccc' : '#1a3a5c' }}>
                <Plus size={13} style={{ marginRight: 4 }} />Add Type
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
