import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, CreditCard, Smartphone, Building2, Wallet, Briefcase, Palmtree, Star, BedDouble } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { SkeletonCard } from '../../components/shared/SharedComponents';
import CorporateInfoModal from '../../components/shared/CorporateInfoModal';
import api from '../../services/api';

const PAYMENT_METHODS = [
  { key: 'UPI', label: 'UPI', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
  { key: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard, desc: 'Visa, Mastercard, Amex' },
  { key: 'NET_BANKING', label: 'Net Banking', icon: Building2, desc: 'All major banks' },
  { key: 'WALLET', label: 'Wallet', icon: Wallet, desc: 'Travel360 Wallet' },
];

const ROOM_MULTIPLIER = { Standard: 1, Deluxe: 1.5, Suite: 2 };

const getValidatedTravelDate = (urlDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (urlDate) {
    const parsed = new Date(urlDate);
    if (!isNaN(parsed.getTime()) && parsed >= today) {
      return urlDate;
    }
  }

  const fallback = new Date(today);
  fallback.setDate(fallback.getDate() + 7);
  return fallback.toISOString().split('T')[0];
};

export default function HotelBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [travelDate] = useState(() => getValidatedTravelDate(searchParams.get('date')));

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const roomType = 'Standard';
  const [numRooms, setNumRooms] = useState(1);
  const [guests, setGuests] = useState([{ name: '', age: '' }]);
  const [breakfast, setBreakfast] = useState(false);
  const [airportPickup, setAirportPickup] = useState(false);
  const [specialRequest, setSpecialRequest] = useState('');

  const isCorporate = !!user?.companyName && user.companyName !== 'Independent';
  const purpose = isCorporate ? 'BUSINESS' : 'PERSONAL';
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [approverManagerEmail, setApproverManagerEmail] = useState('');

  useEffect(() => {
    api.get(`/inventories/${id}`)
      .then(res => setInventory(res.data))
      .catch(() => toast.error('Failed to load hotel details'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (purpose === 'BUSINESS' && user?.companyName) {
      api.get('/users/by-role-and-company', { params: { role: 'CORPORATE_MANAGER', companyName: user.companyName } })
        .then(res => setApproverManagerEmail(res.data?.email || ''))
        .catch(() => setApproverManagerEmail(''));
    } else {
      setApproverManagerEmail('');
    }
  }, [purpose, user?.companyName]);

  useEffect(() => {
    const arr = [];
    for (let i = 0; i < numRooms; i++) arr.push(guests[i] || { name: '', age: '' });
    setGuests(arr);
  }, [numRooms]);

  const details = (() => { try { return JSON.parse(inventory?.details || '{}'); } catch { return {}; } })();

  const nights = (() => {
    if (!checkIn || !checkOut) return 1;
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 1;
  })();

  const basePrice = inventory?.price || 0;
  const roomCost = basePrice * ROOM_MULTIPLIER[roomType] * numRooms * nights;
  const addonsTotal = (breakfast ? 400 * nights * numRooms : 0) + (airportPickup ? 800 : 0);
  const totalAmount = Math.round(roomCost + addonsTotal);

  const today = new Date().toISOString().split('T')[0];
  const updateGuest = (i, field, val) => { const g = [...guests]; g[i] = { ...g[i], [field]: val }; setGuests(g); };

  const handleConfirm = async () => {
    if (!guests[0]?.name) { toast.error('Please fill guest details'); return; }
    if (!checkIn || !checkOut) { toast.error('Please select check-in and check-out dates'); return; }
    if (checkIn < today) { toast.error('Check-in date cannot be in the past'); return; }
    if (checkOut <= checkIn) { toast.error('Check-out must be after check-in'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/bookings/checkout', {
        customerId: user?.userId,
        partnerId: inventory?.partnerId,
        itemType: inventory?.itemType,
        inventoryId: Number(id),
        date: checkIn,
        amount: totalAmount,
        purpose,
        approverManagerEmail: purpose === 'BUSINESS' ? approverManagerEmail : undefined,
        paymentMethod,
      });
      setSuccess(res.data);
      toast.success(purpose === 'BUSINESS' ? 'Submitted for manager approval.' : 'Booking confirmed');
      setTimeout(() => navigate('/traveler/trips'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="d-flex flex-column gap-3"><SkeletonCard height={200} /><SkeletonCard height={300} /></div>;
  if (!inventory) return <div className="text-center py-5"><h4>Hotel not found</h4><button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>Go Back</button></div>;

  if (success) {
    return (
      <div className="text-center py-5">
        <CheckCircle size={64} className="text-success mb-3" />
        <h3 className="fw-bold mt-3" style={{ color: 'var(--primary)' }}>
          {success.status === 'PENDING' ? 'Booking Submitted for Approval' : 'Booking Confirmed'}
        </h3>
        <p className="text-muted">Booking ID: <strong>#{success.bookingId}</strong></p>
        <div className="t-card p-3 mx-auto" style={{ maxWidth: 400 }}>
          <div className="small text-muted">Invoice #{success.invoiceId} | Payment #{success.paymentId}</div>
          <div className="mt-2 fw-bold text-success">Status: {success.status}</div>
        </div>
        <p className="text-muted small mt-3">Redirecting to My Trips...</p>
      </div>
    );
  }

  return (
    <div>
      <CorporateInfoModal />
      <button className="btn btn-sm btn-light mb-3 d-flex align-items-center gap-1" onClick={() => navigate(-1)}>
        <ArrowLeft size={14} /> Back to results
      </button>

      <div className="row">
        <div className="col-lg-5 mb-4">
          <div className="t-card p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-lighter)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <BedDouble size={20} />
              </div>
              <div>
                <h6 className="mb-0 fw-bold">{inventory.name}</h6>
                <small className="text-muted">{details.area}, {details.city}</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-1 mb-2">
              {Array.from({ length: details.starRating || 0 }).map((_, i) => <Star key={i} size={14} fill="#ff9800" stroke="#ff9800" />)}
            </div>
            <div className="text-muted small mb-2">{details.roomType} | {(() => {
              const a = details.amenities;
              if (Array.isArray(a)) return a.join(', ');
              if (typeof a === 'string') {
                try { const p = JSON.parse(a); return Array.isArray(p) ? p.join(', ') : a; }
                catch { return a; }
              }
              return '';
            })()}</div>
            {details.cancellable && <div className="text-success small fw-semibold mb-2">Free cancellation available</div>}
            <hr />
            <div className="d-flex justify-content-between mb-1"><span className="text-muted small">Base rate/night</span><span className="small">₹{basePrice.toLocaleString()}</span></div>
            <div className="d-flex justify-content-between mb-1"><span className="text-muted small">{numRooms} room(s) x {nights} night(s)</span><span className="small">₹{Math.round(roomCost).toLocaleString()}</span></div>
            {breakfast && <div className="d-flex justify-content-between mb-1"><span className="text-muted small">Breakfast</span><span className="small">₹{(400 * nights * numRooms).toLocaleString()}</span></div>}
            {airportPickup && <div className="d-flex justify-content-between mb-1"><span className="text-muted small">Airport pickup</span><span className="small">₹800</span></div>}
            <hr />
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Total</span>
              <span className="fw-bold" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          {/* Dates & Room */}
          <div className="t-card p-4 mb-3">
            <h6 className="fw-bold mb-3">Stay Details</h6>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Check-in</label>
                <input type="date" className="form-control" min={today} value={checkIn} onChange={e => setCheckIn(e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Check-out</label>
                <input type="date" className="form-control" min={checkIn || today} value={checkOut} onChange={e => setCheckOut(e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Nights</label>
                <input className="form-control" value={nights} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Number of Rooms</label>
                <select className="form-select" value={numRooms} onChange={e => setNumRooms(Number(e.target.value))}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Guest Details */}
          <div className="t-card p-4 mb-3">
            <h6 className="fw-bold mb-3">Guest Details</h6>
            {guests.map((g, i) => (
              <div key={i} className="row g-2 mb-2">
                <div className="col-md-1"><span className="small text-muted">#{i+1}</span></div>
                <div className="col-md-7"><input className="form-control form-control-sm" placeholder="Guest name" value={g.name} onChange={e => updateGuest(i, 'name', e.target.value)} /></div>
                <div className="col-md-4"><input className="form-control form-control-sm" type="number" placeholder="Age" value={g.age} onChange={e => updateGuest(i, 'age', e.target.value)} /></div>
              </div>
            ))}
          </div>

          {/* Add-ons */}
          <div className="t-card p-4 mb-3">
            <h6 className="fw-bold mb-3">Add-ons</h6>
            <label className="d-flex align-items-center gap-2 mb-2">
              <input type="checkbox" className="form-check-input" checked={breakfast} onChange={e => setBreakfast(e.target.checked)} />
              <span className="small">Breakfast included — ₹400/night/room</span>
            </label>
            <label className="d-flex align-items-center gap-2">
              <input type="checkbox" className="form-check-input" checked={airportPickup} onChange={e => setAirportPickup(e.target.checked)} />
              <span className="small">Airport pickup — ₹800</span>
            </label>
          </div>

          {/* Special Request */}
          <div className="t-card p-4 mb-3">
            <h6 className="fw-bold mb-3">Special Request</h6>
            <textarea className="form-control" rows={3} placeholder="E.g., late check-in, extra pillows..." value={specialRequest} onChange={e => setSpecialRequest(e.target.value)} />
          </div>

          {/* Purpose */}
          <div className="t-card p-4 mb-3">
            <h6 className="fw-bold mb-3">Purpose of Travel</h6>
            <div className="t-card p-3 d-flex align-items-center gap-2" style={{ border: '1px solid var(--border)' }}>
              {isCorporate ? <Briefcase size={22} className="text-primary" /> : <Palmtree size={22} className="text-primary" />}
              <div>
                <div className="fw-semibold small">{isCorporate ? 'Business' : 'Personal'}</div>
                {!isCorporate && <div className="text-muted" style={{ fontSize: '0.7rem' }}>Confirmed instantly</div>}
              </div>
            </div>
            {purpose === 'BUSINESS' && (
              <div className="mt-3">
                {approverManagerEmail ? (
                  <div className="alert alert-info py-2 small mb-0">
                    📋 Approval required from: <strong>{approverManagerEmail}</strong>
                  </div>
                ) : (
                  <small className="text-muted">Your company's corporate manager will be auto-assigned for approval.</small>
                )}
              </div>
            )}
          </div>

          {purpose === 'PERSONAL' ? (
            <>
              {/* Payment */}
              <div className="t-card p-4 mb-3">
                <h6 className="fw-bold mb-3">Payment Method</h6>
                <div className="row g-2">
                  {PAYMENT_METHODS.map(pm => (
                    <div className="col-6" key={pm.key}>
                      <div className="t-card p-3 text-center" style={{ cursor: 'pointer', border: paymentMethod === pm.key ? '2px solid var(--primary)' : '1px solid var(--border)' }} onClick={() => setPaymentMethod(pm.key)}>
                        <pm.icon size={24} className={paymentMethod === pm.key ? 'text-primary' : 'text-muted'} />
                        <div className="fw-semibold small mt-1">{pm.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn btn-gradient w-100 py-3 fw-bold" onClick={handleConfirm} disabled={submitting}>
                {submitting ? <span className="spinner-border spinner-border-sm me-2" /> : <CheckCircle size={18} className="me-2" />}
                {submitting ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString()} and confirm booking`}
              </button>
            </>
          ) : (
            <>
              <div className="t-card p-3 mb-3" style={{ background: '#fff8e6', border: '1px solid #f3d27a' }}>
                <div className="fw-semibold mb-1">Requires manager approval</div>
                <div className="text-muted small">
                  No payment is collected now. Your manager will review and approve this request.
                  Once approved, Finance will raise an invoice and pay the partner — you don't need to do anything.
                </div>
              </div>

              <button className="btn btn-primary w-100 py-3 fw-bold" onClick={handleConfirm} disabled={submitting}>
                {submitting ? <span className="spinner-border spinner-border-sm me-2" /> : <CheckCircle size={18} className="me-2" />}
                {submitting ? 'Submitting…' : 'Submit for Approval'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

