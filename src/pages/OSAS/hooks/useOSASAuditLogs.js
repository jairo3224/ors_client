import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { osasService } from '../../../services/osasService';

export function useOSASAuditLogs() {
  const { user } = useAuth();

  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAuditLogs = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await osasService.getAuditLogs();
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message ?? 'Failed to fetch audit logs.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  return { auditLogs, loading, error, refetch: fetchAuditLogs };
}
