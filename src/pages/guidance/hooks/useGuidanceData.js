import { useState, useEffect, useCallback } from 'react';
import { guidanceService } from '../../../services/guidanceService';

export function useGuidanceData() {
  const [data, setData] = useState({
    referralsToGuidance: [],
    referralsFromGuidance: [],
    incidentsAssignedToGuidance: [],
    guidanceCases: [],
    guidanceMeetings: [],
    guidanceAssessments: [],
    guidanceNotifications: [],
    allReferrals: [],
    allIncidents: [],
    allMeetings: [],
    allAssessments: [],
    allNotifications: [],
    allSanctions: [],
    isLoading: true,
    error: null,
  });

  const merge = useCallback((partial) => {
    setData(prev => ({ ...prev, ...partial }));
  }, []);

  const fetchAll = useCallback(async () => {
    merge({ isLoading: true, error: null });
    try {
      const [inbox, sent, incidents, responses, notifications] = await Promise.all([
        guidanceService.getInbox(),
        guidanceService.getSent(),
        guidanceService.getIncidents(),
        guidanceService.getResponses(),
        guidanceService.getNotifications(),
      ]);

      const referralsToGuidance = inbox;
      const referralsFromGuidance = sent;
      const incidentsAssignedToGuidance = incidents.assigned;
      const allIncidents = incidents.all;
      const guidanceMeetings = responses.meetings;
      const guidanceAssessments = responses.assessments;
      const guidanceNotifications = notifications;

      const guidanceCases = incidentsAssignedToGuidance.map(inc => ({
        id: inc.id,
        student_name: inc.student_name,
        title: inc.type,
        type: inc.type,
        status: inc.status === 'resolved' || inc.status === 'closed' ? 'closed' : 'open',
        priority: inc.priority === 'critical' ? 'high' : inc.priority,
        assigned_to: 'Guidance Office',
        opened_date: inc.date_reported,
        last_update: inc.last_updated,
        notes: inc.description,
      }));

      merge({
        referralsToGuidance,
        referralsFromGuidance,
        incidentsAssignedToGuidance,
        guidanceCases,
        guidanceMeetings,
        guidanceAssessments,
        guidanceNotifications,
        allReferrals: [...referralsToGuidance, ...referralsFromGuidance],
        allIncidents,
        allMeetings: guidanceMeetings,
        allAssessments: guidanceAssessments,
        allNotifications: guidanceNotifications,
        allSanctions: [],
        isLoading: false,
      });
    } catch (err) {
      merge({ isLoading: false, error: err.message || 'Failed to load data.' });
    }
  }, [merge]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const pendingReferrals = data.referralsToGuidance.filter(r => r.status === 'pending');
  const upcomingMeetings = data.guidanceMeetings;
  const openCases = data.guidanceCases.filter(c => c.status === 'open');

  const acceptReferral = useCallback(async (referralId) => {
    await guidanceService.acceptReferral(referralId);
    fetchAll();
  }, [fetchAll]);

  const rejectReferral = useCallback(async (referralId, responseNote) => {
    await guidanceService.rejectReferral(referralId, responseNote || 'Referral declined.');
    fetchAll();
  }, [fetchAll]);

  const respondWithType = useCallback(async (referralId, responseType, content) => {
    await guidanceService.respondToReferral(referralId, content, responseType);
    fetchAll();
  }, [fetchAll]);

  const returnToOSAS = useCallback(async (referralId, findings) => {
    await guidanceService.returnToOSAS(referralId, findings);
    fetchAll();
  }, [fetchAll]);

  const referToChaplain = useCallback(async (referralId, studentName, studentId, subject, description) => {
    await guidanceService.referToChaplain(referralId, {
      student_name: studentName,
      student_id: studentId,
      subject: subject || 'Spiritual Support Referral',
      description: description || 'Referral from Guidance Office for spiritual counseling.',
    });
    fetchAll();
  }, [fetchAll]);

  const addSession = useCallback(async (session) => {
    await guidanceService.createSession(session);
    fetchAll();
  }, [fetchAll]);

  const addAttachment = useCallback(async (caseId, fileName, fileType, fileSize) => {
    await guidanceService.addAttachment(caseId, fileName, fileType, fileSize);
    fetchAll();
  }, [fetchAll]);

  const getStudentHistory = useCallback(async (studentName) => {
    try {
      const students = await guidanceService.searchStudents(studentName);
      if (students.length === 0) {
        return { incidents: [], referrals: [], meetings: [], assessments: [], sanctions: [] };
      }
      const student = students[0];
      const history = await guidanceService.getStudentHistory(student.id);
      return {
        incidents: (history.incidents ?? []).map(inc => ({
          ...inc,
          id: String(inc.id),
          priority: inc.urgency_level || 'medium',
          date_reported: inc.date_reported,
          assigned_to: inc.assigned_to || '',
        })),
        referrals: (history.referrals ?? []).map(ref => ({
          ...ref,
          id: String(ref.id),
          from_office: ref.from_office,
          to_office: ref.to_office,
          date_sent: ref.date_sent,
          response: ref.response,
          subject: ref.subject || 'Referral',
        })),
        meetings: [],
        assessments: (history.responses ?? []).map(r => ({
          id: String(r.id),
          student_name: studentName,
          type: r.response_type,
          assessor: r.author,
          status: 'completed',
          assessment: r.remarks,
          recommendation: '',
          date: r.date,
        })),
        sanctions: [],
      };
    } catch {
      return { incidents: [], referrals: [], meetings: [], assessments: [], sanctions: [] };
    }
  }, []);

  const getRelatedIncidents = useCallback(async (studentName) => {
    try {
      const students = await guidanceService.searchStudents(studentName);
      if (students.length === 0) return [];
      const history = await guidanceService.getStudentHistory(students[0].id);
      return (history.incidents ?? []).map(inc => ({
        ...inc,
        id: String(inc.id),
        priority: inc.urgency_level || 'medium',
        date_reported: inc.date_reported,
      }));
    } catch {
      return [];
    }
  }, []);

  const getRelatedAttachments = useCallback(async () => {
    return [];
  }, []);

  return {
    ...data,
    pendingReferrals,
    upcomingMeetings,
    openCases,
    pendingReferralCount: pendingReferrals.length,
    openCasesCount: openCases.length,
    upcomingMeetingsCount: upcomingMeetings.length,
    totalReferralsCount: data.referralsToGuidance.length,
    acceptReferral,
    rejectReferral,
    respondWithType,
    returnToOSAS,
    referToChaplain,
    addSession,
    addAttachment,
    getStudentHistory,
    getRelatedIncidents,
    getRelatedAttachments,
    refetch: fetchAll,
  };
}
