const listeners = new Set();

function getCurrentSchoolYear() {
  const d = new Date();
  const year = d.getFullYear();
  return d.getMonth() >= 5 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

const DEFAULT_SETTINGS = {
  schoolYear: getCurrentSchoolYear(),
  semester: '2nd Semester',
  incidentTypes: [
    { id: 1, name: 'Disrespectful Behavior', description: 'Disruptive behavior, disrespect, inappropriate conduct', active: true },
    { id: 2, name: 'Physical Altercation', description: 'Physical fights, altercations, serious misconduct', active: true },
    { id: 3, name: 'Attendance Issue', description: 'Tardiness, absences, cutting classes', active: true },
    { id: 4, name: 'Cheating', description: 'Academic dishonesty, cheating, plagiarism', active: true },
    { id: 5, name: 'Bullying', description: 'Harassment, intimidation, cyberbullying', active: true },
    { id: 6, name: 'Other', description: 'Other miscellaneous incidents', active: true },
  ],
};

function loadPersistedSettings() {
  try {
    const saved = localStorage.getItem('dsirts_settings');
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    return {
      schoolYear: typeof parsed.schoolYear === 'string' ? parsed.schoolYear : DEFAULT_SETTINGS.schoolYear,
      semester: typeof parsed.semester === 'string' ? parsed.semester : DEFAULT_SETTINGS.semester,
      incidentTypes: Array.isArray(parsed.incidentTypes) ? parsed.incidentTypes : DEFAULT_SETTINGS.incidentTypes,
    };
  } catch { return {}; }
}

function saveSettings(settings) {
  try { localStorage.setItem('dsirts_settings', JSON.stringify(settings)); } catch {}
}

const STORAGE_KEY_ATTACHMENTS = 'dsirts_attachments';

function loadPersistedAttachments() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ATTACHMENTS);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function saveAttachments(attachments) {
  try { localStorage.setItem(STORAGE_KEY_ATTACHMENTS, JSON.stringify(attachments)); } catch {}
}

const urgencyToPriority = {
  'Low': 'low',
  'Medium': 'moderate',
  'High': 'high',
  'Critical': 'critical',
};

const severityToPriority = {
  'low': 'low',
  'moderate': 'moderate',
  'high': 'high',
  'critical': 'critical',
};

