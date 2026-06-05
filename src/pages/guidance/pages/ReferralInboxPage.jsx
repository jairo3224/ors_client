import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuidanceData } from '../hooks/useGuidanceData';

const RESPONSE_TYPES = [
  { value: 'assessment', label: 'Assessment', desc: 'Initial evaluation of incident severity and context' },
  { value: 'counseling_note', label: 'Counseling Note', desc: 'Documentation of a counseling session' },
  { value: 'recommendation', label: 'Recommendation', desc: 'Formal suggested action for other offices' },
];

function statusClass(status) {
  const map = { pending: 'badge--pending', accepted: 'badge--success', rejected: 'badge--danger', responded: 'badge--reviewed' };
  return map[status] || 'badge--pending';
}

function statusLabel(status) {
  const labels = { pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected', responded: 'Responded' };
  return labels[status] || status;
}

export default function ReferralInboxPage() {
  const navigate = useNavigate();
  const {
    referralsToGuidance,
    referralsFromGuidance,
    acceptReferral,
    rejectReferral,
    respondWithType,
    returnToOSAS,
    referToChaplain,
    getRelatedIncidents,
    getRelatedAttachments,
    addAttachment,
    isLoading,
    error,
  } = useGuidanceData();

  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showIncidentDetail, setShowIncidentDetail] = useState(false);
  const [responseType, setResponseType] = useState('assessment');
  const [responseContent, setResponseContent] = useState('');
  const [referToChaplainMode, setReferToChaplainMode] = useState(false);
  const [returnToOSASMode, setReturnToOSASMode] = useState(false);
  const [returnFindings, setReturnFindings] = useState('');
  const [chaplainSubject, setChaplainSubject] = useState('');
  const [chaplainDesc, setChaplainDesc] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);

  const [relatedIncidents, setRelatedIncidents] = useState([]);
  const [relatedAttachments, setRelatedAttachments] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!selectedReferral) {
      setRelatedIncidents([]);
      setRelatedAttachments([]);
      return;
    }
    getRelatedIncidents(selectedReferral.student_name).then(setRelatedIncidents);
    getRelatedAttachments(selectedReferral.id).then(setRelatedAttachments);
  }, [selectedReferral, getRelatedIncidents, getRelatedAttachments]);

  const handleAccept = async (refId) => {
    setActionLoading(true);
    try {
      await acceptReferral(refId);
      setSelectedReferral(null);
    } catch (e) {
      alert('Failed to accept referral: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (refId) => {
    const note = prompt('Reason for rejection:');
    if (note !== null) {
      setActionLoading(true);
      try {
        await rejectReferral(refId, note || 'Referral declined.');
        setSelectedReferral(null);
      } catch (e) {
        alert('Failed to reject referral: ' + e.message);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleRespond = async (refId) => {
    if (!responseContent.trim()) return;
    setActionLoading(true);
    const typeLabel = RESPONSE_TYPES.find(t => t.value === responseType)?.label || responseType;
    const fullResponse = `[${typeLabel}]\n${responseContent.trim()}`;
    try {
      await respondWithType(refId, responseType, fullResponse);
      setResponseContent('');
      setResponseType('assessment');
      setSelectedReferral(null);
    } catch (e) {
      alert('Failed to submit response: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnToOSAS = async (refId) => {
    if (!returnFindings.trim()) return;
    setActionLoading(true);
    try {
      await returnToOSAS(refId, returnFindings.trim());
      setReturnFindings('');
      setReturnToOSASMode(false);
      setSelectedReferral(null);
    } catch (e) {
      alert('Failed to return to OSAS: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReferToChaplain = async (ref) => {
    setActionLoading(true);
    try {
      await referToChaplain(
        ref.id,
        ref.student_name,
        ref.student_id,
        chaplainSubject || `Spiritual Support - ${ref.student_name}`,
        chaplainDesc || `Referred from Guidance Office: ${ref.description}`
      );
      setReferToChaplainMode(false);
      setChaplainSubject('');
      setChaplainDesc('');
      setSelectedReferral(null);
    } catch (e) {
      alert('Failed to refer to Chaplain: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAttachmentUpload = async (refId) => {
    if (!attachmentFile) return;
    setActionLoading(true);
    try {
      await addAttachment(refId, attachmentFile.name, attachmentFile.type, attachmentFile.size);
      setAttachmentFile(null);
    } catch (e) {
      alert('Failed to upload attachment: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return <div className="card empty-state" style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading referrals...</div>;
  }

  if (error) {
    return <div className="card empty-state" style={{ padding: 40, textAlign: 'center', color: '#c62828' }}>Error: {error}</div>;
  }

  const referrals = activeTab === 'inbox' ? referralsToGuidance : referralsFromGuidance;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📨 Referral Inbox</h1>
        <p className="page-subtitle">Manage referrals sent to and from the Guidance Office</p>
      </div>

      <div className="filters">
        <button
          className={`btn ${activeTab === 'inbox' ? 'btn--primary' : 'btn--outline'} btn--sm`}
          onClick={() => { setActiveTab('inbox'); setSelectedReferral(null); }}
        >
          Received ({referralsToGuidance.length})
        </button>
        <button
          className={`btn ${activeTab === 'sent' ? 'btn--primary' : 'btn--outline'} btn--sm`}
          onClick={() => { setActiveTab('sent'); setSelectedReferral(null); }}
        >
          Sent ({referralsFromGuidance.length})
        </button>
      </div>

      {selectedReferral ? (
        <div className="card">
          {/* Referral Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h3 style={{ margin: 0, color: '#1a3a5c' }}>{selectedReferral.student_name}</h3>
                <button
                  className="btn btn--outline btn--sm"
                  onClick={() => navigate(`/guidance/student/${encodeURIComponent(selectedReferral.student_name)}`)}
                  style={{ fontSize: '0.7rem', padding: '3px 10px' }}
                >
                  View Profile
                </button>
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.83rem' }}>
                {selectedReferral.subject} · {selectedReferral.from_office} → {selectedReferral.to_office}
              </p>
            </div>
            <span className={`badge ${statusClass(selectedReferral.status)}`}>
              {statusLabel(selectedReferral.status)}
            </span>
          </div>

          {/* Description */}
          <div className="remarks-box">
            <div className="remarks-box__heading">Referral Description</div>
            {selectedReferral.description}
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>Sent: {selectedReferral.date_sent}</div>
          </div>

          {/* Previous Response */}
          {selectedReferral.response && (
            <div className="remarks-box" style={{ marginTop: 12 }}>
              <div className="remarks-box__heading">
                {selectedReferral.response_type
                  ? `Response (${selectedReferral.response_type.replace('_', ' ')})`
                  : 'Response'}
              </div>
              <div style={{ whiteSpace: 'pre-line' }}>{selectedReferral.response}</div>
              {selectedReferral.responded_at && (
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>
                  {selectedReferral.responded_at}
                </div>
              )}
            </div>
          )}

          {/* Related Incidents */}
          {activeTab === 'inbox' && relatedIncidents.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <button
                className="btn btn--outline btn--sm"
                onClick={() => setShowIncidentDetail(!showIncidentDetail)}
              >
                {showIncidentDetail ? 'Hide' : 'View'} Incident Details ({relatedIncidents.length})
              </button>

              {showIncidentDetail && relatedIncidents.map(inc => (
                <div key={inc.id} className="remarks-box" style={{ marginTop: 8 }}>
                  <div className="remarks-box__heading">Incident: {inc.type}</div>
                  <div style={{ marginBottom: 6 }}>
                    <span className={`badge badge--${inc.priority}`}>{inc.priority}</span>
                    <span className={`badge badge--${inc.status}`} style={{ marginLeft: 6 }}>{inc.status}</span>
                    <span style={{ marginLeft: 8, fontSize: '0.72rem', color: '#94a3b8' }}>
                      Reported: {inc.date_reported}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.83rem', lineHeight: 1.5 }}>
                    {inc.description}
                  </p>
                  {inc.notes && (
                    <div style={{ marginTop: 8, fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                      Notes: {inc.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pending — Accept / Reject */}
          {activeTab === 'inbox' && selectedReferral.status === 'pending' && (
            <div className="report-card__actions" style={{ marginTop: 16 }}>
              <button className="btn btn--success btn--sm" disabled={actionLoading} onClick={() => handleAccept(selectedReferral.id)}>
                ✓ Accept Referral
              </button>
              <button className="btn btn--danger btn--sm" disabled={actionLoading} onClick={() => handleReject(selectedReferral.id)}>
                ✕ Reject Referral
              </button>
              <button className="btn btn--outline btn--sm" onClick={() => setSelectedReferral(null)}>
                Back
              </button>
            </div>
          )}

          {/* Accepted — Response Form */}
          {activeTab === 'inbox' && selectedReferral.status === 'accepted' && !referToChaplainMode && !returnToOSASMode && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ margin: '0 0 12px', color: '#1a3a5c', fontSize: '0.9rem' }}>
                Document Your Response
              </h4>

              <div className="form-group">
                <label className="form-label">Response Type</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {RESPONSE_TYPES.map(rt => (
                    <button
                      key={rt.value}
                      className={`forward-option ${responseType === rt.value ? 'forward-option--selected' : ''}`}
                      onClick={() => setResponseType(rt.value)}
                      style={{ fontSize: '0.78rem' }}
                      title={rt.desc}
                    >
                      {rt.label}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                  {RESPONSE_TYPES.find(t => t.value === responseType)?.desc}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Response Content</label>
                <textarea
                  className="textarea"
                  placeholder={`Write your ${RESPONSE_TYPES.find(t => t.value === responseType)?.label.toLowerCase()} here...`}
                  value={responseContent}
                  onChange={e => setResponseContent(e.target.value)}
                />
              </div>

              <div className="report-card__actions">
                <button
                  className="btn btn--primary btn--sm"
                  disabled={!responseContent.trim()}
                  onClick={() => handleRespond(selectedReferral.id)}
                >
                  Submit {RESPONSE_TYPES.find(t => t.value === responseType)?.label}
                </button>
                <button className="btn btn--outline btn--sm" onClick={() => setReferToChaplainMode(true)}>
                  Refer to Chaplain
                </button>
                <button className="btn btn--outline btn--sm" onClick={() => setReturnToOSASMode(true)}>
                  Return to OSAS
                </button>
              </div>

              {/* Attachment Upload */}
              <div style={{ marginTop: 16, padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px dashed #d1dae6' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                  Upload Supporting Evidence
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="file"
                    onChange={e => setAttachmentFile(e.target.files[0])}
                    style={{ fontSize: '0.78rem', flex: 1 }}
                  />
                  <button
                    className="btn btn--sm"
                    disabled={!attachmentFile}
                    onClick={() => handleAttachmentUpload(selectedReferral.id)}
                  >
                    Upload
                  </button>
                </div>
                {relatedAttachments.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                      Uploaded Files ({relatedAttachments.length})
                    </div>
                    {relatedAttachments.map(att => (
                      <div key={att.id} style={{ fontSize: '0.78rem', color: '#1a3a5c', padding: '2px 0' }}>
                        📎 {att.file_name} <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                          ({(att.file_size / 1024).toFixed(1)} KB · {att.uploaded_at})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Refer to Chaplain Form */}
          {referToChaplainMode && (
            <div className="card" style={{ marginTop: 16 }}>
              <h4 style={{ margin: '0 0 12px', color: '#1a3a5c' }}>Refer to Chaplain</h4>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  className="input"
                  style={{ width: '100%' }}
                  value={chaplainSubject}
                  onChange={e => setChaplainSubject(e.target.value)}
                  placeholder="Spiritual Support Referral"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes for Chaplain</label>
                <textarea
                  className="textarea"
                  value={chaplainDesc}
                  onChange={e => setChaplainDesc(e.target.value)}
                  placeholder="Describe the spiritual/emotional concerns requiring chaplain intervention..."
                />
              </div>
              <div className="report-card__actions">
                <button className="btn btn--warning btn--sm" onClick={() => handleReferToChaplain(selectedReferral)}>
                  Send to Chaplain
                </button>
                <button className="btn btn--outline btn--sm" onClick={() => setReferToChaplainMode(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Return to OSAS Form */}
          {returnToOSASMode && (
            <div className="card" style={{ marginTop: 16 }}>
              <h4 style={{ margin: '0 0 12px', color: '#1a3a5c' }}>Return Case to OSAS</h4>
              <div className="form-group">
                <label className="form-label">Complete Findings</label>
                <textarea
                  className="textarea"
                  placeholder="Document all findings, interventions conducted, recommendations, and case outcome..."
                  value={returnFindings}
                  onChange={e => setReturnFindings(e.target.value)}
                />
              </div>
              <div className="report-card__actions">
                <button
                  className="btn btn--primary btn--sm"
                  disabled={!returnFindings.trim()}
                  onClick={() => handleReturnToOSAS(selectedReferral.id)}
                >
                  Return to OSAS
                </button>
                <button className="btn btn--outline btn--sm" onClick={() => setReturnToOSASMode(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Back to list */}
          {!referToChaplainMode && !returnToOSASMode && selectedReferral.status !== 'pending' && (
            <div style={{ textAlign: 'right', marginTop: 12 }}>
              <button className="btn btn--outline btn--sm" onClick={() => { setSelectedReferral(null); setShowIncidentDetail(false); }}>
                Back to List
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Referral List Table */
        <div className="card table-card">
          {referrals.length === 0 ? (
            <div className="empty-state">
              {activeTab === 'inbox' ? 'No referrals received.' : 'No referrals sent.'}
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>{activeTab === 'inbox' ? 'From' : 'To'}</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map(ref => (
                  <tr
                    key={ref.id}
                    onClick={() => setSelectedReferral(ref)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ color: '#1a3a5c', fontWeight: 600, fontSize: '0.85rem' }}>
                        Name: {ref.student_name}
                      </div>
                    </td>
                    <td>{ref.subject}</td>
                    <td className="text-muted">{activeTab === 'inbox' ? ref.from_office : ref.to_office}</td>
                    <td className="mono">{ref.date_sent}</td>
                    <td>
                      <span className={`badge ${statusClass(ref.status)}`}>
                        {statusLabel(ref.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
