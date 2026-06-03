import { useState, useEffect } from 'react';
import api from '../../../services/api';

export function useInbox(deptId) {
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deptId) return;
    setLoading(true);
    api.get('/chairperson/inbox')
      .then(res => {
        const inboxItems = res?.data?.data?.inbox || [];
        if (inboxItems.length === 0) {
          return api.get('/debug/inbox')
            .then(r => setInbox(r?.data?.data?.inbox || []))
            .catch(() => setInbox([]));
        }
        setInbox(inboxItems);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [deptId]);

  return { inbox, setInbox, loading };
}