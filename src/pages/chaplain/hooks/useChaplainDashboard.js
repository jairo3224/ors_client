// src/pages/chaplain/hooks/useChaplainDashboard.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

export function useChaplainDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalReferred: 0,
    activeCounseling: 0,
    completedSessions: 0,
    pendingReferrals: 0,
    casesReturned: 0,
    upcomingSessions: 0,
    unreadNotifications: 0
  });
  const [recentReferrals, setRecentReferrals] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/chaplain/dashboard');
      const data = response.data;
      
      if (data && data.success !== false) {
        const dashboardData = data.data || data;
        setStats(dashboardData.stats || stats);
        setRecentReferrals(dashboardData.recentReferrals || []);
        setUpcomingSessions(dashboardData.upcomingSessions || []);
        setNotifications(dashboardData.notifications || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  useEffect(() => {
    const savedSessions = JSON.parse(localStorage.getItem('chaplainSessions') || '[]');
    const completedCancelledIds = JSON.parse(localStorage.getItem('completedCancelledSessions') || '[]');
    
    if (savedSessions.length > 0) {
      setUpcomingSessions(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const newSessions = savedSessions.filter(s => 
          !existingIds.has(s.id) && 
          s.status === 'upcoming' && 
          !completedCancelledIds.includes(s.id)
        );
        return [...newSessions, ...prev].filter(s => !completedCancelledIds.includes(s.id));
      });
    }
  }, []);

  const acceptReferral = useCallback(async (referralId) => {
    try {
      await api.post(`/chaplain/referrals/${referralId}/accept`, {
        acceptedBy: `${user?.first_name} ${user?.last_name}`,
        acceptedDate: new Date().toISOString()
      });
      
      setRecentReferrals(prev => prev.map(ref => 
        ref.id === referralId ? { ...ref, status: 'accepted' } : ref
      ));
      setStats(prev => ({
        ...prev,
        pendingReferrals: Math.max(0, prev.pendingReferrals - 1),
        activeCounseling: prev.activeCounseling + 1
      }));
      return { success: true };
    } catch (err) {
      console.error('Failed to accept referral:', err);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, [user]);

  const returnReferral = useCallback(async (referralId, returnForm) => {
    try {
      await api.post(`/chaplain/referrals/${referralId}/return`, {
        reason: returnForm.reason,
        notes: returnForm.notes,
        returnedBy: `${user?.first_name} ${user?.last_name}`,
        returnedDate: new Date().toISOString()
      });
      
      setRecentReferrals(prev => prev.map(ref => 
        ref.id === referralId ? { 
          ...ref, 
          status: 'returned', 
          returnReason: returnForm.reason, 
          returnNotes: returnForm.notes 
        } : ref
      ));
      setStats(prev => ({
        ...prev,
        pendingReferrals: Math.max(0, prev.pendingReferrals - 1),
        casesReturned: prev.casesReturned + 1
      }));
      return { success: true };
    } catch (err) {
      console.error('Failed to return referral:', err);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, [user]);

  const cancelSession = useCallback(async (sessionId) => {
    try {
      await api.post(`/chaplain/sessions/${sessionId}/cancel`);
      const completedOrCancelledIds = JSON.parse(localStorage.getItem('completedCancelledSessions') || '[]');
      if (!completedOrCancelledIds.includes(sessionId)) {
        completedOrCancelledIds.push(sessionId);
        localStorage.setItem('completedCancelledSessions', JSON.stringify(completedOrCancelledIds));
      }
      await fetchDashboard();
      return { success: true };
    } catch (err) {
      const completedOrCancelledIds = JSON.parse(localStorage.getItem('completedCancelledSessions') || '[]');
      if (!completedOrCancelledIds.includes(sessionId)) {
        completedOrCancelledIds.push(sessionId);
        localStorage.setItem('completedCancelledSessions', JSON.stringify(completedOrCancelledIds));
      }
      setUpcomingSessions(prev => prev.filter(s => s.id !== sessionId));
      setStats(prev => ({
        ...prev,
        upcomingSessions: Math.max(0, prev.upcomingSessions - 1)
      }));
      return { success: false };
    }
  }, [fetchDashboard]);

  const markNotificationAsRead = useCallback(async (id) => {
    try {
      await api.post(`/chaplain/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setStats(prev => ({ ...prev, unreadNotifications: Math.max(0, prev.unreadNotifications - 1) }));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const sortedUpcomingSessions = useMemo(() => {
    const completedCancelledIds = JSON.parse(localStorage.getItem('completedCancelledSessions') || '[]');
    return [...upcomingSessions]
      .filter(s => s.status === 'upcoming' && !completedCancelledIds.includes(s.id))
      .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
  }, [upcomingSessions]);

  return {
    stats,
    recentReferrals,
    upcomingSessions,
    sortedUpcomingSessions,
    notifications,
    loading,
    error,
    refetch: fetchDashboard,
    acceptReferral,
    returnReferral,
    cancelSession,
    markNotificationAsRead,
  };
}