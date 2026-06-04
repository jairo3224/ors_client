import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { mockStore, filterBySchoolYear } from '../../../shared/mockStore';

export function useOSASReferrals() {
  const store = useSyncExternalStore(mockStore.subscribe, () => mockStore.getState());
  const referrals = filterBySchoolYear(store.referrals, store.settings.schoolYear, 'date_sent');

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('inbox');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const inboxItems = useMemo(() => referrals.filter(r => r.to_office === 'OSAS'), [referrals]);
  const sentItems = useMemo(() => referrals.filter(r => r.from_office === 'OSAS'), [referrals]);

  const allItems = tab === 'inbox' ? inboxItems : tab === 'sent' ? sentItems : referrals;

  const filteredReferrals = useMemo(() => {
    return allItems.filter(r =>
      `${r.student_name} ${r.subject} ${r.from_office} ${r.to_office}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [allItems, search]);

  const pendingInbox = useMemo(() => inboxItems.filter(r => r.status === 'pending').length, [inboxItems]);

  const respondReferral = (id, responseText) => mockStore.updateReferral(id, { status: 'responded', response: responseText, responded_at: new Date().toISOString().split('T')[0] });

  const sendReferral = (data) => {
    mockStore.addReferral({
      student_name: data.studentName,
      student_id: 'TBD',
      from_office: 'OSAS',
      to_office: data.toOffice,
      subject: data.subject,
      description: data.description,
    });
  };

  return {
    loading,
    referrals,
    tab,
    setTab,
    search,
    setSearch,
    filteredReferrals,
    pendingInbox,
    respondReferral,
    sendReferral,
  };
}
