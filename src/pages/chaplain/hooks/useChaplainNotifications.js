// src/pages/chaplain/hooks/useChaplainNotifications.js
import { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

export function useChaplainNotifications() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const response = await api.get('/chaplain/notifications');
      const data = response.data;
      
      if (data && data.success !== false) {
        const notificationsList = data.data?.notifications || data.notifications || [];
        setNotifications(Array.isArray(notificationsList) ? notificationsList : []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [user]);

  const fetchCount = useCallback(async () => {
    if (!user) return;

    try {
      const response = await api.get('/chaplain/notifications/count');
      const data = response.data;
      
      if (data && data.success !== false) {
        const count = data.data?.count || data.count || 0;
        setUnreadCount(count);
      }
    } catch (err) {
      console.error('Failed to fetch notification count:', err);
    }
  }, [user]);

  const markAsRead = useCallback(async (id) => {
    try {
      await api.post(`/chaplain/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchCount,
    markAsRead,
  };
}