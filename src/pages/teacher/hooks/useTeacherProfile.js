// src/pages/teacher/hooks/useTeacherProfile.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { teacherService } from '../../../services/teacherService';

/**
 * ORS-16 | useTeacherProfile
 *
 * Fetches the authenticated teacher's server-side profile.
 * Supplements the AuthContext `user` object with data that requires
 * SQL joins (department_name, role_name) not stored in the JWT payload.
 *
 * Resolved shape — mirrors the SQL join in teacherService.getProfile():
 * {
 *   id:              number,
 *   employee_id:     string,   // e.g. "EMP-2026-049"
 *   first_name:      string,
 *   last_name:       string,
 *   email:           string,
 *   role_id:         number,
 *   role_name:       string,   // "Teacher"
 *   department_id:   number | null,
 *   department_name: string | null,
 *   is_active:       number,   // 1 | 0 (MariaDB tinyint)
 * }
 *
 * Usage:
 *   const { profile, loading, error, refetch } = useTeacherProfile();
 *
 * @returns {{
 *   profile:  object | null,
 *   loading:  boolean,
 *   error:    string | null,
 *   refetch:  () => void
 * }}
 */
export function useTeacherProfile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchProfile = useCallback(async () => {
    // Do not fire before the auth context has resolved a user
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await teacherService.getProfile();
      setProfile(data);
    } catch (err) {
      setError(err.message ?? 'Failed to fetch teacher profile.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
}
