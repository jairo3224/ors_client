export default function ClassesView({ onSelectSubject }) {
  const classes = [
    { id: 1, name: 'English 101', subject: 'English', period: '1st' },
    { id: 2, name: 'Mathematics 201', subject: 'Math', period: '2nd' },
    { id: 3, name: 'Science 301', subject: 'Science', period: '3rd' },
  ];

  const icons = { English: '📖', Math: '📐', Science: '🔬' };

  return (
    <div className="classes-view">
      <div className="classes-grid">
        {classes.map(cls => (
          <div key={cls.id} className="class-card card" style={{ padding: '22px 24px' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{icons[cls.subject] || '📚'}</div>
            <h3 className="card-title">{cls.name}</h3>
            <p className="card-subtitle">{cls.subject} · Period {cls.period}</p>
            <div className="card-footer">
              <button 
                className="btn-primary"
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
