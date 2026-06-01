import { useState, useEffect, useCallback } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChairpersonNavbar from './components/ChairpersonNavbar';
import Footer from '../../components/common/Footer';
import './components/Dashboard.css';

// ─── MOCK DATA ────────────────────────────────────────────────────────
const MOCK_STUDENTS = [
  { id: 1, student_id: '2024-0001', first_name: 'Maria', last_name: 'Santos', year_level: '3rd Year', program: 'BS Computer Science', status: 'active', email: 'maria.santos@school.edu', phone: '09171234567', cases_count: 2 },
  { id: 2, student_id: '2024-0002', first_name: 'Juan', last_name: 'Dela Cruz', year_level: '2nd Year', program: 'BS Computer Science', status: 'active', email: 'juan.dc@school.edu', phone: '09181234567', cases_count: 0 },
  { id: 3, student_id: '2024-0003', first_name: 'Ana', last_name: 'Reyes', year_level: '4th Year', program: 'BS Information Technology', status: 'flagged', email: 'ana.reyes@school.edu', phone: '09191234567', cases_count: 4 },
  { id: 4, student_id: '2024-0004', first_name: 'Pedro', last_name: 'Lim', year_level: '1st Year', program: 'BS Computer Science', status: 'active', email: 'pedro.lim@school.edu', phone: '09201234567', cases_count: 1 },
  { id: 5, student_id: '2024-0005', first_name: 'Rosa', last_name: 'Garcia', year_level: '3rd Year', program: 'BS Information Technology', status: 'active', email: 'rosa.garcia@school.edu', phone: '09211234567', cases_count: 0 },
];

const MOCK_REPORTS = [
  { id: 1, student_id: 1, student_name: 'Maria Santos', teacher_name: 'Prof. Jose Rizal', subject: 'Data Structures', type: 'behavioral', severity: 'moderate', description: 'Student has been disruptive in class for the past two weeks.', date_submitted: '2025-05-20', status: 'pending', remarks: [] },
  { id: 2, student_id: 3, student_name: 'Ana Reyes', teacher_name: 'Prof. Andres Bonifacio', subject: 'Database Management', type: 'academic', severity: 'high', description: 'Missed 6 classes and failed to submit 3 major requirements.', date_submitted: '2025-05-22', status: 'reviewed', remarks: [{ author: 'Chair. M. Aquino', text: 'Forwarded to guidance.', date: '2025-05-23' }] },
  { id: 3, student_id: 1, student_name: 'Maria Santos', teacher_name: 'Prof. Emilio Aguinaldo', subject: 'Algorithms', type: 'behavioral', severity: 'low', description: 'Late 4 times this month.', date_submitted: '2025-05-24', status: 'pending', remarks: [] },
  { id: 4, student_id: 4, student_name: 'Pedro Lim', teacher_name: 'Prof. Jose Rizal', subject: 'Data Structures', type: 'disciplinary', severity: 'moderate', description: 'Suspected academic dishonesty during midterm exam.', date_submitted: '2025-05-25', status: 'forwarded', remarks: [] },
];

const MOCK_CASES = [
  { id: 1, student_id: 1, student_name: 'Maria Santos', title: 'Repeated Disruptive Behavior', type: 'behavioral', status: 'open', priority: 'medium', assigned_to: null, opened_date: '2025-05-20', last_update: '2025-05-20', notes: 'Multiple teacher reports.' },
  { id: 2, student_id: 3, student_name: 'Ana Reyes', title: 'Academic Delinquency + Attendance', type: 'academic', status: 'referred', priority: 'high', assigned_to: 'Guidance Office', opened_date: '2025-05-18', last_update: '2025-05-23', notes: 'Referred to guidance.' },
  { id: 3, student_id: 4, student_name: 'Pedro Lim', title: 'Academic Dishonesty Investigation', type: 'disciplinary', status: 'open', priority: 'high', assigned_to: null, opened_date: '2025-05-25', last_update: '2025-05-25', notes: '' },
  { id: 4, student_id: 3, student_name: 'Ana Reyes', title: 'Family / Financial Concern', type: 'personal', status: 'referred', priority: 'high', assigned_to: 'OSAS', opened_date: '2025-05-15', last_update: '2025-05-19', notes: 'Financial difficulties – referred to OSAS for scholarship.' },
];

