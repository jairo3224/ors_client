import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { osasService } from '../../../services/osasService';

export function useOSASIncidents() {
  const { user } = useAuth();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIncidents = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await osasService.getIncidents();
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message ?? 'Failed to fetch incidents.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return { incidents, loading, error, refetch: fetchIncidents };
}
