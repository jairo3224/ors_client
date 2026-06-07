import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { osasService } from '../../../services/osasService';

export function useOSASAttachments() {
  const { user } = useAuth();

  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttachments = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await osasService.getAttachments();
      setAttachments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message ?? 'Failed to fetch attachments.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  return { attachments, loading, error, refetch: fetchAttachments };
}
