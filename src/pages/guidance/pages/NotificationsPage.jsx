import { useGuidanceData } from '../hooks/useGuidanceData';

function priorityIcon(priority) {
  const map = { critical: '🔴', high: '🟠', moderate: '🟡', low: '🔵' };
  return map[priority] || '🔵';
}

function priorityClass(priority) {
  const map = { critical: 'badge--critical', high: 'badge--high', moderate: 'badge--moderate', low: 'badge--low' };
  return map[priority] || 'badge--low';
}

export default function NotificationsPage() {
  const { guidanceNotifications, allNotifications } = useGuidanceData();

  const notifications = guidanceNotifications.length > 0 ? guidanceNotifications : allNotifications.slice(0, 5);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🔔 Notifications</h1>
        <p className="page-subtitle">
          {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="card empty-state">No notifications yet.</div>
      ) : (
        <div className="card">
          {notifications.map((notif, idx) => (
            <div
              key={notif.id}
              className="report-item"
              style={{
                background: notif.read ? 'transparent' : '#f8faff',
                borderRadius: idx === 0 ? '8px 8px 0 0' : 0,
                padding: '12px 14px',
              }}
            >
              <div style={{ fontSize: '1.2rem', lineHeight: 1 }}>{priorityIcon(notif.priority)}</div>
              <div className="report-item__info">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontWeight: notif.read ? 500 : 700, color: '#1a3a5c', fontSize: '0.88rem' }}>
                    {notif.title}
                  </span>
                  {!notif.read && (
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%', background: '#1565c0',
                      display: 'inline-block', flexShrink: 0,
                    }} />
                  )}
                </div>
                <p style={{ margin: '2px 0', color: '#64748b', fontSize: '0.8rem', lineHeight: 1.4 }}>
                  {notif.message}
                </p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                  <span className={`badge ${priorityClass(notif.priority)}`}>{notif.priority}</span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{notif.created_at}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
