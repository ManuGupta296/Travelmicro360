import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCircle, XCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const TYPE_ICON = {
  BOOKING_CONFIRMED: { Icon: CheckCircle, color: '#16a34a', soft: '#e6f6ed' },
  PAYMENT_RECEIVED:  { Icon: CheckCircle, color: '#16a34a', soft: '#e6f6ed' },
  BOOKING_CANCELLED: { Icon: XCircle,     color: '#dc2626', soft: '#fdeaea' },
  REMINDER:          { Icon: Info,        color: '#1B6CA8', soft: '#eaf3f9' },
  SYSTEM:            { Icon: Info,        color: '#1B6CA8', soft: '#eaf3f9' },
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = useCallback(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) return;
    api.get('/notifications?size=500').then(r => {
      const all = r.data.content || r.data || [];
      const mine = all.filter(n => n.userId === currentUser.userId || n.userId === currentUser.id);
      setNotifications(mine.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unread = notifications.filter(n => !n.isRead);
  const recent = unread.slice(0, 5);

  const markRead = async (n) => {
    const id = n.notificationId || n.id;
    setNotifications(prev => prev.map(x => (x.notificationId || x.id) === id ? { ...x, isRead: true } : x));
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch {
      fetchNotifications();
    }
  };

  const markAllRead = async () => {
    const ids = unread.map(n => n.notificationId || n.id);
    setNotifications(prev => prev.map(x => ({ ...x, isRead: true })));
    try {
      await Promise.all(ids.map(id => api.put(`/notifications/${id}/read`)));
    } catch {}
    fetchNotifications();
  };

  return (
    <div className="position-relative" ref={ref}>
      <button className="btn btn-sm btn-light position-relative" onClick={() => setOpen(!open)} aria-label="Notifications">
        <Bell size={18} className="text-muted" />
        {unread.length > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize:'0.6rem'}}>
            {unread.length > 99 ? '99+' : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="position-absolute end-0 mt-2 shadow-lg bg-white border rounded" style={{width:320,zIndex:1060}}>
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <span className="fw-bold small">Notifications</span>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary-subtle text-primary" style={{fontSize:'0.65rem'}}>{unread.length} unread</span>
              {unread.length > 0 && (
                <button className="btn btn-sm btn-link p-0 text-decoration-none" style={{fontSize:'0.7rem'}} onClick={markAllRead}>
                  Mark all read
                </button>
              )}
            </div>
          </div>
          <div style={{maxHeight:280,overflowY:'auto'}}>
            {recent.length === 0 ? (
              <p className="text-muted small text-center py-3 mb-0">No new notifications</p>
            ) : recent.map(n => {
              const meta = TYPE_ICON[n.type] || { Icon: Bell, color: '#64748b', soft: '#f1f5f9' };
              const { Icon } = meta;
              return (
                <div key={n.notificationId || n.id} className="d-flex gap-2 px-3 py-2 border-bottom"
                  style={{ cursor: 'pointer' }} onClick={() => { markRead(n); setOpen(false); }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: meta.soft, color: meta.color,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    {n.title && <div className="fw-semibold" style={{ fontSize: '0.8rem' }}>{n.title}</div>}
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>{n.message}</div>
                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</small>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-2 border-top text-center">
            <button className="btn btn-sm btn-link text-decoration-none" onClick={() => { setOpen(false); navigate('/notifications'); }}>
              View all →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
