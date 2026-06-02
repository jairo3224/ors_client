// src/services/teacherService.js

// ─── BASE FETCH ───────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost/ors-backend/api';

/**
 * Thin fetch wrapper shared by all teacher service methods.
 * - Injects Bearer token from localStorage (adapt the key to match authService).
 * - Normalises non-2xx responses into thrown Error objects with the backend message.
 * - Returns the parsed JSON body on success.
 *
 * NOTE: If your project already has a shared apiFetch / axios instance (e.g. in
 * src/lib/api.js), replace this function with an import from there instead of
 * duplicating the HTTP client logic.
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message ?? `Request failed — HTTP ${response.status}`);
  }

  return response.json();
}

// ─── SERVICE ──────────────────────────────────────────────────────────────────
/**
 * Teacher-scoped API service.
 * All endpoints below require an authenticated Teacher session (role_id = 5).
 *
 * The SQL joins expected from each backend endpoint are documented inline so
 * the backend developer knows exactly what to return without ambiguity.
 */
export const teacherService = {
  /**
   * GET /teacher/profile
   *
   * Expected SQL (PHP controller):
   *   SELECT u.id, u.employee_id, u.first_name, u.last_name, u.email,
   *          u.role_id, r.role_name,
   *          u.department_id, d.department_name,
   *          u.is_active
   *   FROM   users u
   *   JOIN   roles       r ON u.role_id       = r.id
   *   LEFT JOIN departments d ON u.department_id = d.id
   *   WHERE  u.id = :authUserId
   *     AND  u.deleted_at IS NULL
   *
   * @returns {Promise<TeacherProfile>}
   */
  getProfile: () => apiFetch('/teacher/profile'),

  /**
   * GET /teacher/classes
   *
   * Returns the teacher's subject assignments for the currently active
   * school year only (school_years.is_active = 1).
   *
   * Expected SQL (PHP controller):
   *   SELECT ts.id            AS teacher_subject_id,
   *          s.id             AS subject_id,
   *          s.subject_code,
   *          s.subject_name,
   *          sec.id           AS section_id,
   *          sec.section_name,
   *          sec.year_level,
   *          sy.id            AS school_year_id,
   *          sy.school_year,
   *          sy.semester
   *   FROM   teacher_subjects ts
   *   JOIN   subjects     s   ON ts.subject_id     = s.id
   *   JOIN   sections     sec ON ts.section_id     = sec.id
   *   JOIN   school_years sy  ON ts.school_year_id = sy.id
   *   WHERE  ts.teacher_id = :authUserId
   *     AND  sy.is_active  = 1
   *     AND  s.deleted_at  IS NULL
   *     AND  sec.deleted_at IS NULL
   *
   * @returns {Promise<TeacherClass[]>}
   */
  getClasses: () => apiFetch('/teacher/classes'),

  /**
   * GET /teacher/classes/:teacherSubjectId/roster
   *
   * IMPORTANT: The route param is teacher_subjects.id (PK of the junction row),
   * NOT subjects.id. This uniquely identifies one teacher → subject → section →
   * school year assignment, which is the correct scope for a class roster.
   *
   * Expected SQL (PHP controller):
   *   SELECT st.id            AS student_id,
   *          st.student_number,
   *          st.first_name,
   *          st.last_name,
   *          st.middle_name,
   *          st.year_level,
   *          sec.id           AS section_id,
   *          sec.section_name,
   *          st.status
   *   FROM   student_subjects ss
   *   JOIN   students     st  ON ss.student_id  = st.id
   *   JOIN   sections     sec ON ss.section_id  = sec.id
   *   -- Resolve which subject_id/section_id/school_year_id to filter by:
   *   JOIN   teacher_subjects ts ON ts.id = :teacherSubjectId
   *   WHERE  ss.subject_id     = ts.subject_id
   *     AND  ss.section_id     = ts.section_id
   *     AND  ss.school_year_id = ts.school_year_id
   *     AND  st.status         = 'active'
   *     AND  st.deleted_at     IS NULL
   *   ORDER BY st.last_name, st.first_name
   *
   * @param {number} teacherSubjectId — teacher_subjects.id PK
   * @returns {Promise<RosterStudent[]>}
   */
  getRoster: (teacherSubjectId) =>
    apiFetch(`/teacher/classes/${teacherSubjectId}/roster`),

  /**
   * GET /teacher/incidents
   *
   * Returns all incident reports filed by the authenticated teacher,
   * most recent first.
   *
   * Expected SQL (PHP controller):
   *   SELECT ir.id,
   *          ir.report_code,
   *          ir.student_id,
   *          st.student_number,
   *          st.first_name  AS student_first_name,
   *          st.last_name   AS student_last_name,
   *          ir.incident_type_id,
   *          it.type_name,
   *          ir.urgency_level,      -- enum: low | medium | high | critical
   *          ir.current_status,     -- enum: reported | under_review | referred |
   *                                 --       in_progress | resolved | closed
   *          ir.description,
   *          ir.subject_id,
   *          ir.created_at,
   *          ir.updated_at
   *   FROM   incident_reports ir
   *   JOIN   students      st ON ir.student_id        = st.id
   *   LEFT JOIN incident_types it ON ir.incident_type_id = it.id
   *   WHERE  ir.reported_by = :authUserId
   *     AND  ir.deleted_at  IS NULL
   *   ORDER BY ir.created_at DESC
   *
   * @returns {Promise<TeacherIncident[]>}
   */
  getIncidents: async () => {
    const res = await apiFetch('/teacher/incidents');
    return res.data?.incidents ?? [];
  },

  /**
   * GET /teacher/students/search?q=...
   *
   * Searches active students by name or student number.
   * Teachers are scoped to their own department automatically.
   *
   * @param {string} keyword  Search term (name or student number)
   * @returns {Promise<{students: StudentSearchResult[]}>}
   */
  searchStudents: (keyword) =>
    apiFetch(`/teacher/students/search?q=${encodeURIComponent(keyword)}`),
};