let state = {
  incidents: [
    { id: 'inc_1', student_name: 'Maria Santos', student_id: '2024-0001', teacher_name: 'Prof. Jose Rizal', type: 'Disrespectful Behavior', priority: 'high', status: 'under_review', description: 'Repeated disruptive behavior in Data Structures class. Student talks over the instructor and refuses to follow instructions.', assigned_to: null, assignment_reason: '', date_reported: '2026-05-28', last_updated: '2026-05-29', notes: '' },
    { id: 'inc_2', student_name: 'Ana Reyes', student_id: '2024-0003', teacher_name: 'Prof. E. Aguinaldo', type: 'Physical Altercation', priority: 'critical', status: 'investigating', description: 'Physical altercation with another student in the CS laboratory. Both students were shouting and pushing.', assigned_to: 'OSAS', date_reported: '2026-05-30', last_updated: '2026-05-31', notes: 'Waiting for CCTV footage review.' },
    { id: 'inc_3', student_name: 'Juan Dela Cruz', student_id: '2024-0002', teacher_name: 'Prof. A. Bonifacio', type: 'Attendance Issue', priority: 'low', status: 'reported', description: 'Failed to submit 3 major requirements in Web Development class over the past 2 weeks.', assigned_to: null, date_reported: '2026-05-27', last_updated: '2026-05-27', notes: '' },
    { id: 'inc_4', student_name: 'Pedro Lim', student_id: '2024-0004', teacher_name: 'Prof. J. Rizal', type: 'Cheating', priority: 'high', status: 'forwarded', description: 'Suspected academic dishonesty during midterm exam. Code matched online source.', assigned_to: 'Department Head', date_reported: '2026-05-26', last_updated: '2026-05-28', notes: 'Forwarded to CS Department for further investigation.' },
    { id: 'inc_5', student_name: 'Carlos Garcia', student_id: '2024-0005', teacher_name: 'Prof. M. Luna', type: 'Attendance Issue', priority: 'moderate', status: 'resolved', description: 'Chronic tardiness - late to class 8 times this month. Student has since improved after counseling.', assigned_to: 'Guidance Office', date_reported: '2026-05-20', last_updated: '2026-05-25', notes: 'Student attended counseling. Attendance has improved.' },
    { id: 'inc_6', student_name: 'Diego Tan', student_id: '2024-0006', teacher_name: 'Prof. A. Bonifacio', type: 'Bullying', priority: 'critical', status: 'reported', description: 'Used threatening language toward a classmate during a group project disagreement.', assigned_to: null, date_reported: '2026-05-30', last_updated: '2026-05-30', notes: '' },
    { id: 'inc_7', student_name: 'Rosa Garcia', student_id: '2024-0007', teacher_name: 'Prof. J. Rizal', type: 'Disrespectful Behavior', priority: 'moderate', status: 'under_review', description: 'Inappropriate language directed at a classmate during group work session.', assigned_to: 'Guidance Office', date_reported: '2026-05-29', last_updated: '2026-05-30', notes: 'Guidance has been notified.' },
    { id: 'inc_8', student_name: 'Isabella Chua', student_id: '2024-0008', teacher_name: 'Prof. E. Aguinaldo', type: 'Attendance Issue', priority: 'low', status: 'dismissed', description: 'Missed 3 lab sessions due to medical reasons. Presented valid medical certificate.', assigned_to: null, date_reported: '2026-05-18', last_updated: '2026-05-22', notes: 'Case dismissed - medical docs verified.' },
    { id: 'inc_9', student_name: 'Kevin Mercado', student_id: '2024-0009', teacher_name: 'Prof. J. Rizal', type: 'Disrespectful Behavior', priority: 'high', status: 'reported', description: 'Caught cheating on final project. Submitted plagiarized code from an online repository.', assigned_to: null, date_reported: '2026-06-01', last_updated: '2026-06-01', notes: '' },
    { id: 'inc_10', student_name: 'Luis Santos', student_id: '2024-0010', teacher_name: 'Prof. A. Bonifacio', type: 'Bullying', priority: 'critical', status: 'reported', description: 'Repeatedly harassed a classmate through social media posts and group chats.', assigned_to: null, date_reported: '2026-06-02', last_updated: '2026-06-02', notes: '' },
  ],

  reports: [
    { id: 'rpt_1', student_name: 'Maria Santos', teacher_name: 'Prof. Jose Rizal', department: 'CS Department', type: 'Disrespectful Behavior', severity: 'high', description: 'Repeated disruptive behavior in class over the past two weeks.', date_submitted: '2026-05-28', status: 'pending' },
    { id: 'rpt_2', student_name: 'Juan Dela Cruz', teacher_name: 'Prof. A. Bonifacio', department: 'CS Department', type: 'Attendance Issue', severity: 'low', description: 'Absent for 5 consecutive sessions without excuse.', date_submitted: '2026-05-27', status: 'reviewed' },
    { id: 'rpt_3', student_name: 'Ana Reyes', teacher_name: 'Prof. E. Aguinaldo', department: 'IT Department', type: 'Physical Altercation', severity: 'critical', description: 'Physical altercation with another student in the laboratory.', date_submitted: '2026-05-30', status: 'pending' },
    { id: 'rpt_4', student_name: 'Pedro Lim', teacher_name: 'Prof. J. Rizal', department: 'CS Department', type: 'Cheating', severity: 'high', description: 'Suspected academic dishonesty during midterm examination.', date_submitted: '2026-05-26', status: 'forwarded' },
    { id: 'rpt_5', student_name: 'Rosa Garcia', teacher_name: 'Prof. M. Luna', department: 'IT Department', type: 'Disrespectful Behavior', severity: 'moderate', description: 'Inappropriate language directed at a classmate during group work.', date_submitted: '2026-05-29', status: 'pending' },
    { id: 'rpt_6', student_name: 'Carlos Garcia', teacher_name: 'Prof. J. Rizal', department: 'CS Department', type: 'Attendance Issue', severity: 'moderate', description: 'Chronic tardiness - late to class 8 times this month.', date_submitted: '2026-05-25', status: 'pending' },
    { id: 'rpt_7', student_name: 'Diego Tan', teacher_name: 'Prof. A. Bonifacio', department: 'CS Department', type: 'Bullying', severity: 'critical', description: 'Shouting match with classmate in the lab. Used threatening language.', date_submitted: '2026-05-30', status: 'pending' },
    { id: 'rpt_8', student_name: 'Kevin Mercado', teacher_name: 'Prof. J. Rizal', department: 'CS Department', type: 'Cheating', severity: 'high', description: 'Caught cheating on final project. Submitted plagiarized code.', date_submitted: '2026-06-01', status: 'pending' },
    { id: 'rpt_9', student_name: 'Luis Santos', teacher_name: 'Prof. A. Bonifacio', department: 'CS Department', type: 'Bullying', severity: 'critical', description: 'Cyberbullying and harassment of classmate through social media.', date_submitted: '2026-06-02', status: 'pending' },
  ],

  cases: [
    { id: 'case_1', student_name: 'Maria Santos', title: 'Repeated Disruptive Behavior', type: 'Disrespectful Behavior', status: 'open', priority: 'medium', assigned_to: null, opened_date: '2026-05-20', last_update: '2026-05-28' },
    { id: 'case_2', student_name: 'Ana Reyes', title: 'Physical Altercation', type: 'Physical Altercation', status: 'open', priority: 'high', assigned_to: 'Guidance Office', opened_date: '2026-05-30', last_update: '2026-05-30' },
    { id: 'case_3', student_name: 'Pedro Lim', title: 'Academic Dishonesty Investigation', type: 'Cheating', status: 'referred', priority: 'high', assigned_to: 'Department Head', opened_date: '2026-05-26', last_update: '2026-05-26' },
    { id: 'case_4', student_name: 'Carlos Garcia', title: 'Chronic Attendance Issue', type: 'Attendance Issue', status: 'open', priority: 'low', assigned_to: null, opened_date: '2026-05-25', last_update: '2026-05-25' },
    { id: 'case_5', student_name: 'Rosa Garcia', title: 'Inappropriate Behavior', type: 'Disrespectful Behavior', status: 'closed', priority: 'low', assigned_to: 'Guidance Office', opened_date: '2026-05-15', last_update: '2026-05-22' },
    { id: 'case_6', student_name: 'Kevin Mercado', title: 'Academic Dishonesty - Final Project', type: 'Cheating', status: 'open', priority: 'high', assigned_to: null, opened_date: '2026-06-01', last_update: '2026-06-01' },
    { id: 'case_7', student_name: 'Luis Santos', title: 'Cyberbullying Investigation', type: 'Bullying', status: 'open', priority: 'high', assigned_to: 'Guidance Office', opened_date: '2026-06-02', last_update: '2026-06-02' },
  ],

  referrals: [
    { id: 'ref_1', student_name: 'Maria Santos', student_id: '2024-0001', from_office: 'Department Head', to_office: 'OSAS', subject: 'Academic Impact Review', description: 'Student has been reported for repeated misconduct. Requesting OSAS to evaluate overall impact.', date_sent: '2026-05-26', status: 'pending', response: null, responded_at: null },
    { id: 'ref_2', student_name: 'Ana Reyes', student_id: '2024-0003', from_office: 'OSAS', to_office: 'Guidance Office', subject: 'Counseling Referral', description: 'Student involved in physical altercation. Needs immediate counseling intervention.', date_sent: '2026-05-30', status: 'pending', response: null, responded_at: null },
    { id: 'ref_3', student_name: 'Pedro Lim', student_id: '2024-0004', from_office: 'OSAS', to_office: 'Department Head', subject: 'Academic Dishonesty Investigation', description: 'Suspected cheating during midterm. Requesting department to conduct academic investigation.', date_sent: '2026-05-26', status: 'responded', response: 'Investigation initiated. Will update within 5 working days.', responded_at: '2026-05-28' },
    { id: 'ref_4', student_name: 'Carlos Garcia', student_id: '2024-0005', from_office: 'Guidance Office', to_office: 'Chaplain', subject: 'Spiritual Support Referral', description: 'Student showing signs of distress and anxiety. Requesting spiritual counseling.', date_sent: '2026-05-25', status: 'responded', response: 'Student has been scheduled for a session this Friday.', responded_at: '2026-05-26' },
    { id: 'ref_5', student_name: 'Rosa Garcia', student_id: '2024-0007', from_office: 'Department Head', to_office: 'Guidance Office', subject: 'Behavioral Assessment', description: 'Inappropriate language incident. Requesting guidance assessment and intervention.', date_sent: '2026-05-29', status: 'pending', response: null, responded_at: null },
    { id: 'ref_6', student_name: 'Diego Tan', student_id: '2024-0006', from_office: 'OSAS', to_office: 'Guidance Office', subject: 'Threat Assessment', description: 'Student made threatening statements. Urgent assessment needed.', date_sent: '2026-05-30', status: 'pending', response: null, responded_at: null },
  ],

  sanctions: [
    { id: 'san_1', student_name: 'Maria Santos', student_id: '2024-0001', type: 'warning', reason: 'Repeated disruptive behavior in class.', issued_by: 'OSAS', date_issued: '2026-05-28', status: 'active', notes: 'First formal warning. Student informed of consequences.', duration: null },
    { id: 'san_2', student_name: 'Ana Reyes', student_id: '2024-0003', type: 'suspension', reason: 'Physical altercation with another student in the laboratory.', issued_by: 'OSAS', date_issued: '2026-05-30', status: 'active', notes: '3-day suspension. Parent notified.', duration: '3 days' },
    { id: 'san_3', student_name: 'Carlos Garcia', student_id: '2024-0005', type: 'probation', reason: 'Chronic tardiness and attendance issues.', issued_by: 'Department Head', date_issued: '2026-05-20', status: 'active', notes: 'Academic probation for one grading period.', duration: '1 grading period' },
    { id: 'san_4', student_name: 'Rosa Garcia', student_id: '2024-0007', type: 'community_service', reason: 'Inappropriate language and behavior toward classmates.', issued_by: 'Guidance Office', date_issued: '2026-05-25', status: 'completed', notes: 'Completed 20 hours of community service. Behavior improved.', duration: '20 hours' },
    { id: 'san_5', student_name: 'Diego Tan', student_id: '2024-0006', type: 'warning', reason: 'Used threatening language toward a classmate.', issued_by: 'OSAS', date_issued: '2026-05-30', status: 'pending', notes: 'Awaiting hearing before formal sanction.', duration: null },
  ],

  assessments: [
    { id: 'asmt_1', student_name: 'Maria Santos', student_id: '2024-0001', type: 'Disrespectful Behavior', date: '2026-05-29', assessor: 'OSAS', status: 'draft', assessment: '', recommendation: '', resolution: '' },
    { id: 'asmt_2', student_name: 'Ana Reyes', student_id: '2024-0003', type: 'Physical Altercation', date: '2026-05-30', assessor: 'OSAS', status: 'completed', assessment: 'Student shows signs of anger management issues. Incident was triggered by perceived provocation. Student expressed remorse and willingness to undergo counseling.', recommendation: 'Mandatory counseling sessions with Guidance Office. Student to submit written apology. Monitor behavior for 1 month.', resolution: 'Student attended 2 counseling sessions. Written apology submitted to affected party. No further incidents reported.' },
    { id: 'asmt_3', student_name: 'Carlos Garcia', student_id: '2024-0005', type: 'Attendance Issue', date: '2026-05-25', assessor: 'Guidance Office', status: 'completed', assessment: 'Chronic tardiness stems from transportation issues. Student commutes from a distant province. Academic performance remains satisfactory when present.', recommendation: 'Flexible attendance arrangement. Student to submit weekly progress reports. Consider online class option for early morning sessions.', resolution: 'Flexible arrangement implemented. Student attendance improved to 90%. Academic performance maintained.' },
    { id: 'asmt_4', student_name: 'Rosa Garcia', student_id: '2024-0007', type: 'Disrespectful Behavior', date: '2026-05-29', assessor: 'OSAS', status: 'draft', assessment: '', recommendation: '', resolution: '' },
  ],

  meetings: [
    { id: 'mtg_1', case_id: 'inc_1', student_name: 'Maria Santos', title: 'Behavioral Intervention Meeting', date: '2026-06-05', time: '10:00', location: 'OSAS Conference Room', participants: ['OSAS', 'Guidance Office', 'Department Head'], agenda: 'Review repeated disruptive behavior, discuss intervention strategies, set behavioral goals.', minutes: 'Student acknowledged behavior issues. Agreed to attend 4 counseling sessions. Next meeting scheduled if no improvement.', outcomes: 'Student placed on behavioral probation for 30 days.', status: 'completed' },
    { id: 'mtg_2', case_id: 'inc_2', student_name: 'Ana Reyes', title: 'Physical Altercation Hearing', date: '2026-06-08', time: '14:00', location: 'Student Affairs Office', participants: ['OSAS', 'Guidance Office', 'Chaplain'], agenda: 'Review CCTV footage, hear statements from both parties, determine disciplinary action.', minutes: '', outcomes: '', status: 'scheduled' },
    { id: 'mtg_3', case_id: 'inc_3', student_name: 'Juan Dela Cruz', title: 'Academic Progress Review', date: '2026-06-03', time: '09:00', location: 'CS Department Office', participants: ['Department Head', 'OSAS'], agenda: 'Discuss chronic non-submission of requirements, create academic recovery plan.', minutes: 'Teacher presented record of missing requirements. Student cited personal challenges. Academic recovery plan drafted.', outcomes: 'Student signed academic contract. 2-week extension granted for missing work.', status: 'completed' },
    { id: 'mtg_4', case_id: 'inc_6', student_name: 'Diego Tan', title: 'Threat Assessment Meeting', date: '2026-06-10', time: '11:00', location: 'OSAS Conference Room', participants: ['OSAS', 'Guidance Office', 'Chaplain', 'Department Head'], agenda: 'Assess threat level, determine safety protocols, plan student support.', minutes: '', outcomes: '', status: 'scheduled' },
    { id: 'mtg_5', case_id: 'inc_5', student_name: 'Carlos Garcia', title: 'Attendance Improvement Review', date: '2026-06-02', time: '13:30', location: 'Guidance Office', participants: ['Guidance Office', 'OSAS'], agenda: 'Review attendance improvement, evaluate counseling effectiveness.', minutes: 'Attendance has improved from 8 to 2 tardiness this month. Counseling has been effective.', outcomes: 'Continue monitoring. Reduce counseling sessions to biweekly.', status: 'completed' },
    { id: 'mtg_6', case_id: 'inc_7', student_name: 'Rosa Garcia', title: 'Behavioral Counseling Session', date: '2026-06-12', time: '15:00', location: 'Guidance Office', participants: ['Guidance Office', 'Chaplain'], agenda: 'Initial counseling session post-incident, establish rapport, identify triggers.', minutes: 'Student expressed remorse. Anger management strategies discussed.', outcomes: '', status: 'in_progress' },
  ],

  notifications: [
    { id: 'notif_1', title: 'Critical Incident Reported', message: 'A new critical incident has been reported for Diego Tan - threatening language toward a classmate.', priority: 'critical', type: 'incident', read: false, created_at: '2026-06-01 09:30', link: '/osas/incidents' },
    { id: 'notif_2', title: 'Referral Response Received', message: 'Department Head has responded to the Academic Dishonesty Investigation referral for Pedro Lim.', priority: 'high', type: 'referral', read: false, created_at: '2026-06-01 08:45', link: '/osas/referrals' },
    { id: 'notif_3', title: 'Sanction Update', message: 'The suspension sanction for Ana Reyes has been completed and marked as fulfilled.', priority: 'moderate', type: 'sanction', read: false, created_at: '2026-05-31 16:20', link: '/osas/sanctions' },
    { id: 'notif_4', title: 'Meeting Scheduled', message: 'Physical Altercation Hearing for Ana Reyes has been scheduled on 2026-06-08 at 14:00.', priority: 'moderate', type: 'meeting', read: false, created_at: '2026-05-31 14:00', link: '/osas/meetings' },
    { id: 'notif_5', title: 'Case Assigned to OSAS', message: 'Incident #INC-2026-001 (Maria Santos) has been assigned to OSAS for review.', priority: 'high', type: 'assignment', read: true, created_at: '2026-05-30 11:15', link: '/osas/incidents' },
    { id: 'notif_6', title: 'Weekly Summary Available', message: 'Weekly incident summary report for Week 22 is now available in Analytics.', priority: 'low', type: 'system', read: true, created_at: '2026-05-29 08:00', link: '/osas/analytics' },
    { id: 'notif_7', title: 'New Referral Received', message: 'Guidance Office has sent a new referral regarding Rosa Garcia - Behavioral Assessment.', priority: 'moderate', type: 'referral', read: true, created_at: '2026-05-29 07:30', link: '/osas/referrals' },
    { id: 'notif_8', title: 'Incident Resolved', message: 'Incident #INC-2026-005 (Carlos Garcia - Chronic Tardiness) has been marked as resolved.', priority: 'low', type: 'incident', read: true, created_at: '2026-05-25 16:45', link: '/osas/incidents' },
    { id: 'notif_9', title: 'Expulsion Case Initiated', message: 'An expulsion sanction process has been initiated for student Diego Tan following threat assessment.', priority: 'critical', type: 'sanction', read: true, created_at: '2026-05-30 10:00', link: '/osas/sanctions' },
    { id: 'notif_10', title: 'System Maintenance Notice', message: 'Scheduled system maintenance on 2026-06-03 from 02:00-04:00. System may be unavailable.', priority: 'low', type: 'system', read: true, created_at: '2026-05-28 12:00', link: null },
    { id: 'notif_11', title: 'Critical Incident Reported', message: 'A new critical incident has been reported for Luis Santos - cyberbullying and harassment.', priority: 'critical', type: 'incident', read: false, created_at: '2026-06-02 10:15', link: '/osas/incidents' },
    { id: 'notif_12', title: 'New Incident Reported', message: 'A new high priority incident has been reported for Kevin Mercado - academic dishonesty.', priority: 'high', type: 'incident', read: false, created_at: '2026-06-01 14:30', link: '/osas/incidents' },
  ],

  users: [
    { id: 1, first_name: 'Admin', last_name: 'User', email: 'admin@school.edu', role_name: 'OSAS', department_name: 'Office of Student Affairs', status: 'active', last_login: '2026-06-01' },
    { id: 2, first_name: 'Maria', last_name: 'Santos', email: 'maria.santos@school.edu', role_name: 'Guidance Office', department_name: 'Guidance Office', status: 'active', last_login: '2026-05-30' },
    { id: 3, first_name: 'John', last_name: 'Doe', email: 'john.doe@school.edu', role_name: 'Chaplain', department_name: 'Chaplain Office', status: 'active', last_login: '2026-05-28' },
    { id: 4, first_name: 'Pedro', last_name: 'Lim', email: 'pedro.lim@school.edu', role_name: 'Department Head', department_name: 'CS Department', status: 'active', last_login: '2026-05-31' },
    { id: 5, first_name: 'Rosa', last_name: 'Garcia', email: 'rosa.garcia@school.edu', role_name: 'Teacher', department_name: 'CS Department', status: 'active', last_login: '2026-05-29' },
    { id: 6, first_name: 'Juan', last_name: 'Dela Cruz', email: 'juan.dc@school.edu', role_name: 'Teacher', department_name: 'IT Department', status: 'inactive', last_login: '2026-04-15' },
    { id: 7, first_name: 'Ana', last_name: 'Reyes', email: 'ana.reyes@school.edu', role_name: 'Department Head', department_name: 'IT Department', status: 'active', last_login: '2026-06-01' },
  ],

  auditLogs: [
    { id: 1, action: 'INCIDENT_CREATED', user: 'Prof. Jose Rizal', role: 'Teacher', target: 'Incident #1 - Maria Santos', details: 'Teacher reported behavioral incident', timestamp: '2026-05-28 09:15:00', ip: '192.168.1.101' },
    { id: 2, action: 'INCIDENT_REVIEWED', user: 'Admin User', role: 'OSAS', target: 'Incident #1 - Maria Santos', details: 'Status changed to Under Review', timestamp: '2026-05-29 10:30:00', ip: '192.168.1.100' },
    { id: 3, action: 'INCIDENT_ASSIGNED', user: 'Admin User', role: 'OSAS', target: 'Incident #1 - Maria Santos', details: 'Assigned to Guidance Office', timestamp: '2026-05-29 10:35:00', ip: '192.168.1.100' },
    { id: 4, action: 'SANCTION_ISSUED', user: 'Admin User', role: 'OSAS', target: 'Sanction #2 - Ana Reyes', details: '3-day suspension issued', timestamp: '2026-05-30 14:20:00', ip: '192.168.1.100' },
    { id: 5, action: 'REFERRAL_SENT', user: 'Admin User', role: 'OSAS', target: 'Referral #2 - Ana Reyes', details: 'Referred to Guidance Office for counseling', timestamp: '2026-05-30 14:25:00', ip: '192.168.1.100' },
    { id: 6, action: 'USER_CREATED', user: 'Admin User', role: 'OSAS', target: 'User - Rosa Garcia', details: 'Created teacher account for CS Department', timestamp: '2026-05-25 08:00:00', ip: '192.168.1.100' },
    { id: 7, action: 'INCIDENT_RESOLVED', user: 'Admin User', role: 'OSAS', target: 'Incident #5 - Carlos Garcia', details: 'Incident resolved after counseling', timestamp: '2026-05-25 16:00:00', ip: '192.168.1.100' },
    { id: 8, action: 'LOGIN', user: 'Admin User', role: 'OSAS', target: 'Session', details: 'User logged in', timestamp: '2026-06-01 07:30:00', ip: '192.168.1.100' },
    { id: 9, action: 'RESPONSE_COMPLETED', user: 'Admin User', role: 'OSAS', target: 'Response #2 - Ana Reyes', details: 'Assessment and recommendation documented', timestamp: '2026-05-31 11:00:00', ip: '192.168.1.100' },
    { id: 10, action: 'SETTINGS_UPDATED', user: 'Admin User', role: 'OSAS', target: 'System Settings', details: 'School year updated to 2025-2026', timestamp: '2026-05-20 09:00:00', ip: '192.168.1.100' },
    { id: 11, action: 'INCIDENT_DISMISSED', user: 'Admin User', role: 'OSAS', target: 'Incident #8 - Isabella Chua', details: 'Case dismissed - medical docs verified', timestamp: '2026-05-22 15:00:00', ip: '192.168.1.100' },
    { id: 12, action: 'SANCTION_COMPLETED', user: 'Guidance Office', role: 'Guidance Office', target: 'Sanction #4 - Rosa Garcia', details: 'Community service completed', timestamp: '2026-05-28 13:00:00', ip: '192.168.1.102' },
  ],

  attachments: (() => {
    const persisted = loadPersistedAttachments();
    return persisted.length > 0 ? persisted : [
      { id: 1, file_name: 'incident_report_001.pdf', file_type: 'application/pdf', file_size: 245000, uploaded_at: '2026-06-01 10:30', uploaded_by: 'Admin User', permission: 'OSAS Only', case_id: 'inc_1' },
      { id: 2, file_name: 'cctv_footage_20260529.mp4', file_type: 'video/mp4', file_size: 15728640, uploaded_at: '2026-06-01 15:45', uploaded_by: 'Admin User', permission: 'OSAS Only', case_id: 'inc_2' },
      { id: 3, file_name: 'statement_witness1.docx', file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', file_size: 32000, uploaded_at: '2026-06-01 09:00', uploaded_by: 'Maria Santos', permission: 'Guidance Office', case_id: 'inc_1' },
      { id: 4, file_name: 'disciplinary_record_2024-0001.pdf', file_type: 'application/pdf', file_size: 182000, uploaded_at: '2026-06-01 14:20', uploaded_by: 'Admin User', permission: 'All Offices', case_id: 'ref_2' },
      { id: 5, file_name: 'parent_consent_form.pdf', file_type: 'application/pdf', file_size: 95000, uploaded_at: '2026-06-01 11:10', uploaded_by: 'Maria Santos', permission: 'Guidance Office', case_id: 'inc_3' },
      { id: 6, file_name: 'screenshot_evidence.png', file_type: 'image/png', file_size: 420000, uploaded_at: '2026-06-01 16:30', uploaded_by: 'Admin User', permission: 'OSAS Only', case_id: 'inc_2' },
    ];
  })(),

  settings: { ...DEFAULT_SETTINGS, ...loadPersistedSettings() },
};

function notify() {
  listeners.forEach(fn => fn());
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function now() {
  const d = new Date();
  return `${today()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function nextId(prefix) {
  return `${prefix}_${Date.now()}`;
}

function parseStudentQuery(query) {
  const match = query.match(/^(.+?)\s*\((\w+)\)\s*$/);
  if (match) {
    return { student_name: match[1].trim(), student_id: match[2] };
  }
  return { student_name: query.trim(), student_id: 'TBD' };
}

export const mockStore = {
  getState() {
    return state;
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  addIncident(incident) {
    const newIncident = {
      id: nextId('inc'),
      status: 'reported',
      date_reported: today(),
      last_updated: today(),
      notes: '',
      assigned_to: null,
      assignment_reason: '',
      student_id: 'TBD',
      ...incident,
    };
    state = { ...state, incidents: [newIncident, ...state.incidents] };
    notify();
    return newIncident;
  },

  updateIncident(id, updates) {
    state = {
      ...state,
      incidents: state.incidents.map(inc =>
        inc.id === id ? { ...inc, ...updates, last_updated: today() } : inc
      ),
    };
    notify();
  },

  addReport(report) {
    const newReport = {
      id: nextId('rpt'),
      status: 'pending',
      date_submitted: today(),
      department: 'CS Department',
      severity: 'moderate',
      ...report,
    };
    state = { ...state, reports: [newReport, ...state.reports] };
    notify();
    return newReport;
  },

  addCase(c) {
    const newCase = {
      id: nextId('case'),
      status: 'open',
      opened_date: today(),
      last_update: today(),
      assigned_to: null,
      ...c,
    };
    state = { ...state, cases: [newCase, ...state.cases] };
    notify();
    return newCase;
  },

  addReferral(referral) {
    const newReferral = {
      id: nextId('ref'),
      status: 'pending',
      date_sent: today(),
      response: null,
      responded_at: null,
      ...referral,
    };
    state = { ...state, referrals: [newReferral, ...state.referrals] };
    notify();
    return newReferral;
  },

  updateReferral(id, updates) {
    state = {
      ...state,
      referrals: state.referrals.map(ref =>
        ref.id === id ? { ...ref, ...updates } : ref
      ),
    };
    notify();
  },

  addSanction(sanction) {
    const newSanction = {
      id: nextId('san'),
      status: 'active',
      date_issued: today(),
      issued_by: 'OSAS',
      duration: null,
      ...sanction,
    };
    state = { ...state, sanctions: [newSanction, ...state.sanctions] };
    notify();
    return newSanction;
  },

  updateSanction(id, updates) {
    state = {
      ...state,
      sanctions: state.sanctions.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ),
    };
    notify();
  },

  addAssessment(assessment) {
    const newAssessment = {
      id: nextId('asmt'),
      status: 'draft',
      assessment: '',
      recommendation: '',
      resolution: '',
      ...assessment,
    };
    state = { ...state, assessments: [newAssessment, ...state.assessments] };
    notify();
    return newAssessment;
  },

  updateAssessment(id, updates) {
    state = {
      ...state,
      assessments: state.assessments.map(a =>
        a.id === id ? { ...a, ...updates } : a
      ),
    };
    notify();
  },

  addMeeting(meeting) {
    const newMeeting = {
      id: nextId('mtg'),
      case_id: `case_${String(state.meetings.length + 1)}`,
      status: 'scheduled',
      minutes: '',
      outcomes: '',
      ...meeting,
    };
    state = { ...state, meetings: [newMeeting, ...state.meetings] };
    notify();
    return newMeeting;
  },

  updateMeeting(id, updates) {
    state = {
      ...state,
      meetings: state.meetings.map(m =>
        m.id === id ? { ...m, ...updates } : m
      ),
    };
    notify();
  },

  addNotification(notification) {
    const newNotification = {
      id: nextId('notif'),
      read: false,
      created_at: now(),
      ...notification,
    };
    state = { ...state, notifications: [newNotification, ...state.notifications] };
    notify();
    return newNotification;
  },

  markNotificationRead(id) {
    state = {
      ...state,
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    };
    notify();
  },

  markAllNotificationsRead() {
    state = {
      ...state,
      notifications: state.notifications.map(n => ({ ...n, read: true })),
    };
    notify();
  },

  createFromTeacherReport({ student_query, incident_type, urgency_level, description }) {
    const { student_name, student_id } = parseStudentQuery(student_query);
    const priority = urgencyToPriority[urgency_level] || 'moderate';

    this.addIncident({
      student_name,
      student_id,
      teacher_name: 'Teacher',
      type: incident_type,
      priority,
      description,
    });

    this.addReport({
      student_name,
      teacher_name: 'Teacher',
      type: incident_type,
      severity: priority,
      description,
    });

    this.addNotification({
      title: 'New Incident Report Received',
      message: `A new ${urgency_level.toLowerCase()} priority incident report has been submitted for ${student_name} - ${incident_type}.`,
      priority: urgency_level === 'Critical' ? 'critical' : urgency_level === 'High' ? 'high' : 'moderate',
      type: 'incident',
      link: '/osas/incidents',
    });

    return { student_name, student_id, description };
  },

  getAllIncidentsForTeacher() {
    return state.incidents.map(inc => ({
      id: inc.id,
      student_name: inc.student_name,
      incident_type: inc.type,
      urgency_level: Object.keys(urgencyToPriority).find(k => urgencyToPriority[k] === inc.priority) || 'Medium',
      current_status: inc.status,
      description: inc.description,
      date_reported: inc.date_reported,
    }));
  },

  addUser(user) {
    const newUser = { id: nextId('usr'), status: 'active', last_login: 'Never', ...user };
    state = { ...state, users: [newUser, ...state.users] };
    notify();
    return newUser;
  },

  updateUser(id, data) {
    state = { ...state, users: state.users.map(u => u.id === id ? { ...u, ...data } : u) };
    notify();
  },

  toggleUserStatus(id) {
    state = { ...state, users: state.users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u) };
    notify();
  },

  addAttachment(attachment) {
    const newAttachment = { id: nextId('att'), uploaded_at: now(), uploaded_by: 'Admin User', case_id: '\u2014', ...attachment };
    state = { ...state, attachments: [newAttachment, ...state.attachments] };
    saveAttachments(state.attachments);
    notify();
    return newAttachment;
  },

  deleteAttachment(id) {
    state = { ...state, attachments: state.attachments.filter(a => a.id !== id) };
    saveAttachments(state.attachments);
    notify();
  },

  addAuditLog(log) {
    const newLog = { id: nextId('log'), timestamp: now(), ...log };
    state = { ...state, auditLogs: [newLog, ...state.auditLogs] };
    notify();
    return newLog;
  },

  updateSettings(settings) {
    state = { ...state, settings: { ...state.settings, ...settings } };
    saveSettings(state.settings);
    notify();
  },

  addIncidentType(type) {
    const newType = { id: nextId('itp'), active: true, ...type };
    state = { ...state, settings: { ...state.settings, incidentTypes: [...state.settings.incidentTypes, newType] } };
    saveSettings(state.settings);
    notify();
    return newType;
  },

  removeIncidentType(id) {
    state = { ...state, settings: { ...state.settings, incidentTypes: state.settings.incidentTypes.filter(t => Number(t.id) !== Number(id) && String(t.id) !== String(id)) } };
    saveSettings(state.settings);
    notify();
  },

  toggleIncidentType(id) {
    state = { ...state, settings: { ...state.settings, incidentTypes: state.settings.incidentTypes.map(t => (Number(t.id) === Number(id) || String(t.id) === String(id)) ? { ...t, active: !t.active } : t) } };
    saveSettings(state.settings);
    notify();
  },

  getSchoolYear() {
    return state.settings.schoolYear;
  },
};

export function parseSchoolYear(schoolYear) {
  const parts = schoolYear.split('-').map(Number);
  if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  return {
    start: new Date(parts[0], 5, 1),
    end: new Date(parts[1], 4, 31, 23, 59, 59, 999),
  };
}

export function isInSchoolYear(dateStr, schoolYear) {
  if (!dateStr || !schoolYear) return true;
  const range = parseSchoolYear(schoolYear);
  if (!range) return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;
  return d >= range.start && d <= range.end;
}

export function filterBySchoolYear(items, schoolYear, dateField) {
  if (!schoolYear || !items) return items || [];
  return (items || []).filter(item => isInSchoolYear(item[dateField], schoolYear));
}

export function getLinkedEntityDate(entityId, state) {
  if (!entityId || entityId === '\u2014') return null;
  const prefix = entityId.split('_')[0];
  if (prefix === 'inc') {
    const item = state.incidents.find(i => i.id === entityId);
    return item ? item.date_reported : null;
  }
  if (prefix === 'case') {
    const item = state.cases.find(c => c.id === entityId);
    return item ? item.opened_date : null;
  }
  if (prefix === 'ref') {
    const item = state.referrals.find(r => r.id === entityId);
    return item ? item.date_sent : null;
  }
  return null;
}

export function filterAttachmentsBySchoolYear(attachments, schoolYear, state) {
  if (!schoolYear || !attachments) return attachments || [];
  return (attachments || []).filter(a => {
    if (!a.case_id || a.case_id === '\u2014') return true;
    const linkedDate = getLinkedEntityDate(a.case_id, state);
    if (!linkedDate) return true;
    return isInSchoolYear(linkedDate, schoolYear);
  });
}


