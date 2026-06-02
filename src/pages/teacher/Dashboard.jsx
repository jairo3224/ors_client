import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from '../../components/common/Footer';
import { Outlet } from 'react-router-dom';
import { useTeacherIncidents } from './hooks/useTeacherIncidents';
import { incidentService } from '../../services/incidentService';
import './components/Dashboard.css';

export default function TeacherDashboard() {
  const location = useLocation();
  const { incidents: myIncidents, pendingCount, loading, refetch: loadMyIncidents } = useTeacherIncidents();
  const [showSuccess, setShowSuccess] = useState(false);
  const [forwardTarget, setForwardTarget] = useState(null);

  // Determine current page for navbar highlight
  const getCurrentView = () => {
    const path = location.pathname;
    if (path.includes('/classes')) return 'classes';
    if (path.includes('/roster')) return 'classes';
    if (path.includes('/report')) return 'report';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/search')) return 'search';
    return 'classes';
  };

  return (
    <div className="dashboard-body">
      {showSuccess && <SuccessBanner onDismiss={() => setShowSuccess(false)} />}

      <Navbar
        activeView={getCurrentView()}
        pendingCount={pendingCount}
      />

      <main className="main-content">
        <Outlet context={{ 
          myIncidents, 
          loading, 
          loadMyIncidents,
          showSuccess,
          setShowSuccess,
          setForwardTarget
        }} />
      </main>

      <ForwardModal
        item={forwardTarget}
        onClose={() => setForwardTarget(null)}
        onForwarded={() => loadMyIncidents()}
      />

      <Footer />
    </div>
  );
}

function ForwardModal({ item, onClose, onForwarded }) {
  const [destination, setDestination] = useState('');
  const [note, setNote] = useState('');
  const [forwarding, setForwarding] = useState(false);
  const [error, setError] = useState(null);
  if (!item) return null;

  const handleForward = async () => {
    if (!destination) return;
    setForwarding(true);
    setError(null);
    try {
      await incidentService.referIncident(item.id, destination, note.trim());
      onForwarded?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to forward incident.');
    } finally {
      setForwarding(false);
    }
  };

  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal__box">
        <div className="modal__header">
          <h3>Forward Report</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__context">
          <strong>{item.student_name || 'Unknown Student'}</strong> · {item.type_name}
        </div>

        <div className="form-group">
          <label className="form-label">Forward to</label>
          <div className="forward-options">
            <button
              className={`forward-option ${destination === 'OSAS' ? 'forward-option--selected' : ''}`}
              onClick={() => setDestination('OSAS')}
            >
              OSAS
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Referral Note (optional)</label>
          <textarea
            className="textarea"
            placeholder="Add context or instructions..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="modal__actions">
          <button className="btn btn--outline" onClick={onClose}>Cancel</button>
          <button className="btn btn--warning" disabled={!destination || forwarding} onClick={handleForward}>
            {forwarding ? 'Forwarding...' : 'Forward'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessBanner({ onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="success-banner" onClick={onDismiss}>
      ✓ Incident report submitted successfully.
    </div>
  );
}