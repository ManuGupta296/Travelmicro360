import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, XCircle, Plane, Hotel, Car, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/shared/SharedComponents';
import StatusBadge from '../../components/shared/StatusBadge';
import api from '../../services/api';

export default function MyTrips() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/bookings', { params: { page: 0, size: 100, sort: 'createdAt,desc' } });
        const all = Array.isArray(res.data.content) ? res.data.content : Array.isArray(res.data) ? res.data : [];
        const mine = all.filter(b => b.customerId === user?.userId || b.userId === user?.userId);
        setBookings(mine);
      } catch (err) {
        console.error('My Bookings fetch error:', err);
        if (err.response?.status === 403) {
          setError("You don't have permission to view bookings.");
        } else if (err.response?.status !== 401) {
          setError('Could not load your bookings. Please try again.');
        }
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking? This will initiate a refund.')) return;
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      setBookings(bs => bs.map(b => b.bookingId === bookingId ? { ...b, status: 'CANCELLED' } : b));
      toast.success('Booking cancelled & refund initiated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel'); }
  };

  const filtered = (() => {
    const today = new Date().toISOString().split('T')[0];
    // Cancelled bookings live ONLY in the Cancelled tab.
    if (tab === 'cancelled') return bookings.filter(b => b.status === 'CANCELLED');
    // All other tabs operate on active (non-cancelled) bookings only.
    const active = bookings.filter(b => b.status !== 'CANCELLED');
    if (tab === 'upcoming') return active.filter(b => b.status === 'CONFIRMED' && (b.date || b.travelDate) > today);
    if (tab === 'completed') return active.filter(b => b.status === 'CONFIRMED' && (b.date || b.travelDate) <= today);
    return bookings; // 'all' = every booking, including cancelled
  })();

  const typeIcon = (type) => {
    if (type === 'FLIGHT') return <Plane size={16} className="text-primary"/>;
    if (type === 'HOTEL') return <Hotel size={16} className="text-primary"/>;
    return <Car size={16} className="text-primary"/>;
  };

  const renderBookingCard = (b) => {
    const route = b.route ? b.route.replace('→', ' → ') : (b.from && b.to ? `${b.from} → ${b.to}` : null);
    return (
    <div className="t-card p-3" key={b.bookingId}>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            {typeIcon(b.itemType)}
            <h6 className="mb-0 fw-bold">{b.inventoryName || `Booking #${b.bookingId}`}</h6>
            <StatusBadge status={b.status} />
            {b.purpose === 'BUSINESS' && <span className="badge bg-primary-subtle text-primary" style={{fontSize:'0.65rem'}}>Business</span>}
            {b.purpose === 'PERSONAL' && <span className="badge bg-light text-muted" style={{fontSize:'0.65rem'}}>Personal</span>}
          </div>
          {route && <div className="text-primary small fw-semibold mt-1 d-flex align-items-center gap-1"><MapPin size={12}/> {route}</div>}
          <div className="d-flex gap-3 text-muted small mt-1 flex-wrap">
            <span>Booking #{b.bookingId}</span>
            {(b.date || b.travelDate) && <span><Calendar size={12}/> {b.date || b.travelDate}</span>}
            {b.itemType && <span>{b.itemType}</span>}
          </div>
        </div>
        <div className="text-end">
          <div className="price-tag" style={{ fontSize: '1.2rem' }}>₹{(b.amount || b.totalAmount || 0).toLocaleString()}</div>
          <div className="d-flex gap-1 mt-2 justify-content-end">
            {(b.status === 'CONFIRMED' || b.status === 'PENDING') && (b.date || b.travelDate) >= new Date().toISOString().split('T')[0] && (
              <button className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1" onClick={() => cancelBooking(b.bookingId)}><XCircle size={14}/> Cancel</button>
            )}
          </div>
        </div>
      </div>
    </div>
    );
  };

  if (error) {
    return (
      <div>
        <h4 className="fw-bold mb-4">My Bookings</h4>
        <div className="t-card p-5 text-center">
          <AlertTriangle size={48} className="text-muted mb-2" />
          <p className="text-muted mt-2">{error}</p>
          <button className="btn btn-sm btn-primary mt-2" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="fw-bold mb-1">My Bookings</h4>
      <p className="text-muted small mb-4">View and manage all your bookings</p>

      <div className="d-flex gap-2 mb-4">
        {['all', 'upcoming', 'completed', 'cancelled'].map(t => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-gradient' : 'btn-light'}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="d-flex flex-column gap-3">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="" title="No bookings here" description="Search and book to see your bookings here." action="Search Flights" onAction={() => window.location.href = '/traveler/home'} />
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map(b => renderBookingCard(b))}
        </div>
      )}
    </div>
  );
}
