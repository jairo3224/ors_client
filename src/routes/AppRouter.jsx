// src/routes/AppRouter.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, ROLES }    from '../context/AuthContext';
import ProtectedRoute         from './ProtectedRoute';

// Auth pages
import LoginPage              from '../pages/auth/LoginPage';

// Role dashboards
import OsasDashboard          from '../pages/OSAS/Dashboard';
import GuidanceDashboard      from '../pages/guidance/Dashboard';
import ChaplainDashboard      from '../pages/chaplain/Dashboard';
import ChairpersonDashboard   from '../pages/chairperson/Dashboard';
import TeacherDashboard       from '../pages/teacher/Dashboard';

// OSAS sub-pages
import OsasOverviewPage      from '../pages/OSAS/pages/OverviewPage';
import IncidentsPage          from '../pages/OSAS/pages/IncidentsPage';
import ReferralsPage          from '../pages/OSAS/pages/ReferralsPage';
import SanctionsPage          from '../pages/OSAS/pages/SanctionsPage';
import ResponsePage           from '../pages/OSAS/pages/ResponsePage';
import MeetingsPage           from '../pages/OSAS/pages/MeetingsPage';
import AnalyticsPage          from '../pages/OSAS/pages/AnalyticsPage';
import UsersPage              from '../pages/OSAS/pages/UsersPage';
import SettingsPage           from '../pages/OSAS/pages/SettingsPage';
import AuditLogPage           from '../pages/OSAS/pages/AuditLogPage';
import AttachmentsPage        from '../pages/OSAS/pages/AttachmentsPage';

// Chaplain sub-pages
import ChaplainReferrals      from '../pages/chaplain/Referrals';
import ChaplainSessions       from '../pages/chaplain/Sessions';

// Chairperson sub-pages
import OverviewPage           from '../pages/chairperson/OverviewPage';
import StudentsPage           from '../pages/chairperson/StudentsPage';
import ReportsPage            from '../pages/chairperson/ReportsPage';
import CasesPage              from '../pages/chairperson/CasesPage';
import InboxPage              from '../pages/chairperson/InboxPage';

// Guidance sub-pages
import GuidanceOverviewPage      from '../pages/guidance/pages/OverviewPage';
import GuidanceReferralInboxPage  from '../pages/guidance/pages/ReferralInboxPage';
import GuidanceSessionsPage      from '../pages/guidance/pages/CounselingSessionsPage';
import GuidanceCaseTimelinePage  from '../pages/guidance/pages/CaseTimelinePage';
import GuidanceNotificationsPage from '../pages/guidance/pages/NotificationsPage';
import GuidanceStudentProfilePage from '../pages/guidance/pages/StudentProfilePage';

// Teacher sub-pages
import TeacherClassesPage     from '../pages/teacher/pages/ClassesPage';
import TeacherRosterPage      from '../pages/teacher/pages/RosterPage';
import TeacherReportPage      from '../pages/teacher/pages/ReportPage';
import TeacherReportsPage     from '../pages/teacher/pages/ReportsPage';
import TeacherSearchPage      from '../pages/teacher/pages/SearchPage';

import UnauthorizedPage       from '../pages/auth/UnauthorizedPage';

function RoleRedirect() {
  const { user } = useAuth();

  const roleRoutes = {
    [ROLES.OSAS]:            '/osas',
    [ROLES.GUIDANCE]:        '/guidance',
    [ROLES.CHAPLAIN]:        '/chaplain',
    [ROLES.DEPARTMENT_HEAD]: '/chairperson',
    [ROLES.TEACHER]:         '/teacher',
  };

  const destination = roleRoutes[user?.role_name] || '/login';
  return <Navigate to={destination} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Public */}
        <Route path="/login"        element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Root → role-based redirect */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RoleRedirect />
            </ProtectedRoute>
          }
        />

        {/* OSAS */}
        <Route
          path="/osas/*"
          element={
            <ProtectedRoute roles={[ROLES.OSAS]}>
              <OsasDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<OsasOverviewPage />} />
          <Route path="incidents" element={<IncidentsPage />} />
          <Route path="referrals" element={<ReferralsPage />} />
          <Route path="sanctions" element={<SanctionsPage />} />
          <Route path="response" element={<ResponsePage />} />
          <Route path="meetings" element={<MeetingsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="audit" element={<AuditLogPage />} />
          <Route path="attachments" element={<AttachmentsPage />} />
          <Route path="*" element={<Navigate to="/osas" replace />} />
        </Route>

        {/* Guidance */}
        <Route
          path="/guidance/*"
          element={
            <ProtectedRoute roles={[ROLES.GUIDANCE]}>
              <GuidanceDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<GuidanceOverviewPage />} />
          <Route path="referrals" element={<GuidanceReferralInboxPage />} />
          <Route path="sessions" element={<GuidanceSessionsPage />} />
          <Route path="cases" element={<GuidanceCaseTimelinePage />} />
          <Route path="notifications" element={<GuidanceNotificationsPage />} />
          <Route path="student/:studentName" element={<GuidanceStudentProfilePage />} />
          <Route path="*" element={<Navigate to="/guidance" replace />} />
        </Route>

        {/* Chaplain - Layout wrapper with nested routes */}
        <Route
          path="/chaplain"
          element={
            <ProtectedRoute roles={[ROLES.CHAPLAIN]}>
              <ChaplainDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={null} />
          <Route path="referrals" element={<ChaplainReferrals />} />
          <Route path="sessions" element={<ChaplainSessions />} />
        </Route>

        {/* Department Head / Chairperson */}
        <Route
          path="/chairperson"
          element={
            <ProtectedRoute roles={[ROLES.DEPARTMENT_HEAD]}>
              <ChairpersonDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="cases" element={<CasesPage />} />
          <Route path="inbox" element={<InboxPage />} />
        </Route>

        {/* Teacher */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute roles={[ROLES.TEACHER]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="classes" replace />} />
          <Route path="classes" element={<TeacherClassesPage />} />
          <Route path="roster/:classId" element={<TeacherRosterPage />} />
          <Route path="report" element={<TeacherReportPage />} />
          <Route path="report/:studentId" element={<TeacherReportPage />} />
          <Route path="reports" element={<TeacherReportsPage />} />
          <Route path="search" element={<TeacherSearchPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}