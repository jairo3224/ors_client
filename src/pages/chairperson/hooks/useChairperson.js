import api from '../../../services/api';

export function useChairpersonMutations() {
  const addRemark = async (reportId, text) => {
    await api.post(`/chairperson/reports/${reportId}/remark`, { text });
  };

  const forwardToOSAS = async (itemId, type, destination, note) => {
    await api.post(`/chairperson/reports/${itemId}/forward`, { destination, note });
  };

  const respondToInbox = async (referralId, responseText) => {
    await api.post(`/chairperson/inbox/${referralId}/respond`, { responseText });
  };

  return { addRemark, forwardToOSAS, respondToInbox };
}