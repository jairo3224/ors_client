import { useState, useEffect, useCallback, useMemo } from 'react';
import { mockStore } from '../../../shared/mockStore';

const GUIDANCE_OFFICE = 'Guidance Office';

export function useGuidanceData() {
  const [state, setState] = useState(mockStore.getState());

  useEffect(() => {
    const unsub = mockStore.subscribe(() => {
      setState(mockStore.getState());
    });
    return unsub;
  }, []);

  const referralsToGuidance = useMemo(
    () => state.referrals.filter(r => r.to_office === GUIDANCE_OFFICE),
    [state.referrals]
  );

  const referralsFromGuidance = useMemo(
    () => state.referrals.filter(r => r.from_office === GUIDANCE_OFFICE),
    [state.referrals]
  );

  const incidentsAssignedToGuidance = useMemo(
    () => state.incidents.filter(i => i.assigned_to === GUIDANCE_OFFICE),
    [state.incidents]
  );

  const guidanceCases = useMemo(
    () => state.cases.filter(c => c.assigned_to === GUIDANCE_OFFICE),
    [state.cases]
  );

  const guidanceMeetings = useMemo(
    () => state.meetings.filter(m => m.participants.includes(GUIDANCE_OFFICE)),
    [state.meetings]
  );

  const guidanceAssessments = useMemo(
    () => state.assessments.filter(a => a.assessor === GUIDANCE_OFFICE),
    [state.assessments]
  );

  const guidanceNotifications = useMemo(
    () => state.notifications.filter(n =>
      n.message?.toLowerCase().includes('guidance') ||
      n.type === 'referral'
    ),
    [state.notifications]
  );

  const pendingReferrals = useMemo(
    () => referralsToGuidance.filter(r => r.status === 'pending'),
    [referralsToGuidance]
  );

  const upcomingMeetings = useMemo(
    () => guidanceMeetings.filter(m => m.status === 'scheduled' || m.status === 'in_progress'),
    [guidanceMeetings]
  );

  const openCases = useMemo(
    () => guidanceCases.filter(c => c.status === 'open'),
    [guidanceCases]
  );

  const acceptReferral = useCallback((referralId, responseNote) => {
    mockStore.updateReferral(referralId, {
      status: 'accepted',
      response: responseNote || 'Referral accepted. Guidance Office will handle the case.',
      responded_at: new Date().toISOString().split('T')[0],
    });
  }, []);

  const rejectReferral = useCallback((referralId, responseNote) => {
    mockStore.updateReferral(referralId, {
      status: 'rejected',
      response: responseNote || 'Referral declined.',
      responded_at: new Date().toISOString().split('T')[0],
    });
  }, []);

  const respondWithType = useCallback((referralId, responseType, content) => {
    mockStore.updateReferral(referralId, {
      status: 'responded',
      response_type: responseType,
      response: content,
      responded_at: new Date().toISOString().split('T')[0],
    });
    mockStore.addAssessment({
      student_name: '',
      type: responseType,
      assessor: GUIDANCE_OFFICE,
      assessment: content,
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
    });
  }, []);

  const returnToOSAS = useCallback((referralId, findings) => {
    mockStore.updateReferral(referralId, {
      status: 'responded',
      response: findings,
      responded_at: new Date().toISOString().split('T')[0],
    });
    mockStore.addNotification({
      title: 'Guidance Office Case Findings',
      message: `Guidance Office has returned a case with complete findings: ${findings}`,
      priority: 'high',
      type: 'referral',
      link: '/osas/referrals',
    });
  }, []);

  const referToChaplain = useCallback((referralId, studentName, studentId, subject, description) => {
    mockStore.addReferral({
      student_name: studentName,
      student_id: studentId,
      from_office: GUIDANCE_OFFICE,
      to_office: 'Chaplain',
      subject: subject || 'Spiritual Support Referral',
      description: description || 'Referral from Guidance Office for spiritual counseling.',
    });
  }, []);

  const addSession = useCallback((session) => {
    mockStore.addMeeting({
      ...session,
      participants: [GUIDANCE_OFFICE, ...(session.participants || [])],
    });
  }, []);

  const addAttachment = useCallback((caseId, fileName, fileType, fileSize) => {
    mockStore.addAttachment({
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize || 0,
      uploaded_by: GUIDANCE_OFFICE,
      permission: GUIDANCE_OFFICE,
      case_id: caseId,
    });
  }, []);

  const getStudentHistory = useCallback((studentName) => {
    const s = mockStore.getState();
    return {
      incidents: s.incidents.filter(i =>
        i.student_name.toLowerCase() === studentName.toLowerCase()
      ),
      referrals: s.referrals.filter(r =>
        r.student_name.toLowerCase() === studentName.toLowerCase()
      ),
      meetings: s.meetings.filter(m =>
        m.student_name.toLowerCase() === studentName.toLowerCase()
      ),
      assessments: s.assessments.filter(a =>
        a.student_name.toLowerCase() === studentName.toLowerCase()
      ),
      sanctions: s.sanctions.filter(sn =>
        sn.student_name.toLowerCase() === studentName.toLowerCase()
      ),
    };
  }, []);

  const getRelatedIncidents = useCallback((studentName) => {
    const s = mockStore.getState();
    return s.incidents.filter(i =>
      i.student_name.toLowerCase() === studentName.toLowerCase()
    );
  }, []);

  const getRelatedAttachments = useCallback((caseId) => {
    const s = mockStore.getState();
    return s.attachments.filter(a => a.case_id === caseId);
  }, []);

  const isLoading = false;

  return {
    referralsToGuidance,
    referralsFromGuidance,
    incidentsAssignedToGuidance,
    guidanceCases,
    guidanceMeetings,
    guidanceAssessments,
    guidanceNotifications,
    pendingReferrals,
    upcomingMeetings,
    openCases,
    pendingReferralCount: pendingReferrals.length,
    openCasesCount: openCases.length,
    upcomingMeetingsCount: upcomingMeetings.length,
    totalReferralsCount: referralsToGuidance.length,
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
    isLoading,
    allReferrals: state.referrals,
    allIncidents: state.incidents,
    allMeetings: state.meetings,
    allAssessments: state.assessments,
    allNotifications: state.notifications,
    allAttachments: state.attachments,
    allSanctions: state.sanctions,
  };
}
