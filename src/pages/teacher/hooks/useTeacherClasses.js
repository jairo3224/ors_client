// src/pages/teacher/hooks/useTeacherClasses.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { teacherService } from '../../../services/teacherService';

/**
 * ORS-16 | useTeacherClasses
 *
 * Fetches the teacher's subject assignments for the currently active
 * school year (school_years.is_active = 1).
 *
 * Replaces the hardcoded CLASSES constant in ClassesPage.jsx.
 *
 * ⚠️  ROUTING NOTE for ClassesPage.jsx:
 * Currently you navigate with `subject.id` (subjects.id) as the route param.
 * Once wired to real data, you MUST navigate with `teacher_subject_id`
 * (teacher_subjects.id) instead, because only that PK uniquely scopes a class
 * to a specific section AND school year — subjects.id alone is ambiguous.
 *
 *   // ClassesPage.jsx — change from:
 *   navigate(`/teacher/roster/${cls.id}`, ...)
 *   // to:
 *   navigate(`/teacher/roster/${cls.teacher_subject_id}`, ...)
 *
 * Resolved shape of each item — mirrors the SQL join in teacherService.getClasses():
 * {
 *   teacher_subject_id: number,  // teacher_subjects.id — use as the roster route param
 *   subject_id:         number,
 *   subject_code:       string,  // e.g. "CS 201"
 *   subject_name:       string,  // e.g. "Data Structures"
 *   section_id:         number,
 *   section_name:       string,  // e.g. "CS-3A"
 *   year_level:         number,
 *   school_year_id:     number,
 *   school_year:        string,  // e.g. "2025-2026"
 *   semester:           string,  // e.g. "2nd"
 * }
 *
 * Usage:
 *   const { classes, loading, error, refetch } = useTeacherClasses();
 *
 * @returns {{
 *   classes:  object[],
 *   loading:  boolean,
 *   error:    string | null,
 *   refetch:  () => void
 * }}
 */
export function useTeacherClasses() {
  const { user } = useAuth();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchClasses = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await teacherService.getClasses();
      // Guard against a malformed non-array response from the backend
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message ?? 'Failed to fetch classes.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return { classes, loading, error, refetch: fetchClasses };
}
