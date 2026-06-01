import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

function Avatar({ name }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return <div className="avatar">{initials}</div>;
}

const STATUS_CLASS = {
  pending: 'badge--pending',
  responded: 'badge--closed',
};

export default function InboxPage() {
  const { inbox, handleInboxResponse, user } = useOutletContext();
  const [respondTarget, setRespondTarget] = useState(null);

  const pendingCount = inbox.filter(i => i.status === 'pending').length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📥 Referral Inbox</h1>
        <p className="page-subtitle">
          {user?.department_name || 'Department'} ·{' '}
          {new Date().toLocaleDateString('en-PH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {pendingCount > 0 && (
        <div
          style={{
            background: '#fff8e1',
            borderLeft: '4px solid #f57f17',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 18,
            fontWeight: 500,
            color: '#1a3a5c',
          }}
        >
          You have {pendingCount} pending referral{pendingCount > 1 ? 's' : ''} from OSAS.
        </div>
      )}

      {inbox.map(item => (
        <div key={item.id} className="card report-card" style={{ borderLeft: '4px solid #1565c0' }}>
          <div className="report-card__header">
            <div className="report-card__student">
              <Avatar name={item.student_name} />
              <div>
                <div className="report-card__name">{item.student_name}</div>
                <div className="report-card__meta">
                  From: {item.from_office} · {item.subject}
                </div>
              </div>
            </div>
            <div className="report-card__labels">
              <span className={`badge ${STATUS_CLASS[item.status]}`}>
                {item.status}
              </span>
              <span className="report-card__date">{item.date_received}</span>
            </div>
          </div>

          <p className="report-card__desc">{item.description}</p>

          {item.response && (
            <div className="remarks-box" style={{ background: '#e8f5e9' }}>
              <div className="remarks-box__heading" style={{ color: '#2e7d32' }}>
                YOUR RESPONSE
              </div>
              <div style={{ fontSize: '0.85rem', color: '#1a3a5c' }}>{item.response}</div>
            </div>
          )}

          {item.status === 'pending' && (
            <div className="report-card__actions">
              <button
                className="btn btn--sm btn--success"
                onClick={() => setRespondTarget(item)}
              >
                Respond with Assessment
              </button>
            </div>
          )}
        </div>
      ))}

      {inbox.length === 0 && (
        <div className="card empty-state">No referrals from OSAS yet.</div>
      )}

      {/* Respond Modal */}
      {respondTarget && (
        <div
          className="modal"
          onClick={e => e.target === e.currentTarget && setRespondTarget(null)}
        >
          <div className="modal__box">
            <div className="modal__header">
              <h3>Academic Impact Assessment</h3>
              <button
                className="modal__close"
                onClick={() => setRespondTarget(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal__context">
              <strong>{respondTarget.student_name}</strong> · {respondTarget.subject}
            </div>

            <div className="form-group">
              <label className="form-label">
                Assessment & Recommendation
              </label>
              <textarea
                className="textarea"
                placeholder="Describe the academic impact and your recommendation..."
                value={respondTarget._responseText || ''}
                onChange={e =>
                  setRespondTarget({
                    ...respondTarget,
                    _responseText: e.target.value,
                  })
                }
              />
            </div>

            <div className="modal__actions">
              <button
                className="btn btn--outline"
                onClick={() => setRespondTarget(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn--success"
                disabled={!respondTarget._responseText?.trim()}
                onClick={() => {
                  handleInboxResponse(respondTarget.id, respondTarget._responseText);
                  setRespondTarget(null);
                }}
              >
                Submit Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}