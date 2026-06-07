// src/pages/chaplain/hooks/useChaplainProfile.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

export function useChaplainProfile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/auth/me');
      if (response.data) {
        setProfile(response.data.user || response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch chaplain profile.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
}