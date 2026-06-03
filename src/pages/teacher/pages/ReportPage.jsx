import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { incidentService } from '../../../services/incidentService';
import { teacherService } from '../../../services/teacherService';

const INCIDENT_TYPES = [
  { id: 5, name: 'Disrespectful Behavior' },
  { id: 4, name: 'Physical Altercation' },
  { id: 3, name: 'Attendance Issue' },
  { id: 2, name: 'Cheating' },
  { id: 1, name: 'Bullying' },
];

const URGENCY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];



export default function ReportPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [studentQuery, setStudentQuery] = useState('');
  const [incidentType, setIncidentType] = useState('5');
  const [urgencyLevel, setUrgencyLevel] = useState('Low');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (studentId) {
      setStudentQuery(studentId);
    } else if (location.state?.student) {
      const s = location.state.student;
      setStudentQuery(`${s.first_name ?? s.name} (${s.student_number ?? s.studentId})`);
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
      const res = await teacherService.searchStudents(studentQuery.trim());
      const students = res.data?.students ?? [];
      if (students.length === 0) {
        throw new Error('No student found matching that name or ID.');
      }

      await incidentService.createIncident({
        student_id: students[0].id,
        incident_type_id: parseInt(incidentType, 10) || null,
        urgency_level: urgencyLevel.toLowerCase(),
        description: description.trim(),
      });
      navigate('/teacher/reports');
    } catch (err) {
      const messages = [];
      if (err.errors) {
        for (const field of Object.values(err.errors)) {
          messages.push(field);
        }
      }
      setError(messages.length ? messages.join('. ') : (err.message || 'Unable to submit report.'));
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
                  {INCIDENT_TYPES.map(({ id, name }) => (
                    <option key={id} value={id}>{name}</option>
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
