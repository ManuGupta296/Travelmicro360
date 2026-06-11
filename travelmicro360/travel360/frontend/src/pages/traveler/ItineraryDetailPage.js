import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { SkeletonCard } from '../../components/shared/SharedComponents';
import StatusBadge from '../../components/shared/StatusBadge';
import { Calendar, DollarSign, ArrowLeft, Plus, Pencil, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ItineraryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/itineraries/${id}`),
      api.get('/bookings?size=500'),
    ]).then(([itRes, bkRes]) => {
      const it = itRes.data;
      setItinerary(it);

      const allBookings = bkRes.data.content || bkRes.data || [];
      const bookingIds = (it.bookings || '').split(',').filter(Boolean).map(Number);
      // Active itinerary view: exclude cancelled bookings from the timeline, count and total.
      const included = allBookings.filter(b => bookingIds.includes(b.bookingId || b.id) && b.status !== 'CANCELLED');
      setBookings(included);

      // Candidate bookings for "Add": the logged-in traveler's OWN bookings (by customerId),
      // not already in this trip, and not cancelled.
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const mine = allBookings.filter(b =>
        (b.customerId === currentUser?.userId || b.customerId === currentUser?.id)
        && !bookingIds.includes(b.bookingId || b.id)
        && b.status !== 'CANCELLED');
      setUserBookings(mine);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const totalCost = bookings.reduce((s, b) => s + (b.amount || b.totalAmount || 0), 0);

  // Day number relative to the trip start (Day 1 = start date)
  const dayNumber = (startDate, date) => {
    if (!startDate || !date) return null;
    const diff = Math.round((new Date(date) - new Date(startDate)) / 86400000);
    return diff >= 0 ? diff + 1 : null;
  };

  // "Sat, 15 Jun" style label
  const dayLabel = (date) => {
    const d = new Date(date);
    if (isNaN(d)) return date;
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
  };

  // Group this trip's bookings into ordered days + an unscheduled bucket
  const buildDays = (startDate, list) => {
    const byDate = {};
    const unscheduled = [];
    list.forEach(b => {
      const date = b.travelDate || b.date;
      if (!date) { unscheduled.push(b); return; }
      (byDate[date] = byDate[date] || []).push(b);
    });
    const days = Object.keys(byDate).sort().map(date => ({
      date,
      day: dayNumber(startDate, date),
      bookings: byDate[date],
    }));
    return { days, unscheduled };
  };

  const bookingCard = (b) => (
    <div className="t-card p-3 mb-2" key={b.bookingId || b.id}>
      <div className="d-flex justify-content-between mb-2">
        <span className="badge bg-primary-subtle text-primary" style={{fontSize:'0.7rem'}}>{b.itemType || 'BOOKING'}</span>
        <StatusBadge status={b.status} />
      </div>
      <p className="fw-bold small mb-1">{b.inventoryName || `Booking #${b.bookingId || b.id}`}</p>
      {b.route && <p className="small text-primary mb-1">{b.route.replace('→', ' → ')}</p>}
      <p className="small text-muted mb-1">Booking #{b.bookingId || b.id} · {b.travelDate || b.date || '—'}</p>
      <p className="small fw-bold mb-0">₹{(b.amount || b.totalAmount || 0).toLocaleString()}</p>
    </div>
  );

  const updateStatus = async (newStatus) => {
    try {
      await api.put(`/itineraries/${id}`, { ...itinerary, status: newStatus });
      setItinerary(prev => ({ ...prev, status: newStatus }));
      toast.success(`Trip ${newStatus.toLowerCase()}`);
    } catch { toast.error('Failed to update status'); }
  };

  const saveName = async () => {
    const title = nameInput.trim();
    if (!title) { toast.error('Trip name cannot be empty'); return; }
    try {
      await api.put(`/itineraries/${id}`, { ...itinerary, title });
      setItinerary(prev => ({ ...prev, title }));
      setEditingName(false);
      toast.success('Trip renamed');
    } catch { toast.error('Failed to rename trip'); }
  };

  const addBooking = async (bookingId) => {
    const newCsv = itinerary.bookings ? `${itinerary.bookings},${bookingId}` : `${bookingId}`;
    try {
      await api.put(`/itineraries/${id}`, { ...itinerary, bookings: newCsv });
      setItinerary(prev => ({ ...prev, bookings: newCsv }));
      const added = userBookings.find(b => (b.bookingId || b.id) === bookingId);
      if (added) setBookings(prev => [...prev, added]);
      setUserBookings(prev => prev.filter(b => (b.bookingId || b.id) !== bookingId));
      toast.success('Booking added to trip');
      setShowAdd(false);
    } catch { toast.error('Failed to add booking'); }
  };

  if (loading) return <SkeletonCard height={400} />;
  if (!itinerary) return <p className="text-muted">Itinerary not found.</p>;

  return (
    <div>
      <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => navigate('/traveler/itineraries')}>
        <ArrowLeft size={14} className="me-1"/> Back to Trips
      </button>

      <div className="t-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            {editingName ? (
              <div className="d-flex align-items-center gap-2 mb-1">
                <input className="form-control form-control-sm" style={{ maxWidth: 280 }} value={nameInput} autoFocus
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }} />
                <button className="btn btn-sm btn-success" onClick={saveName}><Check size={14}/></button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingName(false)}><X size={14}/></button>
              </div>
            ) : (
              <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
                {itinerary.title || `Trip #${id}`}
                <button className="btn btn-sm btn-link p-0 text-muted" title="Rename trip"
                  onClick={() => { setNameInput(itinerary.title || ''); setEditingName(true); }}>
                  <Pencil size={16}/>
                </button>
              </h4>
            )}
            <div className="d-flex gap-3 text-muted small">
              <span><Calendar size={14} className="me-1"/>{itinerary.startDate} → {itinerary.endDate}</span>
              <span><DollarSign size={14} className="me-1"/>Total: ₹{totalCost.toLocaleString()}</span>
            </div>
          </div>
          <StatusBadge status={itinerary.status} />
        </div>

        <div className="mt-3 d-flex gap-2 flex-wrap">
          {itinerary.status === 'DRAFT' && <button className="btn btn-sm btn-success" onClick={() => updateStatus('CONFIRMED')}>Confirm Trip</button>}
          {itinerary.status === 'CONFIRMED' && <button className="btn btn-sm btn-primary" onClick={() => updateStatus('IN_PROGRESS')}>Start Trip</button>}
          {itinerary.status === 'IN_PROGRESS' && <button className="btn btn-sm btn-success" onClick={() => updateStatus('COMPLETED')}>Complete</button>}
          {['DRAFT','CONFIRMED'].includes(itinerary.status) && <button className="btn btn-sm btn-outline-danger" onClick={() => updateStatus('CANCELLED')}>Cancel</button>}
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0">Bookings ({bookings.length})</h6>
        <button className="btn btn-sm btn-accent" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={14} className="me-1"/> Add Booking
        </button>
      </div>

      {showAdd && (
        <div className="t-card p-3 mb-3">
          <h6 className="fw-bold small mb-2">Select a booking to add:</h6>
          {userBookings.length === 0 ? <p className="text-muted small">No available bookings to add.</p> : (
            <div className="d-flex flex-column gap-2">
              {userBookings.slice(0, 10).map(b => (
                <div key={b.bookingId || b.id} className="d-flex justify-content-between align-items-center border rounded p-2" style={{fontSize:'0.85rem'}}>
                  <span>{[
                    `#${b.bookingId || b.id}`,
                    b.itemType || 'Booking',
                    b.inventoryName,
                    b.route,
                    b.travelDate || b.date,
                    `₹${(b.amount || b.totalAmount || 0).toLocaleString()}`,
                  ].filter(Boolean).join(' — ')}</span>
                  <button className="btn btn-xs btn-primary" onClick={() => addBooking(b.bookingId || b.id)}>Add</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="t-card p-4 text-center text-muted">No bookings in this trip yet.</div>
      ) : (() => {
        const { days, unscheduled } = buildDays(itinerary.startDate, bookings);
        return (
          <div className="d-flex flex-column gap-3">
            {days.map((d, idx) => (
              <div key={d.date}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-primary-subtle text-primary fw-bold">Day {d.day || idx + 1}</span>
                  <span className="small text-muted">{dayLabel(d.date)}</span>
                  <span className="flex-grow-1 border-bottom" />
                </div>
                <div className="ps-2">
                  {d.bookings.map(b => bookingCard(b))}
                </div>
              </div>
            ))}
            {unscheduled.length > 0 && (
              <div>
                <div className="small text-muted fw-bold mb-2">Unscheduled</div>
                <div className="ps-2">
                  {unscheduled.map(b => bookingCard(b))}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

