import { useState, useEffect, useSyncExternalStore } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Send, Inbox, Reply, ArrowRight, Building2 } from 'lucide-react';
import Avatar from '../../../components/Avatar';
import Modal, { ModalHeader, ModalActions } from '../../../components/Modal';
import { mockStore, filterBySchoolYear } from '../../../shared/mockStore';

const OFFICES = ['OSAS', 'Guidance Office', 'Chaplain', 'Department Head'];

function RespondModal({ referral, onClose, onSubmit }) {
  const [text, setText] = useState('');
  if (!referral) return null;
  return (
    <Modal onClose={onClose} maxWidth={500}>
      <ModalHeader onClose={onClose}>Respond to Referral</ModalHeader>
      <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 14px' }}>{referral.subject}</p>
      <div className="modal__context">
        <strong>From:</strong> {referral.from_office}<br />
        <strong>Description:</strong> {referral.description}
      </div>
      <textarea className="textarea" value={text} onChange={e => setText(e.target.value)} placeholder="Type your response..." style={{ minHeight: 100 }} />
      <ModalActions>
        <button className="btn btn--outline" onClick={onClose}>Cancel</button>
        <button className="btn" disabled={!text.trim()} onClick={() => { onSubmit(referral.id, text); onClose(); }}>Send Response</button>
      </ModalActions>
    </Modal>
  );
}

function SendModal({ onClose, onSubmit }) {
  const [studentName, setStudentName] = useState('');
  const [toOffice, setToOffice] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  return (
    <Modal onClose={onClose} maxWidth={520}>
      <ModalHeader onClose={onClose}>Send Referral</ModalHeader>
      <div className="form-group">
        <label className="form-label">Student Name</label>
        <input className="input" style={{ width: '100%', maxWidth: '100%' }} value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="e.g. Juan Dela Cruz" />
      </div>
      <div className="form-group">
        <label className="form-label">Send To</label>
        <div className="forward-options">
          {OFFICES.filter(o => o !== 'OSAS').map(o => (
            <button key={o} onClick={() => setToOffice(o)} className={`forward-option ${toOffice === o ? 'forward-option--selected' : ''}`}>{o}</button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Subject</label>
        <input className="input" style={{ width: '100%', maxWidth: '100%' }} value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Behavioral Assessment Request" />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide context and reason for referral..." />
      </div>
      <ModalActions>
        <button className="btn btn--outline" onClick={onClose}>Cancel</button>
        <button className="btn" disabled={!studentName || !toOffice || !subject} onClick={() => { onSubmit({ studentName, toOffice, subject, description }); onClose(); }}>Send Referral</button>
      </ModalActions>
    </Modal>
  );
}

export default function ReferralsPage() {
  const { user } = useAuth();
  const store = useSyncExternalStore(mockStore.subscribe, () => mockStore.getState());
  const referrals = filterBySchoolYear(store.referrals, store.settings.schoolYear, 'date_sent');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('inbox');
  const [respondTarget, setRespondTarget] = useState(null);
  const [showSend, setShowSend] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const handleRespond = (id, text) => mockStore.updateReferral(id, { status: 'responded', response: text, responded_at: new Date().toISOString().split('T')[0] });
  const handleSend = (data) => {
    mockStore.addReferral({
      student_name: data.studentName,
      student_id: 'TBD',
      from_office: 'OSAS',
      to_office: data.toOffice,
      subject: data.subject,
      description: data.description,
    });
  };

  const inboxItems = referrals.filter(r => r.to_office === 'OSAS');
  const sentItems = referrals.filter(r => r.from_office === 'OSAS');
  const allItems = tab === 'inbox' ? inboxItems : tab === 'sent' ? sentItems : referrals;
  const filtered = allItems.filter(r => `${r.student_name} ${r.subject} ${r.from_office} ${r.to_office}`.toLowerCase().includes(search.toLowerCase()));
  const pendingInbox = inboxItems.filter(r => r.status === 'pending').length;

  if (loading) return <div className="loading">Loading referrals...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1 className="page-title">Referral Management</h1><p className="page-subtitle">Send and receive referrals across all offices.</p></div>
        <button className="btn" onClick={() => setShowSend(true)}><Send size={14} style={{ marginRight: 6 }} />New Referral</button>
      </div>
      {pendingInbox > 0 && <div style={{ background: '#fff3e0', border: '1px solid #ffe0b2', borderRadius: 10, padding: '10px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#e65100' }}><Inbox size={18} /> You have <strong>{pendingInbox}</strong> pending referral{pendingInbox > 1 ? 's' : ''} in your inbox.</div>}
      <div style={{ display: 'flex', borderBottom: '2px solid #e8edf2', marginBottom: 18 }}>
        {['inbox', 'sent', 'all'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="btn btn--sm btn--outline" style={{ borderBottom: tab === t ? '2px solid #1a3a5c' : '2px solid transparent', borderRadius: 0, marginBottom: -2, textTransform: 'capitalize', background: 'transparent', border: 'none', color: tab === t ? '#1a3a5c' : '#64748b', borderBottom: tab === t ? '2px solid #1a3a5c' : '2px solid transparent' }}>
            {t} {t === 'inbox' && pendingInbox > 0 && <span style={{ background: '#c62828', color: '#fff', padding: '1px 7px', borderRadius: 10, fontSize: '0.7rem', marginLeft: 4 }}>{pendingInbox}</span>}
          </button>
        ))}
      </div>
      <div className="filters"><input className="input" placeholder="Search referrals..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(ref => (
          <div key={ref.id} className="card" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div className="report-card__student">
                <Avatar name={ref.student_name} />
                <div>
                  <div className="report-card__name">{ref.student_name}</div>
                  <div className="report-card__meta">{ref.student_id} · {ref.subject}</div>
                </div>
              </div>
              <span className="badge" style={ref.status === 'pending' ? { background: '#fff3e0', color: '#e65100' } : { background: '#e8f5e9', color: '#2e7d32' }}>{ref.status}</span>
            </div>
            <p className="report-card__desc" style={{ marginLeft: 46 }}>{ref.description}</p>
            <div style={{ marginLeft: 46, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.78rem', color: '#64748b', marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Building2 size={13} /> From: <strong style={{ color: '#1a3a5c' }}>{ref.from_office}</strong></span>
              <ArrowRight size={13} /><span>To: <strong style={{ color: '#1a3a5c' }}>{ref.to_office}</strong></span><span>· {ref.date_sent}</span>
            </div>
            {ref.response && <div className="remarks-box" style={{ marginLeft: 46 }}><div className="remarks-box__heading">Response · {ref.responded_at}</div>{ref.response}</div>}
            {tab === 'inbox' && ref.status === 'pending' && <div style={{ marginLeft: 46 }}><button className="btn btn--sm" onClick={() => setRespondTarget(ref)}><Reply size={13} style={{ marginRight: 4 }} />Respond</button></div>}
          </div>
        ))}
        {filtered.length === 0 && <div className="empty-state" style={{ padding: 60 }}>No referrals found.</div>}
      </div>
      {respondTarget && <RespondModal referral={respondTarget} onClose={() => setRespondTarget(null)} onSubmit={handleRespond} />}
      {showSend && <SendModal onClose={() => setShowSend(false)} onSubmit={handleSend} />}
    </div>
  );
}
