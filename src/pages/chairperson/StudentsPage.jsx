import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import './components/StudentsPage.css';

function Avatar({ name }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return <div className="avatar">{initials}</div>;
}

export default function StudentsPage() {
  const { students, setSelectedStudent, user } = useOutletContext();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = students.filter(s => {
    const matchSearch = `${s.first_name} ${s.last_name} ${s.student_id}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || s.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👥 Students</h1>
        <p className="page-subtitle">
          {user?.department_name || 'Department'} ·{' '}
          {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="filters">
        <input className="input" placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Students</option>
          <option value="active">Active</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      <div className="card table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th><th>ID</th><th>Year / Program</th><th>Status</th><th>Cases</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td>
                  <div className="student-cell">
                    <Avatar name={`${s.first_name} ${s.last_name}`} />
                    <div>
                      <div className="student-name">{s.first_name} {s.last_name}</div>
                      <div className="student-email">{s.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="mono">{s.student_id}</span></td>
                <td>
                  <div>{s.year_level}</div>
                  <div className="text-muted">{s.program}</div>
                </td>
                <td>
                  <span className={`badge ${s.status === 'flagged' ? 'badge--high' : 'badge--active'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="text-center">
                  <span className={`case-count ${s.cases_count > 0 ? 'text-danger' : 'text-success'}`}>
                    {s.cases_count}
                  </span>
                </td>
                <td>
                  <button className="btn btn--sm" onClick={() => setSelectedStudent(s)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">No students found.</div>}
      </div>
    </div>
  );
}