import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { osasService } from '../../../services/osasService';

export function useOSASSanctions() {
  const { user } = useAuth();

  const [sanctions, setSanctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSanctions = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await osasService.getSanctions();
      setSanctions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message ?? 'Failed to fetch sanctions.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSanctions();
  }, [fetchSanctions]);

  return { sanctions, loading, error, refetch: fetchSanctions };
}
