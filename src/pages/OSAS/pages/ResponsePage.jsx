import { useState, useEffect, useSyncExternalStore } from 'react';
import { FileText, CheckCircle } from 'lucide-react';
import Avatar from '../../../components/Avatar';
import Modal, { ModalHeader, ModalActions } from '../../../components/Modal';
import { mockStore, filterBySchoolYear } from '../../../shared/mockStore';

function AssessmentModal({ assessment, onClose, onSave }) {
  const [form, setForm] = useState({ assessment: assessment?.assessment || '', recommendation: assessment?.recommendation || '', resolution: assessment?.resolution || '' });
  if (!assessment) return null;
  return (
    <Modal onClose={onClose} maxWidth={600}>
      <ModalHeader onClose={onClose}>Response Form</ModalHeader>
      <p className="modal__context">{assessment.student_name} · {assessment.type}</p>
      <div className="form-group">
        <label className="form-label">Assessment</label>
        <textarea className="textarea" value={form.assessment} onChange={e => setForm({ ...form, assessment: e.target.value })} placeholder="Describe your assessment of the situation..." style={{ minHeight: 80 }} />
      </div>
      <div className="form-group">
        <label className="form-label">Recommendation</label>
        <textarea className="textarea" value={form.recommendation} onChange={e => setForm({ ...form, recommendation: e.target.value })} placeholder="Recommend actions or interventions..." style={{ minHeight: 80 }} />
      </div>
      <div className="form-group">
        <label className="form-label">Resolution Notes</label>
        <textarea className="textarea" value={form.resolution} onChange={e => setForm({ ...form, resolution: e.target.value })} placeholder="Document resolution outcomes..." style={{ minHeight: 80 }} />
      </div>
      <ModalActions>
        <button className="btn btn--outline" onClick={onClose}>Cancel</button>
        <button className="btn" disabled={!form.assessment && !form.recommendation} onClick={() => { onSave(assessment.id, form.assessment, form.recommendation, form.resolution); onClose(); }}>Save Response</button>
      </ModalActions>
    </Modal>
  );
}

export default function ResponsePage() {
  const store = useSyncExternalStore(mockStore.subscribe, () => mockStore.getState());
  const assessments = filterBySchoolYear(store.assessments, store.settings.schoolYear, 'date');
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const handleSave = (id, assessment, recommendation, resolution) => {
    mockStore.updateAssessment(id, { assessment, recommendation, resolution, status: assessment && recommendation ? 'completed' : 'draft' });
  };

  const filtered = assessments.filter(a => {
    const matchSearch = `${a.student_name} ${a.type}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = { total: assessments.length, completed: assessments.filter(a => a.status === 'completed').length, draft: assessments.filter(a => a.status === 'draft').length };

  if (loading) return <div className="loading">Loading responses...</div>;

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Response Module</h1><p className="page-subtitle">Document assessments, recommendations, and resolution notes for each case.</p></div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}><FileText size={20} /></div><div><div className="stat-card__value">{stats.total}</div><div className="stat-card__label">Total Cases</div></div></div>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}><FileText size={20} /></div><div><div className="stat-card__value">{stats.draft}</div><div className="stat-card__label">Drafts</div></div></div>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}><CheckCircle size={20} /></div><div><div className="stat-card__value">{stats.completed}</div><div className="stat-card__label">Completed</div></div></div>
      </div>
      <div className="filters">
        <input className="input" placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option><option value="draft">Draft</option><option value="completed">Completed</option>
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(a => (
          <div key={a.id} className="card" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div className="report-card__student">
                <Avatar name={a.student_name} />
                <div>
                  <div className="report-card__name">{a.student_name}</div>
                  <div className="report-card__meta">{a.student_id} · {a.type} · {a.date}</div>
                </div>
              </div>
              <span className="badge" style={a.status === 'draft' ? { background: '#fff3e0', color: '#e65100' } : { background: '#e8f5e9', color: '#2e7d32' }}>{a.status}</span>
            </div>
            {a.assessment && <div style={{ marginBottom: 10, marginLeft: 46 }}><div className="remarks-box__heading">Assessment</div><p className="report-card__desc">{a.assessment}</p></div>}
            {a.recommendation && <div style={{ marginBottom: 10, marginLeft: 46 }}><div className="remarks-box__heading" style={{ color: '#2e7d32' }}>Recommendation</div><p className="report-card__desc">{a.recommendation}</p></div>}
            {a.resolution && <div style={{ marginLeft: 46 }}><div className="remarks-box__heading" style={{ color: '#4527a0' }}>Resolution</div><p className="report-card__desc">{a.resolution}</p></div>}
            <div className="report-card__actions" style={{ marginLeft: 46 }}><button className="btn btn--sm" onClick={() => setEditTarget(a)}>{a.status === 'draft' ? 'Complete Response' : 'Edit Response'}</button></div>
          </div>
        ))}
        {filtered.length === 0 && <div className="empty-state" style={{ padding: 60 }}>No cases found.</div>}
      </div>
      {editTarget && <AssessmentModal assessment={editTarget} onClose={() => setEditTarget(null)} onSave={handleSave} />}
    </div>
  );
}
