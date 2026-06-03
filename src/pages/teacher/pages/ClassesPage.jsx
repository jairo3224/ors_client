import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherService } from '../../../services/teacherService';

export default function ClassesPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchClasses() {
      setLoading(true);
      try {
        const data = await teacherService.getClasses();
        if (!cancelled) setClasses(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setClasses([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchClasses();
    return () => { cancelled = true; };
  }, []);

  const handleSelectSubject = (cls) => {
    navigate(`/teacher/roster/${cls.teacher_subject_id}`, { state: { subject: cls } });
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>📚 My Classes</h1>
          <div className="date">
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="classes-view"><p>Loading...</p></div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h1>📚 My Classes</h1>
          <div className="date">
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="classes-view">
          <div className="card empty-state"><p>No classes found for this semester.</p></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>📚 My Classes</h1>
        <div className="date">
          {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      <div className="classes-view">
        <div className="classes-grid">
          {classes.map(cls => (
            <div key={cls.teacher_subject_id} className="class-card card" style={{ padding: '22px 24px' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📚</div>
              <h3 className="card-title">{cls.subject_code} — {cls.subject_name}</h3>
              <p className="card-subtitle">{cls.section_name} · Year {cls.year_level} · {cls.semester}</p>
              <div className="card-footer">
                <button 
                  className="btn-primary"
                  onClick={() => handleSelectSubject(cls)}
                >
                  View Roster
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
