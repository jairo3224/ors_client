/**
 * Chairperson / Department Head Dashboard
 *
 * TODO — API Integration Checklist (replace every mock with real fetch):
 *   1. fetchStudents()      → GET /api/chairperson/students?dept_id={id}
 *   2. fetchReports()       → GET /api/chairperson/reports?dept_id={id}
 *   3. fetchCases()         → GET /api/chairperson/cases?dept_id={id}
 *   4. addRemark()          → POST /api/chairperson/reports/{id}/remarks
 *   5. forwardCase()        → POST /api/chairperson/cases/{id}/forward
 *   6. updateCaseStatus()   → PATCH /api/chairperson/cases/{id}/status
 *
 * All fetch calls should include:
 *   headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Footer from '../../../components/common/Footer.jsx';


// ─── MOCK DATA (replace with real API calls) ────────────────────────────────

const MOCK_STUDENTS = [
  { id: 1, student_id: '2024-0001', first_name: 'Maria', last_name: 'Santos', year_level: '3rd Year', program: 'BS Computer Science', status: 'active', email: 'maria.santos@school.edu', phone: '09171234567', cases_count: 2 },
  { id: 2, student_id: '2024-0002', first_name: 'Juan', last_name: 'Dela Cruz', year_level: '2nd Year', program: 'BS Computer Science', status: 'active', email: 'juan.dc@school.edu', phone: '09181234567', cases_count: 0 },
  { id: 3, student_id: '2024-0003', first_name: 'Ana', last_name: 'Reyes', year_level: '4th Year', program: 'BS Information Technology', status: 'flagged', email: 'ana.reyes@school.edu', phone: '09191234567', cases_count: 4 },
  { id: 4, student_id: '2024-0004', first_name: 'Pedro', last_name: 'Lim', year_level: '1st Year', program: 'BS Computer Science', status: 'active', email: 'pedro.lim@school.edu', phone: '09201234567', cases_count: 1 },
  { id: 5, student_id: '2024-0005', first_name: 'Rosa', last_name: 'Garcia', year_level: '3rd Year', program: 'BS Information Technology', status: 'active', email: 'rosa.garcia@school.edu', phone: '09211234567', cases_count: 0 },
];

const MOCK_REPORTS = [
  { id: 1, student_id: 1, student_name: 'Maria Santos', teacher_name: 'Prof. Jose Rizal', subject: 'Data Structures', type: 'behavioral', severity: 'moderate', description: 'Student has been disruptive in class for the past two weeks. Multiple warnings issued.', date_submitted: '2025-05-20', status: 'pending', remarks: [] },
  { id: 2, student_id: 3, student_name: 'Ana Reyes', teacher_name: 'Prof. Andres Bonifacio', subject: 'Database Management', type: 'academic', severity: 'high', description: 'Student has missed 6 consecutive classes and failed to submit 3 major requirements.', date_submitted: '2025-05-22', status: 'reviewed', remarks: [{ author: 'Chair. M. Aquino', text: 'Forwarded to guidance for counseling.', date: '2025-05-23' }] },
  { id: 3, student_id: 1, student_name: 'Maria Santos', teacher_name: 'Prof. Emilio Aguinaldo', subject: 'Algorithms', type: 'behavioral', severity: 'low', description: 'Student arrived late 4 times this month.', date_submitted: '2025-05-24', status: 'pending', remarks: [] },
  { id: 4, student_id: 4, student_name: 'Pedro Lim', teacher_name: 'Prof. Jose Rizal', subject: 'Data Structures', type: 'disciplinary', severity: 'moderate', description: 'Suspected academic dishonesty during midterm examination.', date_submitted: '2025-05-25', status: 'forwarded', remarks: [] },
];

const MOCK_CASES = [
  { id: 1, student_id: 1, student_name: 'Maria Santos', title: 'Repeated Disruptive Behavior', type: 'behavioral', status: 'open', priority: 'medium', assigned_to: null, opened_date: '2025-05-20', last_update: '2025-05-20', notes: 'Consolidated from multiple teacher reports.' },
  { id: 2, student_id: 3, student_name: 'Ana Reyes', title: 'Academic Delinquency + Attendance', type: 'academic', status: 'referred', priority: 'high', assigned_to: 'Guidance Office', opened_date: '2025-05-18', last_update: '2025-05-23', notes: 'Referred to guidance. Awaiting counseling session.' },
  { id: 3, student_id: 4, student_name: 'Pedro Lim', title: 'Academic Dishonesty Investigation', type: 'disciplinary', status: 'open', priority: 'high', assigned_to: null, opened_date: '2025-05-25', last_update: '2025-05-25', notes: '' },
  { id: 4, student_id: 3, student_name: 'Ana Reyes', title: 'Family / Financial Concern', type: 'personal', status: 'referred', priority: 'high', assigned_to: 'OSAS', opened_date: '2025-05-15', last_update: '2025-05-19', notes: 'Student disclosed financial difficulties. Referred to OSAS for scholarship assistance.' },
];

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const FORWARD_OPTIONS = ['Guidance Office', 'Chaplain', 'OSAS'];

const SEVERITY_CONFIG = {
  low:      { bg: '#e8f5e9', color: '#2e7d32', label: 'Low' },
  moderate: { bg: '#fff8e1', color: '#f57f17', label: 'Moderate' },
  high:     { bg: '#fce4ec', color: '#c62828', label: 'High' },
};

const STATUS_CONFIG = {
  pending:   { bg: '#ede7f6', color: '#4527a0', label: 'Pending' },
  reviewed:  { bg: '#e3f2fd', color: '#1565c0', label: 'Reviewed' },
  forwarded: { bg: '#fff3e0', color: '#e65100', label: 'Forwarded' },
  open:      { bg: '#ede7f6', color: '#4527a0', label: 'Open' },
  referred:  { bg: '#fff3e0', color: '#e65100', label: 'Referred' },
  closed:    { bg: '#e8f5e9', color: '#2e7d32', label: 'Closed' },
};

const PRIORITY_CONFIG = {
  low:    { color: '#757575', label: 'Low' },
  medium: { color: '#f57f17', label: 'Medium' },
  high:   { color: '#c62828', label: 'High' },
};

// ─── STYLE UTILS ────────────────────────────────────────────────────────────

const S = {
  badge: (cfg) => ({
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 20,
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.03em',
    background: cfg.bg,
    color: cfg.color,
  }),
  card: {
    background: '#ffffff',
    borderRadius: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    border: '1px solid #e8edf2',
    padding: '20px 24px',
    marginBottom: 16,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  },
  th: {
    textAlign: 'left',
    padding: '10px 14px',
    background: '#f7f9fc',
    color: '#64748b',
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #e8edf2',
  },
  td: {
    padding: '12px 14px',
    borderBottom: '1px solid #f0f4f8',
    color: '#1a3a5c',
    verticalAlign: 'middle',
  },
  btn: (variant = 'primary') => ({
    padding: variant === 'sm' ? '6px 14px' : '10px 20px',
    borderRadius: 8,
    border: variant === 'outline' ? '1px solid #1a3a5c' : 'none',
    fontWeight: 600,
    fontSize: variant === 'sm' ? '0.78rem' : '0.875rem',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    background: variant === 'danger' ? '#c62828' : variant === 'outline' ? 'transparent' : '#1a3a5c',
    color: variant === 'outline' ? '#1a3a5c' : '#fff',
    fontFamily: 'inherit',
  }),
  input: {
    width: '100%',
    padding: '9px 14px',
    borderRadius: 8,
    border: '1px solid #d1dae6',
    fontSize: '0.875rem',
    color: '#1a3a5c',
    background: '#f7f9fc',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '9px 14px',
    borderRadius: 8,
    border: '1px solid #d1dae6',
    fontSize: '0.875rem',
    color: '#1a3a5c',
    background: '#f7f9fc',
    outline: 'none',
    resize: 'vertical',
    minHeight: 80,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  select: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #d1dae6',
    fontSize: '0.875rem',
    color: '#1a3a5c',
    background: '#f7f9fc',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(10,25,50,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modalBox: {
    background: '#fff',
    borderRadius: 16,
    padding: '28px 32px',
    width: '100%',
    maxWidth: 560,
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
  },
};

// ─── SUBCOMPONENTS ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div style={{ ...S.card, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 0 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: accent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a3a5c', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: accent, marginTop: 2, fontWeight: 600 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Avatar({ name }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ─── VIEWS ───────────────────────────────────────────────────────────────────

function OverviewView({ students, reports, cases }) {
  const flagged = students.filter(s => s.status === 'flagged').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const openCases = cases.filter(c => c.status === 'open').length;
  const highPriority = cases.filter(c => c.priority === 'high').length;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard icon="👥" label="Total Students" value={students.length} accent="#1a3a5c" />
        <StatCard icon="🚩" label="Flagged Students" value={flagged} sub={flagged > 0 ? 'Needs attention' : 'All clear'} accent={flagged > 0 ? '#c62828' : '#2e7d32'} />
        <StatCard icon="📄" label="Pending Reports" value={pendingReports} sub="Awaiting review" accent="#f57f17" />
        <StatCard icon="🗂️" label="Active Cases" value={openCases} sub={highPriority > 0 ? `${highPriority} high priority` : undefined} accent="#4527a0" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={S.card}>
          <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.95rem', marginBottom: 14 }}>Recent Reports</div>
          {reports.slice(0, 3).map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #f0f4f8' }}>
              <Avatar name={r.student_name} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1a3a5c' }}>{r.student_name}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{r.subject} · {r.teacher_name}</div>
                <div style={{ marginTop: 4 }}>
                  <span style={S.badge(SEVERITY_CONFIG[r.severity])}>{SEVERITY_CONFIG[r.severity].label}</span>
                  {' '}
                  <span style={S.badge(STATUS_CONFIG[r.status])}>{STATUS_CONFIG[r.status].label}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{r.date_submitted}</div>
            </div>
          ))}
        </div>

        <div style={S.card}>
          <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.95rem', marginBottom: 14 }}>Case Tracker</div>
          {cases.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid #f0f4f8' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_CONFIG[c.priority].color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.83rem', color: '#1a3a5c' }}>{c.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.student_name}</div>
              </div>
              <span style={S.badge(STATUS_CONFIG[c.status])}>{STATUS_CONFIG[c.status].label}</span>
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
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <input
          style={{ ...S.input, maxWidth: 280 }}
          placeholder="Search by name or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={S.select} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Students</option>
          <option value="active">Active</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              {['Student', 'ID', 'Year / Program', 'Status', 'Cases', 'Actions'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td style={S.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={`${s.first_name} ${s.last_name}`} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.first_name} {s.last_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.email}</div>
                    </div>
                  </div>
                </td>
                <td style={S.td}><span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{s.student_id}</span></td>
                <td style={S.td}>
                  <div style={{ fontWeight: 500, fontSize: '0.83rem' }}>{s.year_level}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.program}</div>
                </td>
                <td style={S.td}>
                  <span style={s.status === 'flagged' ? S.badge(SEVERITY_CONFIG.high) : S.badge({ bg: '#e8f5e9', color: '#2e7d32' })}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                </td>
                <td style={{ ...S.td, textAlign: 'center' }}>
                  <span style={{ fontWeight: 700, color: s.cases_count > 0 ? '#c62828' : '#2e7d32' }}>{s.cases_count}</span>
                </td>
                <td style={S.td}>
                  <button style={{ ...S.btn('sm') }} onClick={() => onViewStudent(s)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8' }}>No students found.</div>
        )}
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
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <input
          style={{ ...S.input, maxWidth: 260 }}
          placeholder="Search student or subject..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={S.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="forwarded">Forwarded</option>
        </select>
        <select style={S.select} value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
          <option value="all">All Severity</option>
          <option value="low">Low</option>
          <option value="moderate">Moderate</option>
          <option value="high">High</option>
        </select>
      </div>

      {filtered.map(report => (
        <div key={report.id} style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar name={report.student_name} />
              <div>
                <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.95rem' }}>{report.student_name}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{report.subject} · Reported by {report.teacher_name}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={S.badge(SEVERITY_CONFIG[report.severity])}>{SEVERITY_CONFIG[report.severity].label}</span>
              <span style={S.badge(STATUS_CONFIG[report.status])}>{STATUS_CONFIG[report.status].label}</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: 4 }}>{report.date_submitted}</span>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#334155', margin: '0 0 14px', lineHeight: 1.6 }}>{report.description}</p>

          {report.remarks.length > 0 && (
            <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: '0.78rem', color: '#1565c0', marginBottom: 6 }}>CHAIRPERSON REMARKS</div>
              {report.remarks.map((rem, i) => (
                <div key={i} style={{ fontSize: '0.83rem', color: '#1a3a5c', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{rem.author}</span>
                  <span style={{ color: '#64748b', marginLeft: 6, fontSize: '0.75rem' }}>{rem.date}</span>
                  <div style={{ marginTop: 2 }}>{rem.text}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={S.btn('sm')} onClick={() => onAddRemark(report)}>Add Remark</button>
            {report.status !== 'forwarded' && (
              <button style={{ ...S.btn('sm'), background: '#f57f17' }} onClick={() => onForward(report, 'report')}>
                Forward Case
              </button>
            )}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ ...S.card, textAlign: 'center', color: '#94a3b8', padding: 40 }}>No reports found.</div>
      )}
    </div>
  );
}

function CasesView({ cases, onForward, onUpdateStatus }) {
  const [filter, setFilter] = useState('all');

  const filtered = cases.filter(c => filter === 'all' || c.status === filter || c.priority === filter);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <select style={S.select} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Cases</option>
          <option value="open">Open</option>
          <option value="referred">Referred</option>
          <option value="closed">Closed</option>
          <option value="high">High Priority</option>
        </select>
      </div>

      {filtered.map(c => (
        <div key={c.id} style={{ ...S.card, borderLeft: `4px solid ${PRIORITY_CONFIG[c.priority].color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.95rem' }}>{c.title}</span>
                <span style={{ fontSize: '0.72rem', color: PRIORITY_CONFIG[c.priority].color, fontWeight: 700, textTransform: 'uppercase' }}>
                  ● {c.priority} priority
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                Student: {c.student_name} · Opened: {c.opened_date}
              </div>
            </div>
            <span style={S.badge(STATUS_CONFIG[c.status])}>{STATUS_CONFIG[c.status].label}</span>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}><strong>Type:</strong> {c.type.charAt(0).toUpperCase() + c.type.slice(1)}</span>
            {c.assigned_to && <span style={{ fontSize: '0.8rem', color: '#64748b' }}><strong>Referred to:</strong> {c.assigned_to}</span>}
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}><strong>Last update:</strong> {c.last_update}</span>
          </div>

          {c.notes && (
            <p style={{ fontSize: '0.83rem', color: '#334155', background: '#f7f9fc', padding: '8px 12px', borderRadius: 8, margin: '0 0 12px' }}>
              {c.notes}
            </p>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {c.status === 'open' && (
              <>
                <button style={{ ...S.btn('sm'), background: '#f57f17' }} onClick={() => onForward(c, 'case')}>
                  Refer to Office
                </button>
                <button style={{ ...S.btn('sm'), background: '#2e7d32' }} onClick={() => onUpdateStatus(c.id, 'closed')}>
                  Close Case
                </button>
              </>
            )}
            {c.status === 'referred' && (
              <button style={{ ...S.btn('sm'), background: '#2e7d32' }} onClick={() => onUpdateStatus(c.id, 'closed')}>
                Mark Resolved
              </button>
            )}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ ...S.card, textAlign: 'center', color: '#94a3b8', padding: 40 }}>No cases found.</div>
      )}
    </div>
  );
}

// ─── MODALS ──────────────────────────────────────────────────────────────────

function StudentModal({ student, reports, cases, onClose }) {
  if (!student) return null;
  const studentReports = reports.filter(r => r.student_id === student.id);
  const studentCases = cases.filter(c => c.student_id === student.id);

  return (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modalBox}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar name={`${student.first_name} ${student.last_name}`} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a3a5c' }}>{student.first_name} {student.last_name}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{student.student_id} · {student.program}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20, fontSize: '0.85rem' }}>
          {[
            { label: 'Year Level', value: student.year_level },
            { label: 'Status', value: student.status.charAt(0).toUpperCase() + student.status.slice(1) },
            { label: 'Email', value: student.email },
            { label: 'Phone', value: student.phone },
          ].map(f => (
            <div key={f.label} style={{ background: '#f7f9fc', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{f.label}</div>
              <div style={{ color: '#1a3a5c', fontWeight: 600 }}>{f.value}</div>
            </div>
          ))}
        </div>

        {studentReports.length > 0 && (
          <>
            <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.9rem', marginBottom: 10 }}>Reports ({studentReports.length})</div>
            {studentReports.map(r => (
              <div key={r.id} style={{ background: '#f7f9fc', borderRadius: 8, padding: '10px 14px', marginBottom: 8, fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{r.subject}</span>
                  <span style={S.badge(SEVERITY_CONFIG[r.severity])}>{r.severity}</span>
                </div>
                <div style={{ color: '#64748b' }}>{r.description}</div>
              </div>
            ))}
          </>
        )}

        {studentCases.length > 0 && (
          <>
            <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.9rem', margin: '14px 0 10px' }}>Cases ({studentCases.length})</div>
            {studentCases.map(c => (
              <div key={c.id} style={{ background: '#f7f9fc', borderRadius: 8, padding: '10px 14px', marginBottom: 8, fontSize: '0.82rem', borderLeft: `3px solid ${PRIORITY_CONFIG[c.priority].color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>{c.title}</span>
                  <span style={S.badge(STATUS_CONFIG[c.status])}>{c.status}</span>
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
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modalBox}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1a3a5c' }}>Add Remark</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8' }}>✕</button>
        </div>
        <div style={{ background: '#f7f9fc', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.83rem', color: '#334155' }}>
          <strong>{report.student_name}</strong> · {report.subject} · {report.teacher_name}
        </div>
        <textarea
          style={S.textarea}
          placeholder="Enter your assessment or remark..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
          <button style={S.btn('outline')} onClick={onClose}>Cancel</button>
          <button
            style={{ ...S.btn(), opacity: !text.trim() ? 0.5 : 1 }}
            disabled={!text.trim()}
            onClick={() => { onSubmit(report.id, text, chairpersonName); onClose(); }}
          >
            Submit Remark
          </button>
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
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modalBox}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1a3a5c' }}>Refer / Forward {type === 'case' ? 'Case' : 'Report'}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8' }}>✕</button>
        </div>

        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Forward to</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          {FORWARD_OPTIONS.map(opt => (
            <button
              key={opt}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: `2px solid ${destination === opt ? '#1a3a5c' : '#d1dae6'}`,
                background: destination === opt ? '#1a3a5c' : '#f7f9fc',
                color: destination === opt ? '#fff' : '#1a3a5c',
                fontWeight: 600,
                fontSize: '0.83rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              onClick={() => setDestination(opt)}
            >
              {opt}
            </button>
          ))}
        </div>

        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Referral Note (optional)</div>
        <textarea
          style={S.textarea}
          placeholder="Add context or instructions for the receiving office..."
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
          <button style={S.btn('outline')} onClick={onClose}>Cancel</button>
          <button
            style={{ ...S.btn(), background: '#f57f17', opacity: !destination ? 0.5 : 1 }}
            disabled={!destination}
            onClick={() => { onSubmit(item.id, destination, note, type); onClose(); }}
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview',  icon: '📊' },
  { key: 'students', label: 'Students',  icon: '👥' },
  { key: 'reports',  label: 'Reports',   icon: '📄' },
  { key: 'cases',    label: 'Cases',     icon: '🗂️' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState('overview');
  const [students, setStudents]     = useState([]);
  const [reports, setReports]       = useState([]);
  const [cases, setCases]           = useState([]);
  const [loading, setLoading]       = useState(true);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [remarkTarget, setRemarkTarget]       = useState(null);
  const [forwardTarget, setForwardTarget]     = useState(null);
  const [forwardType, setForwardType]         = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // TODO: Replace with real API calls
        // const deptId = user.department_id;
        // const token  = user.token;
        // const [sRes, rRes, cRes] = await Promise.all([
        //   fetch(`/api/chairperson/students?dept_id=${deptId}`, { headers: { Authorization: `Bearer ${token}` } }),
        //   fetch(`/api/chairperson/reports?dept_id=${deptId}`,  { headers: { Authorization: `Bearer ${token}` } }),
        //   fetch(`/api/chairperson/cases?dept_id=${deptId}`,    { headers: { Authorization: `Bearer ${token}` } }),
        // ]);
        // setStudents(await sRes.json());
        // setReports(await rRes.json());
        // setCases(await cRes.json());

        await new Promise(r => setTimeout(r, 400));
        setStudents(MOCK_STUDENTS);
        setReports(MOCK_REPORTS);
        setCases(MOCK_CASES);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleAddRemark = useCallback(async (reportId, text, authorName) => {
    // TODO: POST /api/chairperson/reports/{reportId}/remarks
    const today = new Date().toISOString().split('T')[0];
    setReports(prev => prev.map(r => r.id === reportId
      ? { ...r, status: 'reviewed', remarks: [...r.remarks, { author: authorName, text, date: today }] }
      : r
    ));
  }, []);

  const handleForward = useCallback(async (itemId, destination, note, type) => {
    // TODO: POST /api/chairperson/{cases|reports}/{itemId}/forward
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
    // TODO: PATCH /api/chairperson/cases/{caseId}/status
    setCases(prev => prev.map(c => c.id === caseId
      ? { ...c, status: newStatus, last_update: new Date().toISOString().split('T')[0] }
      : c
    ));
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const chairpersonName = `${user?.first_name} ${user?.last_name}`;
  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const openCaseCount = cases.filter(c => c.status === 'open').length;

  return (
  <div
    style={{
      minHeight: '100dvh',
      background: '#f0f4f8',
      fontFamily: 'DM Sans, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div style={{ flexGrow: 1, display: 'flex' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, background: '#1a3a5c', minHeight: '100dvh', padding: '28px 0',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ padding: '0 22px 28px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>
            {user?.department_name || 'Department'}
          </div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginTop: 4, lineHeight: 1.3 }}>
            Chairperson Portal
          </div>
        </div>

        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveView(item.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                textAlign: 'left', fontFamily: 'inherit',
                background: activeView === item.key ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: activeView === item.key ? '#fff' : 'rgba(255,255,255,0.6)',
                fontWeight: activeView === item.key ? 700 : 400,
                fontSize: '0.875rem', marginBottom: 4,
              }}
            >
              <span>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.key === 'reports' && pendingCount > 0 && (
                <span style={{ background: '#ef4444', color: '#fff', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px' }}>
                  {pendingCount}
                </span>
              )}
              {item.key === 'cases' && openCaseCount > 0 && (
                <span style={{ background: '#f59e0b', color: '#fff', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px' }}>
                  {openCaseCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 22px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>{user?.role_name}</div>
          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem' }}>{chairpersonName}</div>
          <button
            onClick={handleLogout}
            style={{ marginTop: 12, width: '100%', padding: '8px', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit' }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, padding: '32px 36px', overflowX: 'hidden' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ color: '#1a3a5c', margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>
            {NAV_ITEMS.find(n => n.key === activeView)?.icon}{' '}
            {NAV_ITEMS.find(n => n.key === activeView)?.label}
          </h1>
          <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>
            {user?.department_name} ·{' '}
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>Loading department data...</div>
        ) : (
          <>
            {activeView === 'overview' && <OverviewView students={students} reports={reports} cases={cases} />}
            {activeView === 'students' && <StudentsView students={students} onViewStudent={setSelectedStudent} />}
            {activeView === 'reports'  && (
              <ReportsView
                reports={reports}
                onAddRemark={setRemarkTarget}
                onForward={(item, type) => { setForwardTarget(item); setForwardType(type); }}
              />
            )}
            {activeView === 'cases' && (
              <CasesView
                cases={cases}
                onForward={(item, type) => { setForwardTarget(item); setForwardType(type); }}
                onUpdateStatus={handleUpdateCaseStatus}
              />
            )}
          </>
        )}
      </main>

      {/* ── Modals ── */}
      <StudentModal student={selectedStudent} reports={reports} cases={cases} onClose={() => setSelectedStudent(null)} />
      <RemarkModal report={remarkTarget} onClose={() => setRemarkTarget(null)} onSubmit={handleAddRemark} chairpersonName={`Chair. ${user?.last_name}`} />
      <ForwardModal
        item={forwardTarget}
        type={forwardType}
        onClose={() => { setForwardTarget(null); setForwardType(null); }}
        onSubmit={handleForward}
      />
      </div>
      <Footer />
    </div>
  );
}