export default function ReportsView({ incidents, loading }) {
  if (loading) {
    return <div className="reports-view"><p>Loading...</p></div>;
  }

  if (incidents.length === 0) {
    return (
      <div className="reports-view">
        <div className="card empty-state">
          <p>No incident reports yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-view">
      <div className="reports-list">
        {incidents.map(incident => (
          <div key={incident.id} className="report-card card">
            <div className="report-header">
              <h3>Report #{incident.id}</h3>
              <span className="status-badge">{incident.current_status}</span>
            </div>
            <p className="report-desc">{incident.description}</p>
            <p className="report-date">
              {new Date(incident.date_reported).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
