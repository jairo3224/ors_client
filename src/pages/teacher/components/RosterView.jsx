function Avatar({ name }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return <div className="avatar">{initials}</div>;
}

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

// Each class gets different students
const ROSTERS = {
  1: [1, 3, 9, 11, 14],   // Data Structures
  2: [2, 5, 8, 12, 15],   // Web Development
  3: [4, 6, 7, 10, 13],   // Database Management
  4: [1, 5, 8, 10, 14],   // OOP
  5: [2, 4, 9, 11, 15],   // Computer Networks
  6: [3, 6, 7, 12, 13],   // Software Engineering
};

export default function RosterView({ subject, onBack, onReportStudent }) {
  const rosterIds = ROSTERS[subject.id] || [1, 2, 3];
  const students = rosterIds.map(id => ALL_STUDENTS.find(s => s.id === id));

  return (
    <div className="roster-view">
      <button className="btn-back" onClick={onBack}>← Back to Classes</button>
      
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
              className="btn btn--sm"
              onClick={() => onReportStudent(student)}
            >
              Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
