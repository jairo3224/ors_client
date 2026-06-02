import { useState } from 'react';
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

export default function ReportView({ onSuccess, initialStudent }) {
  const [studentQuery, setStudentQuery] = useState(
    initialStudent ? `${initialStudent.name} (${initialStudent.studentId})` : ''
  );
  const [incidentType, setIncidentType] = useState('Disrespectful Behavior');
  const [urgencyLevel, setUrgencyLevel] = useState('Low');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
      onSuccess();
    } catch (err) {
      setError(err.message || 'Unable to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
