import { useState } from 'react';

const STUDENTS = [
  { id: 1, name: 'Juan Dela Cruz', studentId: 'STU001', year: '3rd Year', program: 'BS Computer Science' },
  { id: 2, name: 'Maria Santos', studentId: 'STU002', year: '2nd Year', program: 'BS Computer Science' },
  { id: 3, name: 'Carlos Garcia', studentId: 'STU003', year: '3rd Year', program: 'BS Computer Science' },
  { id: 4, name: 'Anna Lopez', studentId: 'STU004', year: '1st Year', program: 'BS Computer Science' },
  { id: 5, name: 'Miguel Reyes', studentId: 'STU005', year: '2nd Year', program: 'BS Computer Science' },
  { id: 6, name: 'Sofia Mendoza', studentId: 'STU006', year: '1st Year', program: 'BS Computer Science' },
  { id: 7, name: 'Diego Tan', studentId: 'STU007', year: '4th Year', program: 'BS Computer Science' },
  { id: 8, name: 'Isabella Chua', studentId: 'STU008', year: '2nd Year', program: 'BS Computer Science' },
  { id: 9, name: 'Rafael Villanueva', studentId: 'STU009', year: '3rd Year', program: 'BS Computer Science' },
  { id: 10, name: 'Gabriella Ramos', studentId: 'STU010', year: '1st Year', program: 'BS Computer Science' },
  { id: 11, name: 'Luis Mercado', studentId: 'STU011', year: '4th Year', program: 'BS Computer Science' },
  { id: 12, name: 'Angela Cruz', studentId: 'STU012', year: '2nd Year', program: 'BS Computer Science' },
  { id: 13, name: 'Mateo Del Rosario', studentId: 'STU013', year: '3rd Year', program: 'BS Computer Science' },
  { id: 14, name: 'Julia Ferrer', studentId: 'STU014', year: '1st Year', program: 'BS Computer Science' },
  { id: 15, name: 'Kyle Santiago', studentId: 'STU015', year: '4th Year', program: 'BS Computer Science' },
];

function Avatar({ name }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return <div className="avatar">{initials}</div>;
}

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
            <button type="submit" className="btn">Search</button>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={student.name} />
                <div>
                  <h4>{student.name}</h4>
                  <p>ID: {student.studentId} · {student.year} · {student.program}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
