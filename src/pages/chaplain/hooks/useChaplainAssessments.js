import { useState, useCallback } from 'react';
import api from '../../../services/api';

export function useChaplainAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/chaplain/assessments');
      const data = response.data;
      if (data && data.success !== false) {
        setAssessments(data.data?.assessments || data.assessments || []);
      }
    } catch (err) {
      console.error('Failed to fetch assessments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addAssessment = useCallback(async (data) => {
    try {
      const response = await api.post('/chaplain/assessments', data);
      return response.data;
    } catch (err) {
      console.error('Failed to add assessment:', err);
      return { success: false };
    }
  }, []);

  return { assessments, loading, fetchAssessments, addAssessment };
}