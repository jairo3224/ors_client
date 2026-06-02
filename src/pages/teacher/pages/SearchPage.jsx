import { useState } from 'react';
import { teacherService } from '../../../services/teacherService';

function Avatar({ name }) {
  const initials = (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return <div className="avatar">{initials}</div>;
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    setSearched(true);

    if (!query) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await teacherService.searchStudents(query);
      setResults(response.data?.students ?? []);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
      setSearched(false);
      alert(err.message || 'Search failed.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>🔍 Student Lookup</h1>
        <div className="date">
          {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="search-view">
        <div className="card" style={{ maxWidth: 600 }}>
          <form onSubmit={handleSearch}>
            <div className="form-group form-search-row">
              <input
                type="text"
                className="input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name or ID..."
              />
              <button type="submit" className="btn-primary" disabled={searching}>
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {searched && !searching && results.length === 0 && (
          <div className="card no-results">
            <p>No students found. Try a different name or ID.</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="search-results">
            {results.map((student) => (
              <div key={student.id} className="student-result card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={`${student.first_name} ${student.last_name}`} />
                  <div>
                    <h4>{student.first_name} {student.last_name}</h4>
                    <p>ID: {student.student_number} · {student.year_level} · {student.department_name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
