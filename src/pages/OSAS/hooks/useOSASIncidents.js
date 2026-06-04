import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { mockStore, filterBySchoolYear } from '../../../shared/mockStore';

export function useOSASIncidents() {
  const store = useSyncExternalStore(mockStore.subscribe, () => mockStore.getState());
  const incidents = filterBySchoolYear(store.incidents, store.settings.schoolYear, 'date_reported');

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const filteredIncidents = useMemo(() => {
    return incidents.filter(i => {
      const matchSearch = `${i.student_name} ${i.teacher_name} ${i.type}`.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || i.status === filterStatus;
      const matchPriority = filterPriority === 'all' || i.priority === filterPriority;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [incidents, search, filterStatus, filterPriority]);

  const stats = useMemo(() => ({
    total: incidents.length,
    reported: incidents.filter(i => i.status === 'reported').length,
    underReview: incidents.filter(i => i.status === 'under_review' || i.status === 'investigating').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
    critical: incidents.filter(i => i.priority === 'critical').length,
  }), [incidents]);

  const updateStatus = (id, newStatus) => mockStore.updateIncident(id, { status: newStatus });
  const assignIncident = (id, office, reason) => mockStore.updateIncident(id, { assigned_to: office, assignment_reason: reason, status: 'forwarded' });
  const saveIncidentNote = (id, note) => mockStore.updateIncident(id, { notes: note });

  return {
    loading,
    incidents,
    filteredIncidents,
    stats,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    updateStatus,
    assignIncident,
    saveIncidentNote,
  };
}
