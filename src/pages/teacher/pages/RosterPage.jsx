import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { teacherService } from '../../../services/teacherService';

function Avatar({ name }) {
  const initials = (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return <div className="avatar">{initials}</div>;
}

export default function RosterPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const subject = location.state?.subject;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredStudent, setHoveredStudent] = useState(null);

  useEffect(() => {
    if (!classId) return;
    let cancelled = false;
    async function fetchRoster() {
      setLoading(true);
      try {
        const data = await teacherService.getRoster(parseInt(classId));
        if (!cancelled) setStudents(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setStudents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchRoster();
    return () => { cancelled = true; };
  }, [classId]);

  const handleBack = () => {
    navigate('/teacher/classes');
  };

  const handleReportStudent = (student) => {
    navigate(`/teacher/report/${student.student_number}`);
  };

  return (
    <div>
      <div className="page-header">
        <h1>📚 Class Roster</h1>
        <div className="date">
          {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="roster-view">
        <button className="btn-back" onClick={handleBack}>← Back to Classes</button>
        
        <div className="roster-header">
          <h2>{subject ? `${subject.subject_code} — ${subject.subject_name}` : 'Class'}</h2>
          <p>{subject ? `${subject.section_name} · ${students.length} students` : ''}</p>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : students.length === 0 ? (
          <div className="card empty-state"><p>No students found in this class.</p></div>
        ) : (
          <div className="students-list">
            {students.map(student => (
              <div
                key={student.student_id}
                className="student-row card"
                onMouseEnter={() => setHoveredStudent(student.student_id)}
                onMouseLeave={() => setHoveredStudent(null)}
              >
                <Avatar name={`${student.first_name} ${student.last_name}`} />
                <div className="student-info">
                  <h4>{student.first_name} {student.last_name}</h4>
                </div>
                {hoveredStudent === student.student_id && (
                  <div className="hover-card">
                    <div className="hover-item">
                      <span className="hover-label">Department</span>
                      <span>{student.department_name || 'N/A'}</span>
                    </div>
                    <div className="hover-item">
                      <span className="hover-label">Student ID</span>
                      <span>{student.student_number}</span>
                    </div>
                    <div className="hover-divider" />
                    <button
                      className="hover-action"
                      onClick={() => handleReportStudent(student)}
                    >
                      Report Incident
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
