import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, XCircle, Info } from 'lucide-react';
import api from '../../services/api';
import { EmptyState } from '../../components/shared/SharedComponents';

const TYPE_ICON = {
  BOOKING_CONFIRMED: { Icon: CheckCircle, color: '#16a34a', soft: '#e6f6ed' },
  PAYMENT_RECEIVED:  { Icon: CheckCircle, color: '#16a34a', soft: '#e6f6ed' },
  BOOKING_CANCELLED: { Icon: XCircle,     color: '#dc2626', soft: '#fdeaea' },
  REMINDER:          { Icon: Info,        color: '#1B6CA8', soft: '#eaf3f9' },
  SYSTEM:            { Icon: Info,        color: '#1B6CA8', soft: '#eaf3f9' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    api.get('/notifications?size=500')
      .then(res => {
        const all = res.data.content || res.data || [];
        const mine = (currentUser ? all.filter(n => n.userId === currentUser.userId || n.userId === currentUser.id) : [])
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setNotifications(mine);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 640 }}>
      <h4 className="fw-bold mb-4">Notifications</h4>
      {loading ? <div className="skeleton" style={{ height: 200 }}/> :
        notifications.length === 0 ? <EmptyState icon="🔔" title="No notifications" description="You're all caught up!" /> :
        <div className="d-flex flex-column gap-2">
          {notifications.map((n, i) => {
            const meta = TYPE_ICON[n.type] || { Icon: Bell, color: '#64748b', soft: '#f1f5f9' };
            const { Icon } = meta;
            return (
              <div className="t-card p-3 d-flex align-items-start gap-3" key={n.notificationId || n.id || i}>
                <span style={{ width: 36, height: 36, borderRadius: 9, background: meta.soft, color: meta.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="fw-semibold small">{n.title || 'Notification'}</div>
                  {n.message && <div className="text-muted small">{n.message}</div>}
                  <small className="text-muted">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</small>
                </div>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}
