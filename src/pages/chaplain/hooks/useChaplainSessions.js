// src/pages/chaplain/hooks/useChaplainSessions.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

export function useChaplainSessions(filter = 'all', searchTerm = '') {
  const { user } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [acceptedStudents, setAcceptedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/chaplain/sessions');
      const data = response.data;
      if (data && data.success !== false) {
        const sessionsList = data.data?.sessions || data.sessions || [];
        setSessions(Array.isArray(sessionsList) ? sessionsList : []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch sessions.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchAcceptedStudents = useCallback(async () => {
    try {
      const response = await api.get('/chaplain/accepted-students');
      const data = response.data;
      if (data && data.success !== false) {
        const students = data.data?.students || data.students || [];
        setAcceptedStudents(Array.isArray(students) ? students : []);
      }
    } catch (err) {
      console.error('Failed to fetch accepted students:', err);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchAcceptedStudents();
    loadLocalSessions();
  }, [fetchSessions, fetchAcceptedStudents]);

  const loadLocalSessions = () => {
    const savedSessions = JSON.parse(localStorage.getItem('chaplainSessions') || '[]');
    const completedCancelledIds = JSON.parse(localStorage.getItem('completedCancelledSessions') || '[]');
    if (savedSessions.length > 0) {
      setSessions(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const newSessions = savedSessions.filter(s => 
          !existingIds.has(s.id) && 
          !completedCancelledIds.includes(s.id)
        );
        return [...newSessions, ...prev];
      });
    }
  };

  const markSessionInLocalStorage = useCallback((sessionId, status) => {
    const savedSessions = JSON.parse(localStorage.getItem('chaplainSessions') || '[]');
    const updatedSessions = savedSessions.map(s => 
      s.id === sessionId ? { ...s, status } : s
    );
    localStorage.setItem('chaplainSessions', JSON.stringify(updatedSessions));
    
    const completedOrCancelledIds = JSON.parse(localStorage.getItem('completedCancelledSessions') || '[]');
    if (!completedOrCancelledIds.includes(sessionId)) {
      completedOrCancelledIds.push(sessionId);
      localStorage.setItem('completedCancelledSessions', JSON.stringify(completedOrCancelledIds));
    }
  }, []);

  const scheduleSession = useCallback(async (sessionData) => {
    try {
      const response = await api.post('/chaplain/sessions/schedule', sessionData);
      const data = response.data;
      if (data) {
        await fetchSessions();
        return { success: true };
      }
      return { success: false, error: 'Failed to schedule session' };
    } catch (err) {
      const newSession = {
        id: Date.now().toString(),
        studentName: sessionData.studentName,
        studentId: sessionData.studentId || '',
        date: sessionData.date,
        time: sessionData.time,
        type: sessionData.type || 'individual',
        status: 'upcoming',
        notes: sessionData.notes || ''
      };
      const existingSessions = JSON.parse(localStorage.getItem('chaplainSessions') || '[]');
      existingSessions.push(newSession);
      localStorage.setItem('chaplainSessions', JSON.stringify(existingSessions));
      setSessions(prev => [newSession, ...prev]);
      return { success: true };
    }
  }, [fetchSessions]);

  const cancelSession = useCallback(async (sessionId) => {
    try {
      await api.post(`/chaplain/sessions/${sessionId}/cancel`);
      markSessionInLocalStorage(sessionId, 'cancelled');
      await fetchSessions();
      return { success: true };
    } catch (err) {
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'cancelled' } : s));
      markSessionInLocalStorage(sessionId, 'cancelled');
      return { success: true };
    }
  }, [fetchSessions, markSessionInLocalStorage]);

  const completeSession = useCallback(async (sessionId) => {
    try {
      await api.post(`/chaplain/sessions/${sessionId}/complete`);
      markSessionInLocalStorage(sessionId, 'completed');
      await fetchSessions();
      return { success: true };
    } catch (err) {
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'completed' } : s));
      markSessionInLocalStorage(sessionId, 'completed');
      return { success: true };
    }
  }, [fetchSessions, markSessionInLocalStorage]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      if (filter !== 'all' && session.status !== filter) return false;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        return (
          session.studentName?.toLowerCase().includes(s) ||
          session.studentId?.toLowerCase().includes(s) ||
          session.type?.toLowerCase().includes(s) ||
          session.notes?.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [sessions, filter, searchTerm]);

  // Sort sessions
  const sortedSessions = useMemo(() => {
    return [...filteredSessions].sort((a, b) => {
      if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
      if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
      return new Date(b.date) - new Date(a.date);
    });
  }, [filteredSessions]);

  // Stats
  const stats = useMemo(() => ({
    total: sessions.length,
    upcoming: sessions.filter(s => s.status === 'upcoming').length,
    completed: sessions.filter(s => s.status === 'completed').length,
    cancelled: sessions.filter(s => s.status === 'cancelled').length
  }), [sessions]);

  // Earliest upcoming
  const earliestUpcoming = useMemo(() => {
    return [...sessions]
      .filter(s => s.status === 'upcoming')
      .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time))
      .slice(0, 5);
  }, [sessions]);

  return {
    sessions,
    filteredSessions,
    sortedSessions,
    stats,
    earliestUpcoming,
    acceptedStudents,
    loading,
    error,
    refetch: fetchSessions,
    scheduleSession,
    cancelSession,
    completeSession,
  };
}