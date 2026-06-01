export default function ClassesView({ onSelectSubject }) {
  const classes = [
    { id: 1, name: 'English 101', subject: 'English', period: '1st' },
    { id: 2, name: 'Mathematics 201', subject: 'Math', period: '2nd' },
    { id: 3, name: 'Science 301', subject: 'Science', period: '3rd' },
  ];

  return (
    <div className="classes-view">
      <div className="classes-grid">
        {classes.map(cls => (
          <div key={cls.id} className="class-card card">
            <h3>{cls.name}</h3>
            <p className="subject">{cls.subject}</p>
            <p className="period">Period: {cls.period}</p>
            <button 
              className="btn-primary"
              onClick={() => onSelectSubject(cls)}
            >
              View Roster
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
