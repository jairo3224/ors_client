import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import './components/CasesPage.css';

const STATUS_CLASS = { open: 'badge--open', referred: 'badge--referred', closed: 'badge--closed' };
const PRIORITY_CLASS = { low: 'priority--low', medium: 'priority--medium', high: 'priority--high' };

export default function CasesPage() {
  const { cases, setForwardTarget, setForwardType, user } = useOutletContext();
  const [filter, setFilter] = useState('all');

  const filtered = cases.filter(c => filter === 'all' || c.status === filter || c.priority === filter);

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <h1 className="page-title">🗂️ Cases</h1>
            <p className="page-subtitle">
              {user?.department_name || 'Department'} ·{' '}
              {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <div className="filters">
        <select className="select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Cases</option>
          <option value="open">Open</option>
          <option value="referred">Referred</option>
          <option value="closed">Closed</option>
          <option value="high">High Priority</option>
        </select>
      </div>

      {filtered.map(c => (
        <div key={c.id} className={`card case-card ${PRIORITY_CLASS[c.priority]}`}>
          <div className="case-card__header">
            <div>
              <span className="case-card__title">{c.title}</span>
              <span className={`priority-label ${PRIORITY_CLASS[c.priority]}`}>● {c.priority} priority</span>
            </div>
            <span className={`badge ${STATUS_CLASS[c.status]}`}>{c.status}</span>
          </div>
          <div className="case-card__meta">
            <span><strong>Type:</strong> {c.type}</span>
            {c.assigned_to && <span><strong>Referred to:</strong> {c.assigned_to}</span>}
            <span><strong>Last update:</strong> {c.last_update}</span>
          </div>
          {c.notes && <p className="case-card__notes">{c.notes}</p>}

          {c.status === 'open' && (
            <div className="case-card__actions">
              <button
                className="btn btn--sm btn--warning"
                onClick={() => { setForwardTarget(c); setForwardType('case'); }}
              >
                Refer to OSAS
              </button>
            </div>
          )}
        </div>
      ))}
      {filtered.length === 0 && <div className="card empty-state">No cases found.</div>}
    </div>
  );
}