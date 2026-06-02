export default function ClassesView({ onSelectSubject }) {
  const classes = [
    { id: 1, name: 'Data Structures', subject: 'CS 201', period: '1st' },
    { id: 2, name: 'Web Development', subject: 'CS 302', period: '2nd' },
    { id: 3, name: 'Database Management', subject: 'CS 303', period: '3rd' },
    { id: 4, name: 'Object-Oriented Programming', subject: 'CS 202', period: '1st' },
    { id: 5, name: 'Computer Networks', subject: 'CS 401', period: '2nd' },
    { id: 6, name: 'Software Engineering', subject: 'CS 402', period: '3rd' },
  ];

  const icons = {
    'CS 201': '🗂️',
    'CS 302': '🌐',
    'CS 303': '🗄️',
    'CS 202': '💻',
    'CS 401': '🌍',
    'CS 402': '📋',
  };

  return (
    <div className="classes-view">
      <div className="classes-grid">
        {classes.map(cls => (
          <div key={cls.id} className="class-card card" style={{ padding: '22px 24px' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{icons[cls.subject] || '📚'}</div>
            <h3 className="card__title">{cls.subject} — {cls.name}</h3>
            <p className="card-subtitle">Period {cls.period}</p>
            <div className="card-footer">
              <button 
                className="btn"
                onClick={() => onSelectSubject(cls)}
              >
                View Roster
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
