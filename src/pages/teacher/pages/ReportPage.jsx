import { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext, useLocation } from 'react-router-dom';
import { incidentService } from '../../../services/incidentService';

const INCIDENT_TYPES = [
  'Disrespectful Behavior',
  'Physical Altercation',
  'Attendance Issue',
  'Cheating',
  'Bullying',
  'Other',
];

const URGENCY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

const ALL_STUDENTS = [
  { id: 1, name: 'Juan Dela Cruz', studentId: 'STU001' },
  { id: 2, name: 'Maria Santos', studentId: 'STU002' },
  { id: 3, name: 'Carlos Garcia', studentId: 'STU003' },
  { id: 4, name: 'Anna Lopez', studentId: 'STU004' },
  { id: 5, name: 'Miguel Reyes', studentId: 'STU005' },
  { id: 6, name: 'Sofia Mendoza', studentId: 'STU006' },
  { id: 7, name: 'Diego Tan', studentId: 'STU007' },
  { id: 8, name: 'Isabella Chua', studentId: 'STU008' },
  { id: 9, name: 'Rafael Villanueva', studentId: 'STU009' },
  { id: 10, name: 'Gabriella Ramos', studentId: 'STU010' },
  { id: 11, name: 'Luis Mercado', studentId: 'STU011' },
  { id: 12, name: 'Angela Cruz', studentId: 'STU012' },
  { id: 13, name: 'Mateo Del Rosario', studentId: 'STU013' },
  { id: 14, name: 'Julia Ferrer', studentId: 'STU014' },
  { id: 15, name: 'Kyle Santiago', studentId: 'STU015' },
];

export default function ReportPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const context = useOutletContext();

  const { setShowSuccess, loadMyIncidents } = context || {};

  const [studentQuery, setStudentQuery] = useState('');
  const [incidentType, setIncidentType] = useState('Disrespectful Behavior');
  const [urgencyLevel, setUrgencyLevel] = useState('Low');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Get student from URL params or from location state
    if (location.state?.student) {
      setStudentQuery(`${location.state.student.name} (${location.state.student.studentId})`);
    } else if (studentId) {
      const student = ALL_STUDENTS.find(s => s.studentId === studentId);
      if (student) {
        setStudentQuery(`${student.name} (${student.studentId})`);
      }
    }
  }, [studentId, location.state?.student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!studentQuery.trim()) {
      setError('Please enter a student name or student ID.');
      return;
    }
    if (!description.trim()) {
      setError('Please describe the incident.');
      return;
    }

    setSubmitting(true);

    try {
      await incidentService.createIncident({
        student_query: studentQuery.trim(),
        incident_type: incidentType,
        urgency_level: urgencyLevel,
        description: description.trim(),
      });
      setStudentQuery('');
      setIncidentType('Disrespectful Behavior');
      setUrgencyLevel('Low');
      setDescription('');
      setShowSuccess?.(true);
      loadMyIncidents?.();
      navigate('/teacher/reports');
    } catch (err) {
      setError(err.message || 'Unable to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>📝 Report Incident</h1>
        <div className="date">
          {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="report-view">
        <div className="card report-form">
          <h2>Report Incident</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="label" htmlFor="studentQuery">Student *</label>
                <input
                  id="studentQuery"
                  type="text"
                  className="input"
                  value={studentQuery}
                  onChange={(e) => setStudentQuery(e.target.value)}
                  placeholder="Enter student name or student ID"
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="incidentType">Incident type *</label>
                <select
                  id="incidentType"
                  className="select"
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                >
                  {INCIDENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="urgencyLevel">Urgency level *</label>
                <select
                  id="urgencyLevel"
                  className="select"
                  value={urgencyLevel}
                  onChange={(e) => setUrgencyLevel(e.target.value)}
                >
                  {URGENCY_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="description">Description *</label>
              <textarea
                id="description"
                className="textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the incident in detail..."
                rows="6"
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
