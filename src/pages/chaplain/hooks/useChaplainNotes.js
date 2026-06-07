import { useState, useCallback } from 'react';
import api from '../../../services/api';

export function useChaplainNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async (sessionId) => {
    setLoading(true);
    try {
      const response = await api.get(`/chaplain/sessions/${sessionId}/notes`);
      const data = response.data;
      if (data && data.success !== false) {
        setNotes(data.data?.notes || data.notes || []);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addNote = useCallback(async (data) => {
    try {
      const response = await api.post('/chaplain/notes', data);
      return response.data;
    } catch (err) {
      console.error('Failed to add note:', err);
      return { success: false };
    }
  }, []);

  return { notes, loading, fetchNotes, addNote };
}