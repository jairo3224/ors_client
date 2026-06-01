function Avatar({ name }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return <div className="avatar">{initials}</div>;
}

export default function RosterView({ subject, onBack, onReportStudent }) {
  const students = [
    { id: 1, name: 'Juan Dela Cruz', studentId: 'STU001' },
    { id: 2, name: 'Maria Santos', studentId: 'STU002' },
    { id: 3, name: 'Carlos Garcia', studentId: 'STU003' },
  ];

  return (
    <div className="roster-view">
      <button className="btn-back" onClick={onBack}>← Back to Classes</button>
      
      <div className="roster-header">
        <h2>{subject.name}</h2>
        <p>{subject.subject} - Period {subject.period}</p>
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
              onClick={() => onReportStudent(student)}
            >
              Report Incident
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