const FORWARD_OPTIONS = ['Guidance Office', 'Chaplain', 'OSAS'];

const SEVERITY_CLASS = {
  low: 'badge--low',
  moderate: 'badge--moderate',
  high: 'badge--high',
};

const STATUS_CLASS = {
  pending: 'badge--pending',
  reviewed: 'badge--reviewed',
  forwarded: 'badge--forwarded',
  open: 'badge--open',
  referred: 'badge--referred',
  closed: 'badge--closed',
};

const PRIORITY_CLASS = {
  low: 'priority--low',
  medium: 'priority--medium',
  high: 'priority--high',
};

// ─── SUBCOMPONENTS ────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon" style={{ backgroundColor: accent + '22', color: accent }}>
        {icon}
      </div>
      <div>
        <div className="stat-card__value">{value}</div>
        <div className="stat-card__label">{label}</div>
        {sub && <div className="stat-card__sub" style={{ color: accent }}>{sub}</div>}
      </div>
    </div>
  );
}

function Avatar({ name }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return <div className="avatar">{initials}</div>;
}

function OverviewView({ students, reports, cases }) {
  const flagged = students.filter(s => s.status === 'flagged').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const openCases = cases.filter(c => c.status === 'open').length;
  const highPriority = cases.filter(c => c.priority === 'high').length;

  return (
    <div>
      <div className="stats-grid">
        <StatCard icon="👥" label="Total Students" value={students.length} accent="#1a3a5c" />
        <StatCard icon="🚩" label="Flagged Students" value={flagged} sub={flagged ? 'Needs attention' : 'All clear'} accent={flagged ? '#c62828' : '#2e7d32'} />
        <StatCard icon="📄" label="Pending Reports" value={pendingReports} sub="Awaiting review" accent="#f57f17" />
        <StatCard icon="🗂️" label="Active Cases" value={openCases} sub={highPriority ? `${highPriority} high priority` : undefined} accent="#4527a0" />
      </div>

      <div className="overview-panels">
        <div className="card">
          <h3 className="card__title">Recent Reports</h3>
          {reports.slice(0, 3).map(r => (
            <div key={r.id} className="report-item">
              <Avatar name={r.student_name} />
              <div className="report-item__info">
                <div className="report-item__name">{r.student_name}</div>
                <div className="report-item__meta">{r.subject} · {r.teacher_name}</div>
                <div className="report-item__badges">
                  <span className={`badge ${SEVERITY_CLASS[r.severity]}`}>{r.severity}</span>
                  <span className={`badge ${STATUS_CLASS[r.status]}`}>{r.status}</span>
                </div>
              </div>
              <div className="report-item__date">{r.date_submitted}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 className="card__title">Case Tracker</h3>
          {cases.map(c => (
            <div key={c.id} className="case-item">
              <span className={`priority-dot ${PRIORITY_CLASS[c.priority]}`} />
              <div className="case-item__info">
                <div className="case-item__title">{c.title}</div>
                <div className="case-item__student">{c.student_name}</div>
              </div>
              <span className={`badge ${STATUS_CLASS[c.status]}`}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudentsView({ students, onViewStudent }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = students.filter(s => {
    const matchSearch = `${s.first_name} ${s.last_name} ${s.student_id}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || s.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div className="filters">
        <input
          className="input"
          placeholder="Search by name or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Students</option>
          <option value="active">Active</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      <div className="card table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th><th>ID</th><th>Year / Program</th><th>Status</th><th>Cases</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td>
                  <div className="student-cell">
                    <Avatar name={`${s.first_name} ${s.last_name}`} />
                    <div>
                      <div className="student-name">{s.first_name} {s.last_name}</div>
                      <div className="student-email">{s.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="mono">{s.student_id}</span></td>
                <td>
                  <div>{s.year_level}</div>
                  <div className="text-muted">{s.program}</div>
                </td>
                <td>
                  <span className={`badge ${s.status === 'flagged' ? 'badge--high' : 'badge--active'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="text-center">
                  <span className={`case-count ${s.cases_count > 0 ? 'text-danger' : 'text-success'}`}>
                    {s.cases_count}
                  </span>
                </td>
                <td>
                  <button className="btn btn--sm" onClick={() => onViewStudent(s)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">No students found.</div>}
      </div>
    </div>
  );
}

function ReportsView({ reports, onAddRemark, onForward }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  const filtered = reports.filter(r => {
    const matchSearch = r.student_name.toLowerCase().includes(search.toLowerCase()) || r.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchSev = filterSeverity === 'all' || r.severity === filterSeverity;
    return matchSearch && matchStatus && matchSev;
  });

  return (
    <div>
      <div className="filters">
        <input className="input" placeholder="Search student or subject..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="forwarded">Forwarded</option>
        </select>
        <select className="select" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
          <option value="all">All Severity</option>
          <option value="low">Low</option>
          <option value="moderate">Moderate</option>
          <option value="high">High</option>
        </select>
      </div>

      {filtered.map(report => (
        <div key={report.id} className="card report-card">
          <div className="report-card__header">
            <div className="report-card__student">
              <Avatar name={report.student_name} />
              <div>
                <div className="report-card__name">{report.student_name}</div>
                <div className="report-card__meta">{report.subject} · Reported by {report.teacher_name}</div>
              </div>
            </div>
            <div className="report-card__labels">
              <span className={`badge ${SEVERITY_CLASS[report.severity]}`}>{report.severity}</span>
              <span className={`badge ${STATUS_CLASS[report.status]}`}>{report.status}</span>
              <span className="report-card__date">{report.date_submitted}</span>
            </div>
          </div>

          <p className="report-card__desc">{report.description}</p>

          {report.remarks.length > 0 && (
            <div className="remarks-box">
              <div className="remarks-box__heading">CHAIRPERSON REMARKS</div>
              {report.remarks.map((rem, i) => (
                <div key={i} className="remark-item">
                  <span className="remark-item__author">{rem.author}</span>
                  <span className="remark-item__date">{rem.date}</span>
                  <div className="remark-item__text">{rem.text}</div>
                </div>
              ))}
            </div>
          )}

          <div className="report-card__actions">
            <button className="btn btn--sm" onClick={() => onAddRemark(report)}>Add Remark</button>
            {report.status !== 'forwarded' && (
              <button className="btn btn--sm btn--warning" onClick={() => onForward(report, 'report')}>Forward Case</button>
            )}
          </div>
        </div>
      ))}
      {filtered.length === 0 && <div className="card empty-state">No reports found.</div>}
    </div>
  );
}

function CasesView({ cases, onForward, onUpdateStatus }) {
  const [filter, setFilter] = useState('all');
  const filtered = cases.filter(c => filter === 'all' || c.status === filter || c.priority === filter);

  return (
    <div>
      <div className="filters">
        <select className="select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Cases</option>
          <option value="open">Open</option>
          <option value="referred">Referred</option>
          <option value="closed">Closed</option>
          <option value="high">High Priority</option>
        </select>
      </div>

      {filtered.map(c => (
        <div key={c.id} className={`card case-card ${PRIORITY_CLASS[c.priority]}`}>
          <div className="case-card__header">
            <div>
              <span className="case-card__title">{c.title}</span>
              <span className={`priority-label ${PRIORITY_CLASS[c.priority]}`}>● {c.priority} priority</span>
            </div>
            <span className={`badge ${STATUS_CLASS[c.status]}`}>{c.status}</span>
          </div>

          <div className="case-card__meta">
            <span><strong>Type:</strong> {c.type}</span>
            {c.assigned_to && <span><strong>Referred to:</strong> {c.assigned_to}</span>}
            <span><strong>Last update:</strong> {c.last_update}</span>
          </div>

          {c.notes && <p className="case-card__notes">{c.notes}</p>}

          <div className="case-card__actions">
            {c.status === 'open' && (
              <>
                <button className="btn btn--sm btn--warning" onClick={() => onForward(c, 'case')}>Refer to Office</button>
                <button className="btn btn--sm btn--success" onClick={() => onUpdateStatus(c.id, 'closed')}>Close Case</button>
              </>
            )}
            {c.status === 'referred' && (
              <button className="btn btn--sm btn--success" onClick={() => onUpdateStatus(c.id, 'closed')}>Mark Resolved</button>
            )}
          </div>
        </div>
      ))}
      {filtered.length === 0 && <div className="card empty-state">No cases found.</div>}
    </div>
  );
}

// ─── MODALS ────────────────────────────────────────────────────────────────
function StudentModal({ student, reports, cases, onClose }) {
  if (!student) return null;
  const studentReports = reports.filter(r => r.student_id === student.id);
  const studentCases = cases.filter(c => c.student_id === student.id);

  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal__box">
        <div className="modal__header">
          <div className="modal__student">
            <Avatar name={`${student.first_name} ${student.last_name}`} />
            <div>
              <div className="modal__name">{student.first_name} {student.last_name}</div>
              <div className="modal__id">{student.student_id} · {student.program}</div>
            </div>
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__details">
          {['Year Level', 'Status', 'Email', 'Phone'].map(label => {
            const key = label.toLowerCase().replace(' ', '_');
            const value = student[key];
            return (
              <div key={label} className="modal__field">
                <span className="modal__label">{label}</span>
                <span className="modal__value">{value}</span>
              </div>
            );
          })}
        </div>

        {studentReports.length > 0 && (
          <>
            <h4 className="modal__section-title">Reports ({studentReports.length})</h4>
            {studentReports.map(r => (
              <div key={r.id} className="modal__report-item">
                <div className="modal__report-header">
                  <strong>{r.subject}</strong>
                  <span className={`badge ${SEVERITY_CLASS[r.severity]}`}>{r.severity}</span>
                </div>
                <p className="modal__report-desc">{r.description}</p>
              </div>
            ))}
          </>
        )}

        {studentCases.length > 0 && (
          <>
            <h4 className="modal__section-title">Cases ({studentCases.length})</h4>
            {studentCases.map(c => (
              <div key={c.id} className={`modal__case-item ${PRIORITY_CLASS[c.priority]}`}>
                <div className="modal__case-header">
                  <strong>{c.title}</strong>
                  <span className={`badge ${STATUS_CLASS[c.status]}`}>{c.status}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function RemarkModal({ report, onClose, onSubmit, chairpersonName }) {
  const [text, setText] = useState('');
  if (!report) return null;

  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal__box">
        <div className="modal__header">
          <h3>Add Remark</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="modal__context">
          <strong>{report.student_name}</strong> · {report.subject} · {report.teacher_name}
        </div>
        <textarea className="textarea" placeholder="Enter your assessment or remark..." value={text} onChange={e => setText(e.target.value)} />
        <div className="modal__actions">
          <button className="btn btn--outline" onClick={onClose}>Cancel</button>
          <button className="btn" disabled={!text.trim()} onClick={() => { onSubmit(report.id, text, chairpersonName); onClose(); }}>Submit Remark</button>
        </div>
      </div>
    </div>
  );
}

function ForwardModal({ item, type, onClose, onSubmit }) {
  const [destination, setDestination] = useState('');
  const [note, setNote] = useState('');
  if (!item) return null;

  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal__box">
        <div className="modal__header">
          <h3>Refer / Forward {type === 'case' ? 'Case' : 'Report'}</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="form-group">
          <label className="form-label">Forward to</label>
          <div className="forward-options">
            {FORWARD_OPTIONS.map(opt => (
              <button
                key={opt}
                className={`forward-option ${destination === opt ? 'forward-option--selected' : ''}`}
                onClick={() => setDestination(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Referral Note (optional)</label>
          <textarea className="textarea" placeholder="Add context or instructions..." value={note} onChange={e => setNote(e.target.value)} />
        </div>

        <div className="modal__actions">
          <button className="btn btn--outline" onClick={onClose}>Cancel</button>
          <button className="btn btn--warning" disabled={!destination} onClick={() => { onSubmit(item.id, destination, note, type); onClose(); }}>Forward</button>
        </div>
      </div>
    </div>
  );
}

// ─── HOOK: useChairpersonContext ──────────────────────────────────────
export function useChairpersonContext() {
  return useOutletContext();
}

// ─── PAGE COMPONENTS (for nested routes) ──────────────────────────────
export function OverviewPage() {
  const { students, reports, cases, loading } = useChairpersonContext();

  if (loading) return <div className="loading">Loading department data...</div>;
  return <OverviewView students={students} reports={reports} cases={cases} />;
}

export function StudentsPage() {
  const { students, setSelectedStudent, loading } = useChairpersonContext();

  if (loading) return <div className="loading">Loading department data...</div>;
  return <StudentsView students={students} onViewStudent={setSelectedStudent} />;
}

export function ReportsPage() {
  const { reports, setRemarkTarget, setForwardTarget, setForwardType, loading } = useChairpersonContext();

  if (loading) return <div className="loading">Loading department data...</div>;
  return (
    <ReportsView
      reports={reports}
      onAddRemark={setRemarkTarget}
      onForward={(item, type) => { setForwardTarget(item); setForwardType(type); }}
    />
  );
}

export function CasesPage() {
  const { cases, setForwardTarget, setForwardType, handleUpdateCaseStatus, loading } = useChairpersonContext();

  if (loading) return <div className="loading">Loading department data...</div>;
  return (
    <CasesView
      cases={cases}
      onForward={(item, type) => { setForwardTarget(item); setForwardType(type); }}
      onUpdateStatus={handleUpdateCaseStatus}
    />
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();

  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [remarkTarget, setRemarkTarget] = useState(null);
  const [forwardTarget, setForwardTarget] = useState(null);
  const [forwardType, setForwardType] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // TODO: replace with API
        await new Promise(r => setTimeout(r, 400));
        setStudents(MOCK_STUDENTS);
        setReports(MOCK_REPORTS);
        setCases(MOCK_CASES);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddRemark = useCallback(async (reportId, text, authorName) => {
    const today = new Date().toISOString().split('T')[0];
    setReports(prev => prev.map(r => r.id === reportId
      ? { ...r, status: 'reviewed', remarks: [...r.remarks, { author: authorName, text, date: today }] }
      : r
    ));
  }, []);

  const handleForward = useCallback(async (itemId, destination, note, type) => {
    if (type === 'case') {
      setCases(prev => prev.map(c => c.id === itemId
        ? { ...c, status: 'referred', assigned_to: destination, last_update: new Date().toISOString().split('T')[0] }
        : c
      ));
    } else {
      setReports(prev => prev.map(r => r.id === itemId ? { ...r, status: 'forwarded' } : r));
    }
  }, []);

  const handleUpdateCaseStatus = useCallback(async (caseId, newStatus) => {
    setCases(prev => prev.map(c => c.id === caseId
      ? { ...c, status: newStatus, last_update: new Date().toISOString().split('T')[0] }
      : c
    ));
  }, []);

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const openCaseCount = cases.filter(c => c.status === 'open').length;

  const outletContext = {
    students,
    reports,
    cases,
    loading,
    setSelectedStudent,
    setRemarkTarget,
    setForwardTarget,
    setForwardType,
    handleAddRemark,
    handleForward,
    handleUpdateCaseStatus,
    user,
  };

  return (
    <div className="dashboard">
      <ChairpersonNavbar pendingCount={pendingCount} openCaseCount={openCaseCount} />

      <main className="main-content">
        <Outlet context={outletContext} />
      </main>

      {/* Globally accessible modals */}
      <StudentModal
        student={selectedStudent}
        reports={reports}
        cases={cases}
        onClose={() => setSelectedStudent(null)}
      />
      <RemarkModal
        report={remarkTarget}
        onClose={() => setRemarkTarget(null)}
        onSubmit={handleAddRemark}
        chairpersonName={`Chair. ${user?.last_name || 'Aquino'}`}
      />
      <ForwardModal
        item={forwardTarget}
        type={forwardType}
        onClose={() => { setForwardTarget(null); setForwardType(null); }}
        onSubmit={handleForward}
      />

      <Footer />
    </div>
  );
}