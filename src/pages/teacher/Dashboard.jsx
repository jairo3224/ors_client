import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { incidentService } from '../../services/incidentService';
import Navbar from './components/Navbar';
import ClassesView from './components/ClassesView';
import RosterView from './components/RosterView';
import ReportView from './components/ReportView';
import ReportsView from './components/ReportsView';
import SearchView from './components/SearchView';
import './Dashboard.css';

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
    const incidents = await incidentService.getMyIncidents();
    setMyIncidents(incidents);
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
    </div>
  );
}