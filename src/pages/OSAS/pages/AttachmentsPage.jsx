import { useState, useMemo } from 'react';
import { FileText, Image, File, Upload, Trash2 } from 'lucide-react';
import Modal, { ModalHeader, ModalActions } from '../../../components/Modal';
import { osasService } from '../../../services/osasService';
import { useOSASAttachments } from '../hooks/useOSASAttachments';

const PERMISSIONS = ['OSAS Only', 'Guidance Office', 'Chaplain Office', 'All Offices'];

function formatSize(bytes) {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
}

function UploadModal({ onClose, onUpload }) {
  const [permission, setPermission] = useState('OSAS Only');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [relatedTo, setRelatedTo] = useState('');

  const handleUpload = () => {
    if (!file || uploading) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      onUpload({
        file_name: file.name,
        file_type: file.type || 'application/octet-stream',
        file_size: file.size,
        permission,
        case_id: relatedTo || '\u2014',
        data_url: reader.result,
      });
      onClose();
    };
    reader.onerror = () => {
      setUploading(false);
      alert('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <Modal onClose={onClose} maxWidth={480}>
      <ModalHeader onClose={onClose}>Upload Attachment</ModalHeader>
      <div className="form-group">
        <label className="form-label">File</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {file && (
            <div style={{ fontSize: '0.82rem', color: '#1a3a5c', fontWeight: 500, marginBottom: 4 }}>
              Selected: {file.name} ({formatSize(file.size)})
            </div>
          )}
          <input
            type="file"
            id="upload-file-input"
            onChange={e => {
              const f = e.target.files[0];
              if (f) {
                setFile(f);
              }
            }}
            style={{
              fontFamily: 'inherit',
              fontSize: '0.85rem',
              padding: '6px 10px',
              border: '1.5px solid #d1dae6',
              borderRadius: 8,
              background: '#fff',
              color: '#1e293b',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Related To</label>
        <select className="select" style={{ width: '100%' }} value={relatedTo} onChange={e => setRelatedTo(e.target.value)}>
          <option value="">— General / No case —</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Permission Level</label>
        <select className="select" style={{ width: '100%' }} value={permission} onChange={e => setPermission(e.target.value)}>
          {PERMISSIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <ModalActions>
        <button className="btn btn--outline" onClick={onClose}>Cancel</button>
        <button className="btn" disabled={!file || uploading} onClick={handleUpload}>
          {uploading ? 'Reading file...' : 'Upload'}
        </button>
      </ModalActions>
    </Modal>
  );
}

export default function AttachmentsPage() {
  const { attachments, loading, refetch } = useOSASAttachments();
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const handleUpload = async (data) => {
    try { await osasService.uploadAttachment(data); } catch { /* fallback */ }
    refetch();
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete this attachment?')) {
      try { await osasService.deleteAttachment(id); } catch { /* fallback */ }
      refetch();
    }
  };

  const files = attachments || [];
  const filtered = files.filter(f => `${f.file_name} ${f.case_id} ${f.permission}`.toLowerCase().includes(search.toLowerCase()));
  const totalSize = useMemo(() => files.reduce((s, f) => s + f.file_size, 0), [files]);

  const getIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image size={20} />;
    if (fileType === 'application/pdf') return <FileText size={20} />;
    return <File size={20} />;
  };

  if (loading) return <div className="loading">Loading attachments...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1 className="page-title">Attachments</h1><p className="page-subtitle">Manage case-related files and evidence documents.</p></div>
        <button className="btn" onClick={() => setShowUpload(true)}><Upload size={14} style={{ marginRight: 6 }} />Upload File</button>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}><FileText size={20} /></div><div><div className="stat-card__value">{files.length}</div><div className="stat-card__label">Total Files</div></div></div>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}><FileText size={20} /></div><div><div className="stat-card__value">{formatSize(totalSize)}</div><div className="stat-card__label">Total Size</div></div></div>
        <div className="stat-card"><div className="stat-card__icon" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}><File size={20} /></div><div><div className="stat-card__value">{files.filter(f => f.file_type === 'application/pdf').length}</div><div className="stat-card__label">PDF Files</div></div></div>
      </div>
      <div className="filters">
        <input className="input" style={{ maxWidth: 320 }} placeholder="Search file name, case, permission..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(f => (
          <div key={f.id} className="card" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="stat-card__icon" style={{ backgroundColor: '#f0f4f8', color: '#64748b', width: 40, height: 40 }}>{getIcon(f.file_type)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {f.data_url ? (
                <a href={f.data_url} download={f.file_name} style={{ fontSize: 14, fontWeight: 500, color: '#1565c0', textDecoration: 'underline', cursor: 'pointer' }}>{f.file_name}</a>
              ) : (
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1a3a5c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.file_name}</div>
              )}
              <div className="report-card__meta">{formatSize(f.file_size)} · {f.uploaded_at} · by {f.uploaded_by}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}><span className="badge" style={{ background: '#e3f2fd', color: '#1565c0' }}>{f.case_id}</span><span className="badge" style={{ background: '#f3e5f5', color: '#7b1fa2' }}>{f.permission}</span></div>
            </div>
            <button className="btn btn--sm btn--danger" onClick={() => handleDelete(f.id)}><Trash2 size={14} /></button>
          </div>
        ))}
        {filtered.length === 0 && <div className="empty-state" style={{ padding: 60 }}>No attachments found.</div>}
      </div>
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUpload={handleUpload} />}
    </div>
  );
}
