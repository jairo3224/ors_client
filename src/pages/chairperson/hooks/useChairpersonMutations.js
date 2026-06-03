import api from '../../../services/api';

export function useChairpersonMutations() {
  const addRemark = async (reportId, text) => {
    await api.post(`/chairperson/reports/${reportId}/remark`, { text });
  };

  const forwardToOSAS = async (itemId, type) => {
    // type 'case' or 'report' both use same forward endpoint for now
    await api.post(`/chairperson/reports/${itemId}/forward`);
  };

  const respondToInbox = async (referralId, responseText) => {
    await api.post(`/chairperson/inbox/${referralId}/respond`, { responseText });
  };

  return { addRemark, forwardToOSAS, respondToInbox };
}