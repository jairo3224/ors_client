// src/pages/teacher/hooks/useTeacherIncidents.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { teacherService } from '../../../services/teacherService';

/**
 * ORS-16 | useTeacherIncidents
 *
 * Fetches all incident_reports filed by the authenticated teacher
 * (incident_reports.reported_by = authUser.id), ordered most-recent first.
 *
 * Replaces MOCK_INCIDENTS and the loadMyIncidents() side-effect in Dashboard.jsx.
 * The `pendingCount` derived value also replaces the inline filter in Dashboard.jsx,
 * removing the need to pass it down manually as a prop.
 *
 * ─── CRITICAL ENUM MISMATCH ──────────────────────────────────────────────────
 * Your current mock data and ReportsPage.jsx use statuses that DO NOT EXIST in
 * the real schema. You must update ReportsPage.jsx's statusClass() and
 * statusLabel() maps before switching to real data, or every badge will fall
 * through to the default.
 *
 * Mock values (wrong)  →  Real DB enum values (correct)
 * ─────────────────────────────────────────────────────
 * 'pending'            →  'reported'
 * 'reviewed'           →  'under_review'
 * 'forwarded'          →  'referred'
 * (no equivalent)      →  'in_progress'
 * 'resolved'           →  'resolved'      ✓ (this one matches)
 * 'dismissed'          →  'closed'
 *
 * Similarly, urgency_level arrives from the DB as lowercase:
 *   'low' | 'medium' | 'high' | 'critical'
 * Your mock used Title Case ('Low', 'High', etc.). Verify your badge CSS classes
 * are keyed to lowercase before switching — they already are (.badge-low, etc.),
 * but the ReportsPage.jsx severityClass() map is Title Case, so it will break.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Resolved shape of each incident — mirrors the SQL join in teacherService.getIncidents():
 * {
 *   id:                 number,
 *   report_code:        string,                                    // e.g. "RPT-2026-001"
 *   student_id:         number,
 *   student_number:     string,
 *   student_first_name: string,
 *   student_last_name:  string,
 *   incident_type_id:   number,
 *   type_name:          string,                                    // from incident_types
 *   urgency_level:      'low' | 'medium' | 'high' | 'critical',   // lowercase DB enum
 *   current_status:     'reported' | 'under_review' | 'referred'
 *                     | 'in_progress' | 'resolved' | 'closed',    // real DB enum
 *   description:        string,
 *   subject_id:         number | null,
 *   created_at:         string,   // ISO 8601
 *   updated_at:         string,
 * }
 *
 * Usage (Dashboard.jsx replacement):
 *   const { incidents, pendingCount, loading, error, refetch } = useTeacherIncidents();
 *
 * @returns {{
 *   incidents:    object[],
 *   pendingCount: number,    // incidents where current_status === 'reported'
 *   loading:      boolean,
 *   error:        string | null,
 *   refetch:      () => void
 * }}
 */
export function useTeacherIncidents() {
  const { user } = useAuth();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const fetchIncidents = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await teacherService.getIncidents();
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message ?? 'Failed to fetch incidents.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  /**
   * Derives the Navbar badge count.
   * 'reported' is the only status meaning the teacher filed it and no
   * one has acted on it yet — matching the real DB enum, not the mock.
   */
  const pendingCount = useMemo(
    () => incidents.filter(i => i.current_status === 'reported').length,
    [incidents],
  );

  return { incidents, pendingCount, loading, error, refetch: fetchIncidents };
}
