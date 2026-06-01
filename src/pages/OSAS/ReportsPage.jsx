import { useEffect, useState, useRef } from 'react';
import { BarChart2, Download, Printer, Search } from 'lucide-react';
import { getReports } from './api';

const STATUS_COLOR = { Open: '#e24b4a', 'In Progress': '#ef9f27', Resolved: '#639922' };
const URGENCY_STYLE = {
  Urgent:   { bg: '#fcebeb', color: '#a32d2d' },
  Moderate: { bg: '#faeeda', color: '#854f0b' },
  Low:      { bg: '#eaf3de', color: '#3b6d11' },
};

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

  // ── Summary counts ────────────────────────────────────────────
  const summary = {
    total:    filtered.length,
    open:     filtered.filter(r => r.status === 'Open').length,
    progress: filtered.filter(r => r.status === 'In Progress').length,
    resolved: filtered.filter(r => r.status === 'Resolved').length,
  };

  // ── Print ─────────────────────────────────────────────────────
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
    <div className="space-y-4">

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search student…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <select value={filterStatus} onChange={e => setStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">All statuses</option>
          {['Open','In Progress','Resolved'].map(s => <option key={s}>{s}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <span className="text-gray-400 text-xs">to</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <button onClick={handlePrint}
          style={{ background: '#4a7c8a' }}
          className="ml-auto flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity">
          <Printer size={14} /> Print Report
        </button>
      </div>

      {/* ── Printable content ── */}
      <div ref={printRef}>
        <h1 style={{ color: '#4a7c8a', margin: 0, fontSize: 22 }}>OSAS Referral Report</h1>
        <p className="text-gray-500 text-sm mb-4">
          Generated: {new Date().toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' })}
          {dateFrom && ` · From: ${dateFrom}`}
          {dateTo   && ` · To: ${dateTo}`}
        </p>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Total', val: summary.total, color: '#4a7c8a' },
            { label: 'Open', val: summary.open, color: '#e24b4a' },
            { label: 'In Progress', val: summary.progress, color: '#ef9f27' },
            { label: 'Resolved', val: summary.resolved, color: '#639922' },
          ].map(s => (
            <div key={s.label} className="border border-gray-200 rounded-xl p-3 text-center">
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading && <div className="text-center py-8 text-sm text-gray-400">Loading…</div>}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                    <th className="text-left px-4 py-2 font-medium">#</th>
                    <th className="text-left px-4 py-2 font-medium">Student</th>
                    <th className="text-left px-4 py-2 font-medium">Referred by</th>
                    <th className="text-left px-4 py-2 font-medium">Urgency</th>
                    <th className="text-left px-4 py-2 font-medium">Routed to</th>
                    <th className="text-left px-4 py-2 font-medium">Status</th>
                    <th className="text-left px-4 py-2 font-medium">Date</th>
                    <th className="text-left px-4 py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-10 text-gray-400">No records found.</td></tr>
                  )}
                  {filtered.map((r, i) => (
                    <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{r.student_name}</td>
                      <td className="px-4 py-3 text-gray-500">{r.referred_by}</td>
                      <td className="px-4 py-3">
                        <span style={{ ...URGENCY_STYLE[r.urgency], padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{r.urgency}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{r.routed_to}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 text-gray-700">
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[r.status], display: 'inline-block' }} />
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{r.date}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{r.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
