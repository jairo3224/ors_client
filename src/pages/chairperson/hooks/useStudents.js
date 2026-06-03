import { useState, useEffect } from 'react';
import api from '../../../services/api'; // or your axios/fetch wrapper

export function useStudents(deptId) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!deptId) return;
    setLoading(true);
    api.get('/chairperson/students')
      .then(res => {
        const students = res?.data?.data?.students || [];
        if (students.length === 0) {
          // Try a localhost-only debug endpoint (helps when DB has no department data)
          return api.get('/debug/students')
            .then(r => setStudents(r?.data?.data?.students || []))
            .catch(() => setStudents([]));
        }
        setStudents(students);
      })
      .catch(err => {
        setError(err);
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [deptId]);

  return { students, loading, error };
}