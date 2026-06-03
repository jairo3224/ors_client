import { useState, useEffect, useSyncExternalStore } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { AlertTriangle, FileText, Clock, ShieldAlert, Users, Building2, Briefcase, TrendingUp, Plus, Send, Search } from 'lucide-react';
import Avatar from '../../../components/Avatar';
import Modal, { ModalHeader, ModalActions } from '../../../components/Modal';
import { INCIDENT_TYPES } from '../../../constants';
import { ALL_STUDENTS } from '../../../constants/mockData';
import { mockStore, filterBySchoolYear } from '../../../shared/mockStore';

function MetricCard({ icon, title, value, sub, tooltip, accent, buttonLabel, onClick }) {
  return (
    <div
      className="teacher-metric-card teacher-metric-card--clickable"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
    >
      <div className="teacher-metric-card__header">
        <div className="teacher-metric-card__icon" style={{ backgroundColor: accent + '18', color: accent }}>
          {icon}
        </div>
        {tooltip && (
          <span className="teacher-metric-card__tooltip" title={tooltip}>ⓘ</span>
        )}
      </div>
      <div className="teacher-metric-card__value">{value}</div>
      <div className="teacher-metric-card__title">{title}</div>
      {sub && <div className="teacher-metric-card__sub">{sub}</div>}
      <button
        className="btn btn--sm"
        onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

export default function OverviewPage() {
  const { user } = useAuth();
  const store = useSyncExternalStore(mockStore.subscribe, () => mockStore.getState());
  const schoolYear = store.settings.schoolYear;
  const reports = filterBySchoolYear(store.reports, schoolYear, 'date_submitted');
  const cases = filterBySchoolYear(store.cases, schoolYear, 'opened_date');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const criticalAlerts = reports.filter(r => r.severity === 'critical').length;
  const openCases = cases.filter(c => c.status === 'open').length;
  const totalReports = reports.length;
  const totalCases = cases.length;
  const highPriority = cases.filter(c => c.priority === 'high').length;

  // ─── Interactive card state ─────────────────────────
  const [showReportModal, setShowReportModal] = useState(false);
  const [showOffendersModal, setShowOffendersModal] = useState(false);
  const [showOfficesModal, setShowOfficesModal] = useState(false);
  const [showWorkloadModal, setShowWorkloadModal] = useState(false);
  const [showRecidivismModal, setShowRecidivismModal] = useState(false);
  const [formStudent, setFormStudent] = useState('');
  const [formType, setFormType] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [recidivismStudent, setRecidivismStudent] = useState('');
  const [interventionSent, setInterventionSent] = useState({});

  // Derived from mock data
  const totalDisciplinary = 26;
  const totalAllIncidents = 124;
  const disciplinaryPct = ((totalDisciplinary / totalAllIncidents) * 100).toFixed(0);
  const repeatOffenders = reports
    .reduce((acc, r) => {
      acc[r.student_name] = (acc[r.student_name] || 0) + 1;
      return acc;
    }, {});
  const repeatOffenderList = Object.entries(repeatOffenders)
    .filter(([, count]) => count > 1)
    .map(([name]) => name);
  const officesList = [...new Set(
    cases.filter(c => c.assigned_to).map(c => c.assigned_to)
  )];
  const pendingList = reports.filter(r => r.status === 'pending');
  const recidivismResults = recidivismStudent
    ? reports.filter(r =>
        r.student_name.toLowerCase().includes(recidivismStudent.toLowerCase())
      )
    : [];

  const handleReportSubmit = async () => {
    if (!formStudent || !formType || !formDesc) return;
    setFormSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    mockStore.addReport({
      student_name: formStudent,
      teacher_name: 'OSAS Office',
      department: user?.department_name || 'OSAS',
      type: formType,
      severity: 'moderate',
      description: formDesc,
      date_submitted: formDate,
    });
    setFormSubmitting(false);
    setShowReportModal(false);
    setFormStudent('');
    setFormType('');
    setFormDesc('');
    setFormDate(new Date().toISOString().split('T')[0]);
  };

  const handleInterventionRequest = async (studentName) => {
    await new Promise(r => setTimeout(r, 400));
    setInterventionSent(prev => ({ ...prev, [studentName]: true }));
  };

  const criticalItems = reports.filter(r => r.severity === 'critical' || r.severity === 'high');
  const recentReports = [...reports].sort((a, b) => b.date_submitted.localeCompare(a.date_submitted)).slice(0, 4);

  const workloadByType = [
    { label: 'Behavioral', count: reports.filter(r => r.type === 'behavioral').length, color: '#f57f17', max: totalReports },
    { label: 'Disciplinary', count: reports.filter(r => r.type === 'disciplinary').length, color: '#c62828', max: totalReports },
    { label: 'Academic', count: reports.filter(r => r.type === 'academic').length, color: '#1565c0', max: totalReports },
    { label: 'Attendance', count: reports.filter(r => r.type === 'attendance').length, color: '#4527a0', max: totalReports },
  ];

  if (loading) return <div className="loading">Loading dashboard data...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {user?.first_name}!</h1>
        <p className="page-subtitle">Here is the institution-wide discipline overview.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon" style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}><FileText size={20} /></div>
          <div>
            <div className="stat-card__value">{totalReports}</div>
            <div className="stat-card__label">Total Reports</div>
            <div className="stat-card__sub" style={{ color: '#1565c0' }}>{pendingReports} pending review</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ backgroundColor: '#fce4ec', color: '#c62828' }}><AlertTriangle size={20} /></div>
          <div>
            <div className="stat-card__value">{criticalAlerts}</div>
            <div className="stat-card__label">Critical Alerts</div>
            <div className="stat-card__sub" style={{ color: '#c62828' }}>Requires immediate action</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ backgroundColor: '#ede7f6', color: '#4527a0' }}><ShieldAlert size={20} /></div>
          <div>
            <div className="stat-card__value">{openCases}</div>
            <div className="stat-card__label">Open Cases</div>
            <div className="stat-card__sub" style={{ color: '#4527a0' }}>{highPriority} high priority</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}><Clock size={20} /></div>
          <div>
            <div className="stat-card__value">{totalCases}</div>
            <div className="stat-card__label">Total Cases</div>
            <div className="stat-card__sub" style={{ color: '#2e7d32' }}>This period</div>
          </div>
        </div>
      </div>



      {criticalAlerts > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #c62828', marginBottom: 28 }}>
          <div className="card__title">
            <AlertTriangle size={16} color="#c62828" /> Critical Alerts
            <span className="count">{criticalAlerts}</span>
          </div>
          {criticalItems.slice(0, 3).map(item => (
            <div key={item.id} className="alert-item">
              <div className={`alert-icon ${item.severity === 'critical' ? 'alert-icon--critical' : 'alert-icon--high'}`}>
                {item.severity === 'critical' ? '!!' : '!'}
              </div>
              <div className="alert-info">
                <div className="alert-title">{item.student_name} - {item.type}</div>
                <div className="alert-meta">{item.teacher_name} · {item.department} · {item.description.slice(0, 80)}...</div>
              </div>
              <div className="alert-date">{item.date_submitted}</div>
            </div>
          ))}
        </div>
      )}

      <div className="workload-section">
        <h2 style={{ color: '#1a3a5c', fontSize: '1.05rem', fontWeight: 700, marginBottom: 14 }}>Workload Summary</h2>
        <div className="workload-grid">
          {workloadByType.map(w => (
            <div key={w.label} className="workload-card">
              <div className="workload-card__header">
                <span className="workload-card__label">{w.label}</span>
                <span className="workload-card__value">{w.count}</span>
              </div>
              <div className="workload-bar">
                <div className="workload-bar__fill" style={{ width: `${w.max > 0 ? (w.count / w.max) * 100 : 0}%`, backgroundColor: w.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overview-panels">
        <div className="card">
          <div className="card__title"><FileText size={16} color="#1a3a5c" /> Recent Reports</div>
          {recentReports.length > 0 ? recentReports.map(r => (
            <div key={r.id} className="report-item">
              <Avatar name={r.student_name} />
              <div className="report-item__info">
                <div className="report-item__name">{r.student_name}</div>
                <div className="report-item__meta">{r.department} · {r.teacher_name}</div>
                <div className="report-item__badges">
                  <span className={`badge badge--${r.severity}`}>{r.severity}</span>
                  <span className={`badge badge--${r.status}`}>{r.status}</span>
                </div>
              </div>
              <div className="report-item__date">{r.date_submitted}</div>
            </div>
          )) : <div className="empty-state">No reports yet.</div>}
        </div>
        <div className="card">
          <div className="card__title"><ShieldAlert size={16} color="#1a3a5c" /> Active Cases</div>
          {cases.filter(c => c.status !== 'closed').slice(0, 5).map(c => (
            <div key={c.id} className="report-item">
              <Avatar name={c.student_name} />
              <div className="report-item__info">
                <div className="report-item__name">{c.title}</div>
                <div className="report-item__meta">{c.student_name}{c.assigned_to ? ` · Assigned to: ${c.assigned_to}` : ''}</div>
                <div className="report-item__badges"><span className={`badge badge--${c.status}`}>{c.status}</span></div>
              </div>
              <div className="report-item__date">{c.last_update}</div>
            </div>
          ))}
          {cases.filter(c => c.status !== 'closed').length === 0 && <div className="empty-state">No active cases.</div>}
        </div>
      </div>

      {/* ── Modal: Report Incident ── */}
      {showReportModal && (
        <Modal onClose={() => setShowReportModal(false)}>
          <ModalHeader onClose={() => setShowReportModal(false)}>
            <Plus size={16} /> Report Disciplinary Incident
          </ModalHeader>
          <p className="modal__context">
            Submit a new disciplinary incident report to OSAS for processing.
          </p>
          <div className="form-group">
            <label className="form-label">Student Name</label>
            <select className="select" value={formStudent} onChange={e => setFormStudent(e.target.value)}>
              <option value="">-- Select student --</option>
              {ALL_STUDENTS.map(s => (
                <option key={s.id} value={s.name}>{s.name} ({s.studentId})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Incident Type</label>
            <select className="select" value={formType} onChange={e => setFormType(e.target.value)}>
              <option value="">-- Select type --</option>
              {INCIDENT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="textarea" value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={4} placeholder="Describe the incident..." />
          </div>
          <div className="form-group">
            <label className="form-label">Date of Incident</label>
            <input className="input" type="date" value={formDate} onChange={e => setFormDate(e.target.value)} style={{ maxWidth: '100%' }} />
          </div>
          <ModalActions>
            <button className="btn btn--outline" onClick={() => setShowReportModal(false)}>Cancel</button>
            <button className="btn" onClick={handleReportSubmit} disabled={!formStudent || !formType || !formDesc || formSubmitting}>
              {formSubmitting ? 'Submitting...' : 'Submit to OSAS'}
            </button>
          </ModalActions>
        </Modal>
      )}

      {/* ── Modal: Repeat Offenders ── */}
      {showOffendersModal && (
        <Modal onClose={() => setShowOffendersModal(false)} maxWidth={500}>
          <ModalHeader onClose={() => setShowOffendersModal(false)}>
            <Users size={16} /> Repeat Offenders
          </ModalHeader>
          <p className="modal__context">
            Students with multiple incident reports require intervention.
          </p>
          {repeatOffenderList.length === 0 ? (
            <div className="empty-state">No repeat offenders at this time.</div>
          ) : (
            repeatOffenderList.map(name => (
              <div key={name} className="modal__report-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{name}</strong>
                    <div className="text-muted">{repeatOffenders[name]} incident reports</div>
                  </div>
                  {interventionSent[name] ? (
                    <span className="badge badge--success">Intervention requested</span>
                  ) : (
                    <button className="btn btn--sm btn--warning" onClick={() => handleInterventionRequest(name)}>
                      <Send size={14} /> Request intervention
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          <ModalActions>
            <button className="btn" onClick={() => setShowOffendersModal(false)}>Close</button>
          </ModalActions>
        </Modal>
      )}

      {/* ── Modal: Offices Tracking ── */}
      {showOfficesModal && (
        <Modal onClose={() => setShowOfficesModal(false)} maxWidth={500}>
          <ModalHeader onClose={() => setShowOfficesModal(false)}>
            <Building2 size={16} /> Offices Tracking Incidents
          </ModalHeader>
          <p className="modal__context">
            These offices are currently handling active incident cases.
          </p>
          {officesList.length === 0 ? (
            <div className="empty-state">No offices are tracking cases this period.</div>
          ) : (
            officesList.map(office => {
              const officeCases = cases.filter(c => c.assigned_to === office);
              return (
                <div key={office} className="modal__report-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{office}</strong>
                      <div className="text-muted">{officeCases.length} active case{officeCases.length !== 1 ? 's' : ''}</div>
                    </div>
                    <span className={`badge badge--${officeCases.some(c => c.status === 'open') ? 'open' : 'closed'}`}>
                      {officeCases.some(c => c.status === 'open') ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <ModalActions>
            <button className="btn" onClick={() => setShowOfficesModal(false)}>Close</button>
          </ModalActions>
        </Modal>
      )}

      {/* ── Modal: Workload ── */}
      {showWorkloadModal && (
        <Modal onClose={() => setShowWorkloadModal(false)} maxWidth={560}>
          <ModalHeader onClose={() => setShowWorkloadModal(false)}>
            <Briefcase size={16} /> Teacher Workload — Pending Reports
          </ModalHeader>
          <p className="modal__context">
            Reports awaiting review and processing by OSAS.
          </p>
          {pendingList.length === 0 ? (
            <div className="empty-state">No pending reports. All caught up!</div>
          ) : (
            pendingList.map(r => (
              <div key={r.id} className="modal__report-item">
                <div className="modal__report-header">
                  <strong>{r.student_name}</strong>
                  <span className="badge badge--pending">{r.status}</span>
                </div>
                <div className="text-muted">{r.type} · {r.teacher_name} · {r.date_submitted}</div>
              </div>
            ))
          )}
          <ModalActions>
            <button className="btn" onClick={() => setShowWorkloadModal(false)}>Close</button>
          </ModalActions>
        </Modal>
      )}

      {/* ── Modal: Recidivism ── */}
      {showRecidivismModal && (
        <Modal onClose={() => setShowRecidivismModal(false)} maxWidth={500}>
          <ModalHeader onClose={() => setShowRecidivismModal(false)}>
            <TrendingUp size={16} /> Recidivism Check
          </ModalHeader>
          <p className="modal__context">
            Search for a student to see if they have past incident reports.
          </p>
          <div className="form-group">
            <label className="form-label">Search Student</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                type="text"
                value={recidivismStudent}
                onChange={e => setRecidivismStudent(e.target.value)}
                placeholder="Type student name..."
                style={{ flex: 1, maxWidth: '100%' }}
              />
              <button className="btn btn--sm" onClick={() => setRecidivismStudent(prev => prev)}>
                <Search size={16} />
              </button>
            </div>
          </div>
          {recidivismStudent && (
            <div style={{ marginTop: 8 }}>
              {recidivismResults.length === 0 ? (
                <div className="empty-state">No past incidents found for this student.</div>
              ) : (
                <>
                  <div className="modal__section-title">
                    {recidivismResults.length} past incident{recidivismResults.length !== 1 ? 's' : ''} found
                  </div>
                  {recidivismResults.map(r => (
                    <div key={r.id} className="modal__report-item">
                      <div className="modal__report-header">
                        <strong>{r.type}</strong>
                        <span className={`badge badge--${r.severity}`}>{r.severity}</span>
                      </div>
                      <p className="modal__report-desc">{r.description.slice(0, 100)}...</p>
                      <div className="text-muted">{r.date_submitted} · {r.teacher_name}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
          <ModalActions>
            <button className="btn" onClick={() => setShowRecidivismModal(false)}>Close</button>
          </ModalActions>
        </Modal>
      )}
    </div>
  );
}
