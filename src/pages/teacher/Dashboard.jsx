import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from './components/Navbar';
import ClassesView from './components/ClassesView';
import RosterView from './components/RosterView';
import ReportView from './components/ReportView';
import ReportsView from './components/ReportsView';
import SearchView from './components/SearchView';
import Footer from '../../components/common/Footer';
import './Dashboard.css';

// ─── MOCK DATA ────────────────────────────────────────────────────────
const MOCK_INCIDENTS = [
  { id: 1, student_name: 'Juan Dela Cruz', incident_type: 'Attendance Issue', urgency_level: 'Medium', current_status: 'reported', description: 'Student has been absent for 5 consecutive sessions in Data Structures class without any excuse letter.', date_reported: '2026-05-28' },
  { id: 2, student_name: 'Maria Santos', incident_type: 'Cheating', urgency_level: 'High', current_status: 'reviewed', description: 'Caught copying code from an online source during the Web Development midterm exam. Source code matched published GitHub repository.', date_reported: '2026-05-25' },
  { id: 3, student_name: 'Carlos Garcia', incident_type: 'Disrespectful Behavior', urgency_level: 'Low', current_status: 'pending', description: 'Used phone during lecture and refused to put it away when asked by the instructor.', date_reported: '2026-05-29' },
  { id: 4, student_name: 'Anna Lopez', incident_type: 'Bullying', urgency_level: 'Critical', current_status: 'forwarded', description: 'Reported by classmates for repeatedly insulting and intimidating a freshman during group projects.', date_reported: '2026-05-22' },
  { id: 5, student_name: 'Miguel Reyes', incident_type: 'Other', urgency_level: 'Low', current_status: 'dismissed', description: 'Submitted a lab exercise late due to a personal conflict. Issue was resolved after speaking with the student.', date_reported: '2026-05-20' },
  { id: 6, student_name: 'Diego Tan', incident_type: 'Physical Altercation', urgency_level: 'High', current_status: 'reported', description: 'Involved in a shouting match with a classmate in the CS lab over computer station usage.', date_reported: '2026-05-30' },
  { id: 7, student_name: 'Isabella Chua', incident_type: 'Attendance Issue', urgency_level: 'Low', current_status: 'resolved', description: 'Missed 3 lab sessions due to medical reasons. Presented a valid medical certificate and caught up with missed work.', date_reported: '2026-05-18' },
];

function SuccessBanner({ onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="success-banner" onClick={onDismiss}>
      ✓ Incident report submitted successfully.
    </div>
  );
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('classes');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [reportStudent, setReportStudent] = useState(null);
  const [myIncidents, setMyIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => { loadMyIncidents(); }, []);

  const loadMyIncidents = async () => {
    setLoading(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 400));
    setMyIncidents(MOCK_INCIDENTS);
    setLoading(false);
  };

  const handleNavigate = (view, options = {}) => {
    if (options.resetSubject) {
      setSelectedSubject(null);
      setActiveView('classes');
    } else {
      setActiveView(view);
    }
  };

  const handleSelectSubject = (sub) => {
    setSelectedSubject(sub);
    setActiveView('roster');
  };

  const handleReportStudent = (student) => {
    setReportStudent(student);
    setActiveView('report');
  };

  const pendingCount = myIncidents.filter(i => i.current_status === 'reported').length;

  return (
    <div className="dashboard-body">
      {showSuccess && <SuccessBanner onDismiss={() => setShowSuccess(false)} />}

      <Navbar
        activeView={activeView}
        pendingCount={pendingCount}
        onNavigate={handleNavigate}
      />

      <main className="main-content">
        <div className="page-header">
          <h1>
            {activeView === 'classes' && '📚 My Classes'}
            {activeView === 'roster' && '📚 Class Roster'}
            {activeView === 'report' && '📝 Report Incident'}
            {activeView === 'reports' && '📋 My Reports'}
            {activeView === 'search' && '🔍 Student Lookup'}
          </h1>
          <div className="date">
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Render sub-views – reuse the existing view components but now using className */}
        {activeView === 'classes' && (
          <ClassesView onSelectSubject={handleSelectSubject} />
        )}
        {activeView === 'roster' && selectedSubject && (
          <RosterView subject={selectedSubject} onBack={() => setActiveView('classes')} onReportStudent={handleReportStudent} />
        )}
        {activeView === 'report' && (
          <ReportView onSuccess={() => { setShowSuccess(true); loadMyIncidents(); setActiveView('reports'); }} initialStudent={reportStudent} />
        )}
        {activeView === 'reports' && (
          <ReportsView incidents={myIncidents} loading={loading} />
        )}
        {activeView === 'search' && (
          <SearchView />
        )}
        </main>
        <Footer />
      </div>
    );
  }