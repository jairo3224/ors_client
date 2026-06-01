import { useState } from 'react';

const STUDENTS = [
  { id: 1, name: 'Juan Dela Cruz', studentId: 'STU001', grade: '10', section: 'A' },
  { id: 2, name: 'Maria Santos', studentId: 'STU002', grade: '11', section: 'B' },
  { id: 3, name: 'Carlos Garcia', studentId: 'STU003', grade: '12', section: 'C' },
  { id: 4, name: 'Anna Lopez', studentId: 'STU004', grade: '10', section: 'A' },
];

export default function SearchView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchTerm.trim().toLowerCase();
    setSearched(true);

    if (!query) {
      setResults([]);
      return;
    }

    const matches = STUDENTS.filter((student) =>
      student.name.toLowerCase().includes(query) || student.studentId.toLowerCase().includes(query)
    );

    setResults(matches);
  };

  return (
    <div className="search-view">
      <div className="search-form card">
        <form onSubmit={handleSearch}>
          <div className="form-group form-search-row">
            <input
              type="text"
              className="input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name or ID..."
            />
            <button type="submit" className="btn-primary">Search</button>
          </div>
        </form>
      </div>

      {searched && results.length === 0 && (
        <div className="card no-results">
          <p>No students found. Try a different name or ID.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="search-results">
          {results.map((student) => (
            <div key={student.id} className="student-result card">
              <div>
                <h4>{student.name}</h4>
                <p>ID: {student.studentId}</p>
                <p>Grade {student.grade} · Section {student.section}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
