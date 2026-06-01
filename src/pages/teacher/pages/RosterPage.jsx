import { useNavigate, useParams } from 'react-router-dom';

const CLASSES = [
  { id: 1, name: 'Data Structures', subject: 'CS 201', period: '1st' },
  { id: 2, name: 'Web Development', subject: 'CS 302', period: '2nd' },
  { id: 3, name: 'Database Management', subject: 'CS 303', period: '3rd' },
  { id: 4, name: 'Object-Oriented Programming', subject: 'CS 202', period: '1st' },
  { id: 5, name: 'Computer Networks', subject: 'CS 401', period: '2nd' },
  { id: 6, name: 'Software Engineering', subject: 'CS 402', period: '3rd' },
];

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

const ROSTERS = {
  1: [1, 3, 9, 11, 14],   // Data Structures
  2: [2, 5, 8, 12, 15],   // Web Development
  3: [4, 6, 7, 10, 13],   // Database Management
  4: [1, 5, 8, 10, 14],   // OOP
  5: [2, 4, 9, 11, 15],   // Computer Networks
  6: [3, 6, 7, 12, 13],   // Software Engineering
};

function Avatar({ name }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return <div className="avatar">{initials}</div>;
}

export default function RosterPage() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const subject = CLASSES.find(c => c.id === parseInt(classId));

  if (!subject) {
    return (
      <div>
        <div className="page-header">
          <h1>Class Not Found</h1>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/teacher/classes');
  };

  const handleReportStudent = (student) => {
    navigate(`/teacher/report/${student.studentId}`, { state: { student } });
  };

  const rosterIds = ROSTERS[subject.id] || [1, 2, 3];
  const students = rosterIds.map(id => ALL_STUDENTS.find(s => s.id === id));

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
          <h2>{subject.subject} — {subject.name}</h2>
          <p>Period {subject.period} · {students.length} students</p>
        </div>

        <div className="students-list">
          {students.map(student => (
            <div key={student.id} className="student-row card">
              <Avatar name={student.name} />
              <div className="student-info">
                <h4>{student.name}</h4>
                <p>{student.studentId}</p>
              </div>
              <button 
                className="btn-primary"
                onClick={() => handleReportStudent(student)}
              >
                Report Incident
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
