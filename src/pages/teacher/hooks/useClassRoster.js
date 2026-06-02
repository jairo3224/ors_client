// src/pages/teacher/hooks/useClassRoster.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { teacherService } from '../../../services/teacherService';

/**
 * ORS-16 | useClassRoster
 *
 * Fetches the active student roster for a specific teacher_subjects assignment.
 * Replaces the hardcoded ROSTERS map and ALL_STUDENTS array in RosterPage.jsx.
 *
 * ⚠️  PARAMETER CONTRACT:
 * `teacherSubjectId` must be `teacher_subjects.id` (the junction table PK),
 * NOT `subjects.id`. Using subjects.id would be ambiguous — the same subject
 * can be taught across multiple sections and school years. teacher_subjects.id
 * is the only value that uniquely resolves one class assignment.
 *
 * This means RosterPage.jsx's route param (currently `:classId` mapped to
 * subjects.id via CLASSES.find) must be updated to receive teacher_subject_id
 * from ClassesPage navigation state instead:
 *
 *   // RosterPage.jsx — change from:
 *   const { classId } = useParams();
 *   // to:
 *   const { teacherSubjectId } = useParams();
 *   const { students, loading, error } = useClassRoster(teacherSubjectId);
 *
 * Resolved shape of each student — mirrors the SQL join in teacherService.getRoster():
 * {
 *   student_id:     number,
 *   student_number: string,   // e.g. "2023-00123"
 *   first_name:     string,
 *   last_name:      string,
 *   middle_name:    string | null,
 *   year_level:     number,
 *   section_id:     number,
 *   section_name:   string,
 *   status:         'active' | 'inactive' | 'transferred' | 'graduated'
 * }
 *
 * Usage:
 *   const { teacherSubjectId } = useParams();
 *   const { students, loading, error, refetch } = useClassRoster(teacherSubjectId);
 *
 * @param {number | string | null | undefined} teacherSubjectId — teacher_subjects.id PK
 * @returns {{
 *   students:  object[],
 *   loading:   boolean,
 *   error:     string | null,
 *   refetch:   () => void
 * }}
 */
export function useClassRoster(teacherSubjectId) {
  const { user } = useAuth();

  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const fetchRoster = useCallback(async () => {
    // Bail early if not authenticated or the param hasn't resolved yet
    if (!user || !teacherSubjectId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await teacherService.getRoster(teacherSubjectId);
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message ?? 'Failed to fetch class roster.');
    } finally {
      setLoading(false);
    }
  }, [user, teacherSubjectId]);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  return { students, loading, error, refetch: fetchRoster };
}
