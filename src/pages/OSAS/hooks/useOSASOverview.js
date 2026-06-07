import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { osasService } from '../../../services/osasService';

export function useOSASOverview() {
  const { user } = useAuth();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOverview = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await osasService.getOverview();
      setOverview(data ?? {});
    } catch (err) {
      setError(err.message ?? 'Failed to fetch overview.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { overview, loading, error, refetch: fetchOverview };
}
