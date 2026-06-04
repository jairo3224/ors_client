import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuidanceData } from '../hooks/useGuidanceData';

export default function CaseTimelinePage() {
  const navigate = useNavigate();
  const {
    referralsToGuidance,
    referralsFromGuidance,
    incidentsAssignedToGuidance,
    guidanceMeetings,
    guidanceAssessments,
    allIncidents,
  } = useGuidanceData();

  const [filterStatus, setFilterStatus] = useState('all');

  const timelineEvents = useMemo(() => {
    const events = [];

    referralsToGuidance.forEach(ref => {
      events.push({
        id: `ref-${ref.id}`,
        date: ref.date_sent,
        type: 'referral_received',
        title: 'Referral Received',
        description: ref.description,
        student: ref.student_name,
        badge: 'Received',
        badgeClass: 'badge--reviewed',
      });
      if (ref.responded_at) {
        events.push({
          id: `ref-resp-${ref.id}`,
          date: ref.responded_at,
          type: 'referral_responded',
          title: 'Referral Response',
          description: ref.response,
          student: ref.student_name,
          badge: 'Responded',
          badgeClass: 'badge--success',
        });
      }
    });

    referralsFromGuidance.forEach(ref => {
      events.push({
        id: `ref-sent-${ref.id}`,
        date: ref.date_sent,
        type: 'referral_sent',
        title: 'Referred to Chaplain',
        description: ref.description,
        student: ref.student_name,
        badge: 'Sent',
        badgeClass: 'badge--warning',
      });
    });

    incidentsAssignedToGuidance.forEach(inc => {
      events.push({
        id: `inc-${inc.id}`,
        date: inc.date_reported,
        type: 'incident',
        title: `Incident: ${inc.type}`,
        description: inc.description,
        student: inc.student_name,
        badge: inc.status,
        badgeClass: `badge--${inc.status}`,
      });
    });

    guidanceMeetings.forEach(mtg => {
      events.push({
        id: `mtg-${mtg.id}`,
        date: mtg.date,
        type: 'meeting',
        title: `Session: ${mtg.title}`,
        description: mtg.agenda || mtg.minutes || 'Counseling session scheduled.',
        student: mtg.student_name,
        badge: mtg.status,
        badgeClass: `badge--${mtg.status === 'completed' ? 'success' : mtg.status === 'scheduled' ? 'pending' : 'warning'}`,
      });
    });

    guidanceAssessments.forEach(a => {
      events.push({
        id: `asmt-${a.id}`,
        date: a.date,
        type: 'assessment',
        title: `Assessment: ${a.type}`,
        description: a.assessment || 'Assessment documented.',
        student: a.student_name,
        badge: a.status,
        badgeClass: `badge--${a.status}`,
      });
    });

    events.sort((a, b) => new Date(b.date) - new Date(a.date));
    return events;
  }, [referralsToGuidance, referralsFromGuidance, incidentsAssignedToGuidance, guidanceMeetings, guidanceAssessments]);

  const filteredEvents = filterStatus === 'all'
    ? timelineEvents
    : timelineEvents.filter(e => e.type === filterStatus);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📋 Case Timeline</h1>
        <p className="page-subtitle">Chronological view of all Guidance Office case activity</p>
      </div>

      <div className="filters">
        <button
          className={`btn btn--sm ${filterStatus === 'all' ? 'btn--primary' : 'btn--outline'}`}
          onClick={() => setFilterStatus('all')}
        >
          All ({timelineEvents.length})
        </button>
        <button
          className={`btn btn--sm ${filterStatus === 'referral_received' ? 'btn--primary' : 'btn--outline'}`}
          onClick={() => setFilterStatus('referral_received')}
        >
          Received ({timelineEvents.filter(e => e.type === 'referral_received').length})
        </button>
        <button
          className={`btn btn--sm ${filterStatus === 'meeting' ? 'btn--primary' : 'btn--outline'}`}
          onClick={() => setFilterStatus('meeting')}
        >
          Sessions ({timelineEvents.filter(e => e.type === 'meeting').length})
        </button>
        <button
          className={`btn btn--sm ${filterStatus === 'assessment' ? 'btn--primary' : 'btn--outline'}`}
          onClick={() => setFilterStatus('assessment')}
        >
          Assessments ({timelineEvents.filter(e => e.type === 'assessment').length})
        </button>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="card empty-state">No timeline events found.</div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: '#e2e8f0' }} />
          {filteredEvents.map((event, idx) => (
            <div key={event.id} style={{ position: 'relative', marginBottom: 16 }}>
              <div style={{
                position: 'absolute', left: -24, top: 4,
                width: 12, height: 12, borderRadius: '50%',
                background: event.type === 'referral_received' ? '#1565c0'
                  : event.type === 'meeting' ? '#f57f17'
                  : event.type === 'assessment' ? '#2e7d32'
                  : event.type === 'referral_sent' ? '#e65100'
                  : '#64748b',
                border: '2px solid #fff',
                boxShadow: '0 0 0 1px #e2e8f0',
              }} />
              <div className="card" style={{ marginLeft: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span
                        style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: '#94a3b8', textUnderlineOffset: 2 }}
                        onClick={() => navigate(`/guidance/student/${encodeURIComponent(event.student)}`)}
                      >
                        {event.student}
                      </span>
                      <span className={`badge ${event.badgeClass}`}>{event.badge}</span>
                    </div>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.83rem', marginBottom: 4 }}>
                      {event.title}
                    </div>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>
                      {event.description}
                    </p>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: 12 }}>
                    {event.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
