import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SkeletonCard } from '../../components/shared/SharedComponents';
import StatusBadge from '../../components/shared/StatusBadge';
import api from '../../services/api';
import { MapPin, Calendar, Plane, Hotel, Car, ChevronRight } from 'lucide-react';

/* ── Itinerary helpers (pure) ─────────────────────────────── */

// Day number relative to the trip start. Day 1 = start date.
function getDayNumber(startDate, bookingDate) {
  if (!startDate || !bookingDate) return null;
  const diff = Math.round((new Date(bookingDate) - new Date(startDate)) / 86400000);
  return diff >= 0 ? diff + 1 : null;
}

// e.g. "Mon, 01 Jun"
function formatDate(date) {
  const d = new Date(date);
  if (isNaN(d)) return date;
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
}

// Group bookings by travel date, oldest -> newest. Undated -> `unscheduled`.
function groupByDate(bookings) {
  const byDate = {};
  const unscheduled = [];
  bookings.forEach(b => {
    const date = b.date || b.travelDate;
    if (!date || isNaN(new Date(date))) { unscheduled.push(b); return; }
    (byDate[date] = byDate[date] || []).push(b);
  });
  const days = Object.keys(byDate)
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({ date, bookings: byDate[date] }));
  return { days, unscheduled };
}

// Clear destination/route string, or a readable fallback (never a bare "Booking #N").
function getDestination(b) {
  if (b.route) return b.route.replace('→', ' → ');
  if (b.from && b.to) return `${b.from} → ${b.to}`;
  if (b.inventoryName) return b.inventoryName;
  if (b.itemType) return `${b.itemType.charAt(0)}${b.itemType.slice(1).toLowerCase()} booking`;
  return `Booking #${b.bookingId || b.id}`;
}

function typeIcon(type) {
  if (type === 'FLIGHT') return <Plane size={16} className="text-primary"/>;
  if (type === 'HOTEL') return <Hotel size={16} className="text-primary"/>;
  return <Car size={16} className="text-primary"/>;
}

export default function ItinerariesListPage() {
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    Promise.all([
      api.get('/itineraries?size=500'),
      api.get('/bookings?size=500'),
    ]).then(([itRes, bkRes]) => {
      const allIt = itRes.data.content || itRes.data || [];
      const mineIt = allIt.filter(it => it.customerId === currentUser?.userId || it.customerId === currentUser?.id);
      setItineraries(mineIt.sort((a, b) => (b.itineraryId || 0) - (a.itineraryId || 0)));
      const allBk = bkRes.data.content || bkRes.data || [];
      setBookings(allBk);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const bookingCard = (b) => (
    <div className="t-card p-3" key={b.bookingId || b.id}>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            {typeIcon(b.itemType)}
            <h6 className="mb-0 fw-bold">{getDestination(b)}</h6>
            <StatusBadge status={b.status} />
            {b.purpose === 'BUSINESS' && <span className="badge bg-primary-subtle text-primary" style={{fontSize:'0.65rem'}}>Business</span>}
            {b.purpose === 'PERSONAL' && <span className="badge bg-light text-muted" style={{fontSize:'0.65rem'}}>Personal</span>}
          </div>
          <div className="d-flex gap-3 text-muted small mt-1 flex-wrap">
            <span>Booking #{b.bookingId || b.id}</span>
            {(b.date || b.travelDate) && <span><Calendar size={12}/> {formatDate(b.date || b.travelDate)}</span>}
            {b.itemType && <span>{b.itemType}</span>}
          </div>
        </div>
        <div className="text-end">
          <div className="price-tag" style={{ fontSize: '1.2rem' }}>₹{(b.amount || b.totalAmount || 0).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );

  // A day-by-day timeline for one itinerary.
  const renderTimeline = (startDate, list) => {
    const { days, unscheduled } = groupByDate(list);
    return (
      <div className="d-flex flex-column gap-3">
        {days.map(({ date, bookings: dayBookings }, idx) => {
          const dayNo = getDayNumber(startDate, date) || idx + 1;
          return (
            <div key={date}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-primary-subtle text-primary fw-bold">Day {dayNo}</span>
                <span className="small text-muted fw-semibold">{formatDate(date)}</span>
                <span className="flex-grow-1 border-bottom" />
              </div>
              <div className="d-flex flex-column gap-2 ps-2">
                {dayBookings.map(b => bookingCard(b))}
              </div>
            </div>
          );
        })}
        {unscheduled.length > 0 && (
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-secondary-subtle text-secondary fw-bold">Unscheduled</span>
              <span className="flex-grow-1 border-bottom" />
            </div>
            <div className="d-flex flex-column gap-2 ps-2">
              {unscheduled.map(b => bookingCard(b))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="d-flex flex-column gap-3">{[1,2,3].map(i => <SkeletonCard key={i} height={180}/>)}</div>;

  return (
    <div>
      <h4 className="fw-bold mb-1">My Trips</h4>
      <p className="text-muted small mb-4">Your day-by-day travel plan</p>

      {itineraries.length === 0 ? (
        <div className="t-card p-5 text-center">
          <MapPin size={48} className="text-muted mb-3"/>
          <p className="text-muted">Itineraries are automatically created when you book a trip. Make a booking to see your first itinerary here.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {itineraries.map(it => {
            const bookingIds = (it.bookings || '').split(',').map(s => Number(s.trim())).filter(Boolean);
            // Itinerary shows only planned/active travel — cancelled bookings are excluded from the timeline.
            const tripBookings = bookings.filter(b => bookingIds.includes(b.bookingId || b.id) && b.status !== 'CANCELLED');
            return (
              <div key={it.itineraryId || it.id} className="t-card p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className="d-flex align-items-center gap-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/traveler/itinerary/${it.itineraryId || it.id}`)}
                    title="Open trip to rename or add bookings"
                  >
                    <MapPin size={18} className="text-primary" />
                    <span className="fw-bold">{it.title || `Trip #${it.itineraryId || it.id}`}</span>
                    <ChevronRight size={16} className="text-muted" />
                  </div>
                  <StatusBadge status={it.status} />
                </div>
                <div className="small text-muted mb-3">
                  {it.startDate || '—'} → {it.endDate || '—'} · {tripBookings.length} booking(s)
                </div>
                {tripBookings.length === 0
                  ? <p className="small text-muted mb-0">No bookings in this trip yet.</p>
                  : renderTimeline(it.startDate, tripBookings)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
