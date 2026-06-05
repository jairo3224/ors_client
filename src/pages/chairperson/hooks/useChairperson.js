import api from '../../../services/api';

export function useChairpersonMutations() {
  const addRemark = async (reportId, text, responseType = 'remark') => {
    await api.post(`/chairperson/reports/${reportId}/remark`, { text, response_type: responseType });
  };

  const forwardToOSAS = async (itemId, type, destination, note) => {
    await api.post(`/chairperson/reports/${itemId}/forward`, { destination, note });
  };

  const acceptReferral = async (referralId) => {
    await api.post(`/chairperson/inbox/${referralId}/accept`);
  };

  const rejectReferral = async (referralId, reason) => {
    await api.post(`/chairperson/inbox/${referralId}/reject`, { reason });
  };

  const respondToInbox = async (referralId, responseText, responseType = 'assessment') => {
    await api.post(`/chairperson/inbox/${referralId}/respond`, { responseText, responseType });
  };

  return { addRemark, forwardToOSAS, acceptReferral, rejectReferral, respondToInbox };
}