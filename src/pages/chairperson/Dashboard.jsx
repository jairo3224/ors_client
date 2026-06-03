import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStudents } from './hooks/useStudents';
import { useReports } from './hooks/useReports';
import { useCases } from './hooks/useCases';
import { useInbox } from './hooks/useInbox';
import { useChairpersonMutations } from './hooks/useChairperson';
import ChairpersonNavbar from './components/ChairpersonNavbar';
import Footer from '../../components/common/Footer';
import './components/Dashboard.css';

const FORWARD_OPTIONS = ['OSAS'];

function Avatar({ name }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return <div className="avatar">{initials}</div>;
}

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
              <div className="modal__id">{student.student_number} · {student.program}</div>
            </div>
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__details">
          <div className="modal__field">
            <span className="modal__label">Year Level</span>
            <span className="modal__value">{student.year_level}</span>
          </div>
          <div className="modal__field">
            <span className="modal__label">Status</span>
            <span className="modal__value">{student.status}</span>
          </div>
        </div>

        {studentReports.length > 0 && (
          <>
            <h4 className="modal__section-title">Reports ({studentReports.length})</h4>
            {studentReports.map(r => (
              <div key={r.id} className="modal__report-item">
                <div className="modal__report-header">
                  <strong>{r.subject}</strong>
                  <span className={`badge badge--${r.severity === 'medium' ? 'moderate' : r.severity}`}>{r.severity}</span>
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
              <div key={c.id} className={`modal__case-item priority--${c.priority}`}>
                <div className="modal__case-header">
                  <strong>{c.title}</strong>
                  <span className={`badge ${c.status === 'open' ? 'badge--open' : 'badge--referred'}`}>{c.status}</span>
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

export default function Dashboard() {
  const { user } = useAuth();
  const deptId = user?.department_id;

  const { students, loading: studentsLoading } = useStudents(deptId);
  const { reports, setReports, loading: reportsLoading } = useReports(deptId);
  const { cases, setCases, loading: casesLoading } = useCases(deptId);
  const { inbox, setInbox, loading: inboxLoading } = useInbox(deptId);
  const { addRemark, forwardToOSAS, respondToInbox } = useChairpersonMutations();

  const loading = studentsLoading || reportsLoading || casesLoading || inboxLoading;

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [remarkTarget, setRemarkTarget] = useState(null);
  const [forwardTarget, setForwardTarget] = useState(null);
  const [forwardType, setForwardType] = useState(null);

  const handleAddRemark = useCallback(async (reportId, text, authorName) => {
    try {
      await addRemark(reportId, text);
      // Optionally refetch or optimistically update
    } catch (err) {
      console.error(err);
    }
  }, [addRemark]);

  const handleForward = useCallback(async (itemId, destination, note, type) => {
    try {
      await forwardToOSAS(itemId, type, destination, note);
      // Optimistically update local state
      if (type === 'case') {
        setCases(prev => prev.map(c => c.id === itemId ? { ...c, status: 'referred' } : c));
      } else {
        setReports(prev => prev.map(r => r.id === itemId ? { ...r, status: 'forwarded' } : r));
      }
    } catch (err) {
      console.error(err);
    }
  }, [forwardToOSAS, setCases, setReports]);

  const handleInboxResponse = useCallback(async (referralId, responseText) => {
    try {
      await respondToInbox(referralId, responseText);
      setInbox(prev => prev.map(i => i.id === referralId ? { ...i, status: 'responded', response: responseText } : i));
    } catch (err) {
      console.error(err);
    }
  }, [respondToInbox, setInbox]);

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const openCaseCount = cases.filter(c => c.status === 'open').length;
  const inboxPendingCount = inbox.filter(i => i.status === 'pending').length;

  const outletContext = {
    students,
    reports,
    cases,
    inbox,
    loading,
    setSelectedStudent,
    setRemarkTarget,
    setForwardTarget,
    setForwardType,
    handleAddRemark,
    handleForward,
    handleInboxResponse,
    user,
  };

  return (
    <div className="dashboard">
      <ChairpersonNavbar
        pendingCount={pendingCount}
        openCaseCount={openCaseCount}
        inboxPendingCount={inboxPendingCount}
      />

      <main className="main-content">
        <Outlet context={outletContext} />
      </main>

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