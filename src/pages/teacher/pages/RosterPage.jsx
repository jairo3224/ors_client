import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { teacherService } from '../../../services/teacherService';

export default function RosterPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const subject = location.state?.subject;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student => {
    const q = searchTerm.toLowerCase();
    if (!q) return true;
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    return fullName.includes(q) || (student.student_number || '').toLowerCase().includes(q);
  });

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

  const toggleExpand = (studentId) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
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

        <div className="form-group form-search-row" style={{ maxWidth: 400, marginBottom: 18 }}>
          <input
            type="text"
            className="input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or ID..."
          />
          {searchTerm && (
            <button className="btn btn--outline btn-sm" onClick={() => setSearchTerm('')}>Clear</button>
          )}
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : students.length === 0 ? (
          <div className="card empty-state"><p>No students found in this class.</p></div>
        ) : (
          <div className="students-list">
            {filteredStudents.map(student => (
              <div key={student.student_id} className="student-row card">
                <div className="student-row-main" onClick={() => toggleExpand(student.student_id)}>
                  <div className="student-info">
                    <h4>Name: {student.first_name} {student.last_name}</h4>
                  </div>
                  <span className={`dropdown-arrow ${expandedStudent === student.student_id ? 'open' : ''}`}>
                    ▼
                  </span>
                </div>
                {expandedStudent === student.student_id && (
                  <div className="student-dropdown">
                    <table className="dropdown-table">
                      <tbody>
                        <tr>
                          <td className="dropdown-label">Department</td>
                          <td className="dropdown-value">{student.department_name || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="dropdown-label">Student ID</td>
                          <td className="dropdown-value">{student.student_number}</td>
                        </tr>
                      </tbody>
                    </table>
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
