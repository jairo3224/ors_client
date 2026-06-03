import { useState, useEffect } from 'react';
import api from '../../../services/api';

export function useCases(deptId) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deptId) return;
    setLoading(true);
    api.get('/chairperson/cases')
      .then(res => {
        const caseItems = res?.data?.data?.cases || [];
        if (caseItems.length === 0) {
          return api.get('/debug/cases')
            .then(r => setCases(r?.data?.data?.cases || []))
            .catch(() => setCases([]));
        }
        setCases(caseItems);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [deptId]);

  return { cases, setCases, loading };
}