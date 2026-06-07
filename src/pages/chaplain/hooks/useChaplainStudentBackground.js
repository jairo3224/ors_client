import { useState, useCallback } from 'react';
import api from '../../../services/api';

export function useChaplainStudentBackground() {
  const [background, setBackground] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBackground = useCallback(async (referralId) => {
    setLoading(true);
    try {
      const response = await api.get(`/chaplain/referrals/${referralId}/background`);
      const data = response.data;
      if (data && data.success !== false) {
        setBackground(data.data || data);
      }
    } catch (err) {
      console.error('Failed to load background:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { background, loading, fetchBackground };
}