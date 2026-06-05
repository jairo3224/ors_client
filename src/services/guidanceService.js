import api from './api';

const transformReferral = (ref) => ({
  ...ref,
  id: String(ref.id),
  incident_id: String(ref.incident_id),
});

const transformIncident = (inc) => ({
  ...inc,
  id: String(inc.id),
  student_id: String(inc.student_id),
});

const transformMeeting = (m) => ({
  ...m,
  id: String(m.id),
  incident_id: String(m.incident_id),
  participants: ['Guidance Office'],
  status: 'completed',
  minutes: m.assessment || '',
  outcomes: '',
});

const transformAssessment = (a) => ({
  ...a,
  id: String(a.id),
  incident_id: String(a.incident_id),
  assessor: 'Guidance Office',
  status: 'completed',
  assessment: a.assessment || '',
  recommendation: '',
});

const transformNotification = (n) => ({
  ...n,
  id: String(n.id),
  read: Boolean(n.read),
});

export const guidanceService = {
  getOverview: async () => {
    const res = await api.get('/guidance/overview');
    return res.data.data;
  },

  getInbox: async () => {
    const res = await api.get('/guidance/inbox');
    return (res.data.data?.referrals ?? []).map(transformReferral);
  },

  getSent: async () => {
    const res = await api.get('/guidance/sent');
    return (res.data.data?.referrals ?? []).map(transformReferral);
  },

  getIncidents: async () => {
    const res = await api.get('/guidance/incidents');
    const data = res.data.data ?? {};
    return {
      assigned: (data.assigned ?? []).map(transformIncident),
      all: (data.all ?? []).map(transformIncident),
    };
  },

  getResponses: async () => {
    const res = await api.get('/guidance/responses');
    const data = res.data.data ?? {};
    return {
      meetings: (data.meetings ?? []).map(transformMeeting),
      assessments: (data.assessments ?? []).map(transformAssessment),
    };
  },

  getNotifications: async () => {
    const res = await api.get('/guidance/notifications');
    return (res.data.data?.notifications ?? []).map(transformNotification);
  },

  getStudentHistory: async (studentId) => {
    const res = await api.get(`/guidance/students/history?student_id=${studentId}`);
    return res.data.data;
  },

  searchStudents: async (keyword) => {
    const res = await api.get(`/guidance/students/search?q=${encodeURIComponent(keyword)}`);
    return res.data.data?.students ?? [];
  },

  acceptReferral: async (referralId) => {
    const res = await api.post(`/guidance/referrals/${referralId}/accept`);
    return res.data;
  },

  rejectReferral: async (referralId, reason) => {
    const res = await api.post(`/guidance/referrals/${referralId}/reject`, { reason });
    return res.data;
  },

  respondToReferral: async (referralId, responseText, responseType) => {
    const res = await api.post(`/guidance/referrals/${referralId}/respond`, {
      responseText,
      responseType,
    });
    return res.data;
  },

  returnToOSAS: async (referralId, findings) => {
    const res = await api.post(`/guidance/referrals/${referralId}/return-to-osas`, { findings });
    return res.data;
  },

  referToChaplain: async (referralId, data) => {
    const res = await api.post(`/guidance/referrals/${referralId}/refer-to-chaplain`, data);
    return res.data;
  },

  createSession: async (session) => {
    const res = await api.post('/guidance/sessions', session);
    return res.data;
  },

  addAttachment: async (incidentId, fileName, fileType, fileSize) => {
    const res = await api.post('/guidance/attachments', {
      incident_id: incidentId,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
    });
    return res.data;
  },

  markNotificationRead: async (notifId) => {
    const res = await api.post(`/guidance/notifications/${notifId}/read`);
    return res.data;
  },
};
