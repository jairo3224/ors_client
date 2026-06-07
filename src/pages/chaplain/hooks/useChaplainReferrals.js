// src/pages/chaplain/hooks/useChaplainReferrals.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

export function useChaplainReferrals(filter = 'all') {
  const { user } = useAuth();

  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllReferrals = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/chaplain/referrals/all');
      const data = response.data;
      
      if (data && data.success !== false) {
        const referralsList = data.data?.referrals || data.referrals || [];
        setReferrals(Array.isArray(referralsList) ? referralsList : []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch referrals.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAllReferrals();
  }, [fetchAllReferrals]);

  const filteredReferrals = referrals.filter(ref => 
    filter === 'all' ? true : ref.status === filter
  );

  const acceptReferral = useCallback(async (referralId) => {
    try {
      const response = await api.post(`/chaplain/referrals/${referralId}/accept`, {
        acceptedBy: `${user?.first_name} ${user?.last_name}`,
        acceptedDate: new Date().toISOString()
      });
      
      if (response.data) {
        setReferrals(prev => prev.map(ref => 
          ref.id === referralId ? { ...ref, status: 'accepted' } : ref
        ));
        return { success: true };
      }
      return { success: false, error: 'Failed to accept referral' };
    } catch (err) {
      console.error('Failed to accept referral:', err);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, [user]);

  const returnReferral = useCallback(async (referralId, returnForm) => {
    try {
      const response = await api.post(`/chaplain/referrals/${referralId}/return`, {
        reason: returnForm.reason,
        notes: returnForm.notes,
        returnedBy: `${user?.first_name} ${user?.last_name}`,
        returnedDate: new Date().toISOString()
      });
      
      if (response.data) {
        setReferrals(prev => prev.map(ref => 
          ref.id === referralId ? { 
            ...ref, 
            status: 'returned', 
            returnReason: returnForm.reason, 
            returnNotes: returnForm.notes 
          } : ref
        ));
        return { success: true };
      }
      return { success: false, error: 'Failed to return referral' };
    } catch (err) {
      console.error('Failed to return referral:', err);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, [user]);

  return {
    referrals,
    filteredReferrals,
    loading,
    error,
    refetch: fetchAllReferrals,
    acceptReferral,
    returnReferral,
  };
}