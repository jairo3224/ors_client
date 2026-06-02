import { useEffect, useState, useRef } from 'react';
import { Printer, Search } from 'lucide-react';
import { getReports } from './hooks/api';

const URGENCY_BADGE = { Urgent: 'badge--high', Moderate: 'badge--moderate', Low: 'badge--low' };
const STATUS_BADGE = { Open: 'badge--open', 'In Progress': 'badge--pending', Resolved: 'badge--closed' };

const MOCK_REPORTS = [
  { id: 1, student_name: 'Juan dela Cruz',  referred_by: 'Ms. Reyes',  urgency: 'Urgent',   routed_to: 'Guidance Office',  status: 'Open',        date: '2026-05-10', description: 'Repeated disruptive behavior.' },
  { id: 2, student_name: 'Maria Santos',    referred_by: 'Mr. Garcia', urgency: 'Moderate', routed_to: 'Department Head',  status: 'In Progress', date: '2026-05-12', description: 'Excessive absences.' },
  { id: 3, student_name: 'Carlo Mendoza',   referred_by: 'Ms. Torres', urgency: 'Low',      routed_to: 'Chaplain',         status: 'Resolved',    date: '2026-05-14', description: 'Spiritual guidance needed.' },
  { id: 4, student_name: 'Ana Flores',      referred_by: 'Mr. Lim',    urgency: 'Urgent',   routed_to: 'OSAS',             status: 'Open',        date: '2026-05-15', description: 'Property damage incident.' },
  { id: 5, student_name: 'Paolo Reyes',     referred_by: 'Ms. Cruz',   urgency: 'Moderate', routed_to: 'Guidance Office',  status: 'In Progress', date: '2026-05-18', description: 'Bullying complaint.' },
  { id: 6, student_name: 'Liza Domingo',    referred_by: 'Mr. Santos', urgency: 'Low',      routed_to: 'Chaplain',         status: 'Resolved',    date: '2026-05-20', description: 'Personal issues counseling.' },
];

export default function ReportsPage() {
  const [reports, setReports]     = useState(MOCK_REPORTS);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState('');
  const [filterStatus, setStatus] = useState('');
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo, setDateTo]       = useState('');
  const printRef = useRef();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getReports();
        setReports(res.data.data ?? res.data);
      } catch { /* use mock */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = reports.filter(r => {
    const q = search.toLowerCase();
    const matchSearch  = !q || r.student_name.toLowerCase().includes(q);
    const matchStatus  = !filterStatus || r.status === filterStatus;
    const matchFrom    = !dateFrom || r.date >= dateFrom;
    const matchTo      = !dateTo   || r.date <= dateTo;
    return matchSearch && matchStatus && matchFrom && matchTo;
  });

  const summary = {
    total:    filtered.length,
    open:     filtered.filter(r => r.status === 'Open').length,
    progress: filtered.filter(r => r.status === 'In Progress').length,
    resolved: filtered.filter(r => r.status === 'Resolved').length,
  };

  function handlePrint() {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(`
      <html><head><title>OSAS Referral Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; font-size: 13px; color: #222; }
        h1 { color: #4a7c8a; margin-bottom: 4px; }
        p.sub { color: #666; margin-bottom: 20px; font-size: 12px; }
        .summary { display: flex; gap: 16px; margin-bottom: 20px; }
        .sum-box { border: 1px solid #ddd; border-radius: 8px; padding: 10px 16px; text-align: center; }
        .sum-num { font-size: 20px; font-weight: 700; color: #4a7c8a; }
        .sum-label { font-size: 11px; color: #888; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f5f5f5; text-align: left; padding: 8px; font-size: 11px; text-transform: uppercase; color: #666; border-bottom: 1px solid #ddd; }
        td { padding: 8px; border-bottom: 1px solid #eee; }
        @media print { button { display: none; } }
      </style></head><body>${content}
      <br/><button onclick="window.print()">🖨️ Print</button>
      </body></html>
    `);
    win.document.close();
    win.focus();
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Referral Reports</h1>
        <p className="page-subtitle">Generate and view OSAS referral reports</p>
      </div>

      <div className="filters">
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search student…"
            className="input" style={{ paddingLeft: 32, maxWidth: 'none' }} />
        </div>
        <select value={filterStatus} onChange={e => setStatus(e.target.value)} className="select">
          <option value="">All statuses</option>
          {['Open', 'In Progress', 'Resolved'].map(s => <option key={s}>{s}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input" style={{ maxWidth: 160 }} />
        <span style={{ color: '#94a3b8', fontSize: '0.78rem', alignSelf: 'center' }}>to</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input" style={{ maxWidth: 160 }} />
        <button onClick={handlePrint} className="btn" style={{ marginLeft: 'auto' }}>
          <Printer size={14} /> Print Report
        </button>
      </div>

      <div ref={printRef}>
        <div className="page-header" style={{ marginBottom: 20 }}>
          <h1 className="page-title" style={{ color: '#4a7c8a', fontSize: '1.5rem' }}>OSAS Referral Report</h1>
          <p className="page-subtitle">
            Generated: {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
            {dateFrom && ` · From: ${dateFrom}`}
            {dateTo && ` · To: ${dateTo}`}
          </p>
        </div>

        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {[
            { label: 'Total', val: summary.total, accent: '#4a7c8a', icon: '📊' },
            { label: 'Open', val: summary.open, accent: '#e24b4a', icon: '🔴' },
            { label: 'In Progress', val: summary.progress, accent: '#f57f17', icon: '⏳' },
            { label: 'Resolved', val: summary.resolved, accent: '#2e7d32', icon: '✅' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-card__icon" style={{ backgroundColor: s.accent + '22', color: s.accent }}>
                {s.icon}
              </div>
              <div>
                <div className="stat-card__value" style={{ color: s.accent }}>{s.val}</div>
                <div className="stat-card__label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card table-card">
          {loading && <div className="loading">Loading…</div>}
          {!loading && (
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Referred by</th>
                  <th>Urgency</th>
                  <th>Routed to</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8}><div className="empty-state">No records found.</div></td></tr>
                )}
                {filtered.map((r, i) => (
                  <tr key={r.id}>
                    <td className="text-muted">{i + 1}</td>
                    <td><span className="student-name">{r.student_name}</span></td>
                    <td className="text-muted">{r.referred_by}</td>
                    <td><span className={`badge ${URGENCY_BADGE[r.urgency] || ''}`}>{r.urgency}</span></td>
                    <td className="text-muted">{r.routed_to}</td>
                    <td><span className={`badge ${STATUS_BADGE[r.status] || ''}`}>{r.status}</span></td>
                    <td className="text-muted">{r.date}</td>
                    <td className="text-muted" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
