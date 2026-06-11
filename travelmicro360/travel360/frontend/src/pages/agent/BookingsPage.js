import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Hotel, Car, MapPin, Calendar, XCircle, User } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/shared/StatusBadge';
import FilterTabs from '../../components/shared/FilterTabs';
import DetailDrawer from '../../components/shared/DetailDrawer';
import { useLookups } from '../../hooks/useLookups';
import toast from 'react-hot-toast';

export default function BookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const { getUserName } = useLookups();

  useEffect(() => {
    const agentEmail = JSON.parse(localStorage.getItem('user'))?.email?.trim().toLowerCase();

    api.get('/bookings?size=500').then(res => {
      const all = res.data.content || res.data || [];
      const mine = all.filter(b => b.createdBy && b.createdBy.trim().toLowerCase() === agentEmail);
      setBookings(mine.sort((a, b) => (b.bookingId || 0) - (a.bookingId || 0)));
    }).catch(() => {}).finally(() => setLoading(false));

    // Resolve customerId -> customer name (agent's own customers).
    api.get('/customers?size=200').then(r => setCustomers(r.data.content || r.data || [])).catch(() => {});
  }, []);

  // Resolve a booking's customerId to a name: agent's customers first, then platform users.
  const customerName = (id) => customers.find(c => c.customerId === id)?.name || getUserName(id);

  const handleCancel = async (b) => {
    if (!window.confirm(`Cancel booking #${b.bookingId}?`)) return;
    try {
      await api.put(`/bookings/${b.bookingId}/cancel`);
      setBookings(prev => prev.map(x => x.bookingId === b.bookingId ? { ...x, status: 'CANCELLED' } : x));
      setSelected(null);
      toast.success('Booking cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  const parsePassengers = (b) => {
    try { const a = JSON.parse(b.passengers || '[]'); return Array.isArray(a) ? a : []; }
    catch { return []; }
  };
  // Who's travelling: first passenger's name (+N more), falling back to the customer id.
  const passengerLabel = (b) => {
    const ps = parsePassengers(b);
    if (ps.length === 0) return b.travelerName || customerName(b.customerId);
    const first = ps[0].fullName || ps[0].name || customerName(b.customerId);
    return ps.length > 1 ? `${first} +${ps.length - 1}` : first;
  };

  const typeIcon = (type) => {
    if (type === 'FLIGHT') return <Plane size={16} className="text-primary"/>;
    if (type === 'HOTEL') return <Hotel size={16} className="text-primary"/>;
    return <Car size={16} className="text-primary"/>;
  };

  const renderBookingCard = (b) => {
    const route = b.route ? b.route.replace('→', ' → ') : null;
    return (
      <div className="t-card p-3" key={b.bookingId} style={{ cursor: 'pointer' }} onClick={() => setSelected(b)}>
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
            <div className="text-muted small mt-1 d-flex align-items-center gap-1"><User size={12}/> {passengerLabel(b)}</div>
            <div className="d-flex gap-3 text-muted small mt-1 flex-wrap">
              <span>Booking #{b.bookingId}</span>
              {(b.date || b.travelDate) && <span><Calendar size={12}/> {b.date || b.travelDate}</span>}
              {b.itemType && <span>{b.itemType}</span>}
            </div>
          </div>
          <div className="text-end">
            <div className="price-tag" style={{ fontSize: '1.2rem' }}>₹{(b.amount || b.totalAmount || 0).toLocaleString()}</div>
            <div className="d-flex gap-1 mt-2 justify-content-end">
              {(b.status === 'CONFIRMED' || b.status === 'PENDING') && (
                <button className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                  onClick={(e) => { e.stopPropagation(); handleCancel(b); }}><XCircle size={14}/> Cancel</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h4 className="fw-bold mb-1">My Bookings</h4>
      <p className="text-muted small mb-4">Bookings you've made for your customers</p>
      <FilterTabs tabs={[{key:'ALL',label:'All'},{key:'CONFIRMED',label:'Confirmed'},{key:'PENDING',label:'Pending'},{key:'CANCELLED',label:'Cancelled'}]} active={filter} onChange={setFilter} />

      {loading ? (
        <div className="d-flex flex-column gap-3">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}</div>
      ) : bookings.length === 0 ? (
        <div className="t-card p-5 text-center">
          <p className="text-muted">You haven't booked for any customers yet.</p>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/agent/group-booking')}>Start with Group Booking →</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="t-card p-5 text-center text-muted">No {filter.toLowerCase()} bookings.</div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map(b => renderBookingCard(b))}
        </div>
      )}
      <DetailDrawer open={!!selected} onClose={() => setSelected(null)} title={`Booking #${selected?.bookingId}`}>
        {selected && (
          <div>
            <p><strong>Customer:</strong> {customerName(selected.customerId)} (#{selected.customerId})</p>
            <p><strong>Type:</strong> {selected.itemType || '—'}</p>
            {selected.inventoryName && <p><strong>Name:</strong> {selected.inventoryName}</p>}
            {selected.route && <p><strong>Route:</strong> {selected.route.replace('→', ' → ')}</p>}
            <p><strong>Travel Date:</strong> {selected.date || selected.travelDate || '—'}</p>
            {(() => {
              const ps = parsePassengers(selected);
              if (ps.length === 0) return null;
              return (
                <div className="mb-2">
                  <strong>Passenger{ps.length > 1 ? `s (${ps.length})` : ''}:</strong>
                  <ul className="ps-3 mb-1">
                    {ps.map((p, i) => {
                      const extra = [
                        p.age && `${p.age}y`,
                        p.gender,
                        p.seatPreference && p.seatPreference !== 'No preference' && p.seatPreference,
                        p.mealPreference && p.mealPreference !== 'No meal' && p.mealPreference,
                      ].filter(Boolean).join(', ');
                      return (
                        <li key={i} className="small">
                          {p.fullName || `Passenger ${i + 1}`}{extra && ` — ${extra}`}
                          {p.idType && p.idNumber && <div className="text-muted" style={{fontSize:'0.7rem'}}>{p.idType}: {p.idNumber}</div>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })()}
            <p><strong>Amount:</strong> ₹{(selected.amount||selected.totalAmount||0).toLocaleString()}</p>
            <p><strong>Status:</strong> <StatusBadge status={selected.status} /></p>
            <p><strong>Inventory:</strong> #{selected.inventoryId}</p>
            {(selected.status === 'CONFIRMED' || selected.status === 'PENDING') && (
              <button className="btn btn-sm btn-danger mt-3" onClick={() => handleCancel(selected)}>Cancel Booking</button>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
