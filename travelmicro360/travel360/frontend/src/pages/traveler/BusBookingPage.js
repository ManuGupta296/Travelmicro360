import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, CreditCard, Smartphone, Building2, Wallet, Briefcase, Palmtree, Bus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { SkeletonCard } from '../../components/shared/SharedComponents';
import CorporateInfoModal from '../../components/shared/CorporateInfoModal';
import api from '../../services/api';
import PassengersSection, { emptyPassenger, validatePassengers } from '../../components/PassengersSection';

const PAYMENT_METHODS = [
  { key: 'UPI', label: 'UPI', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
  { key: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard, desc: 'Visa, Mastercard, Amex' },
  { key: 'NET_BANKING', label: 'Net Banking', icon: Building2, desc: 'All major banks' },
  { key: 'WALLET', label: 'Wallet', icon: Wallet, desc: 'Travel360 Wallet' },
];

const SEAT_OPTIONS = {
  TRAIN: ['No preference', 'Lower Berth', 'Middle Berth', 'Upper Berth', 'Side Lower', 'Side Upper'],
  BUS: ['No preference', 'Window', 'Aisle', 'Sleeper Upper', 'Sleeper Lower'],
};

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

export default function BusBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [travelDate] = useState(() => getValidatedTravelDate(searchParams.get('date')));

  const [passengers, setPassengers] = useState(() => [{ ...emptyPassenger(), fullName: user?.name || '' }]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [boardingPoint, setBoardingPoint] = useState('');
  const [dropPoint, setDropPoint] = useState('');
  const [travelInsurance, setTravelInsurance] = useState(false);
  const [specialRequest, setSpecialRequest] = useState('');

  const isCorporate = !!user?.companyName && user.companyName !== 'Independent';
  const purpose = isCorporate ? 'BUSINESS' : 'PERSONAL';
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [approverManagerEmail, setApproverManagerEmail] = useState('');

  useEffect(() => {
    api.get(`/inventories/${id}`)
      .then(res => setInventory(res.data))
      .catch(() => toast.error('Failed to load bus details'))
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

  const details = (() => { try { return JSON.parse(inventory?.details || '{}'); } catch { return {}; } })();

  const itemType = inventory?.itemType;
  const metaParts = [];
  if (itemType === 'TRAIN') {
    [details.duration, details.class, details.operator].forEach(v => { if (v) metaParts.push(v); });
  } else if (itemType === 'BUS') {
    [details.duration, details.vehicle, details.operator].forEach(v => { if (v) metaParts.push(v); });
  } else if (itemType === 'TRANSPORT') {
    [details.vehicle, details.capacity && `${details.capacity} seats`, details.duration, details.includes].forEach(v => { if (v) metaParts.push(v); });
  }
  const detailMeta = metaParts.join(' • ');

  const totalSeats = details.capacity || 20;
  const bookedSeats = useMemo(() => {
    const s = new Set();
    const count = Math.floor(totalSeats * 0.3);
    while (s.size < count) s.add(Math.floor(Math.random() * totalSeats) + 1);
    return s;
  }, [totalSeats]);

  const boardingPoints = details.boardingPoints || ['Main Bus Stand', 'Highway Stop', 'City Center'];
  const dropPoints = details.dropPoints || ['Main Bus Stand', 'Highway Stop', 'City Center'];

  const basePrice = inventory?.price || 0;
  const addonsTotal = travelInsurance ? 50 * passengers.length : 0;
  const totalAmount = basePrice * passengers.length + addonsTotal;

  const toggleSeat = (seatNum) => {
    if (bookedSeats.has(seatNum)) return;
    setSelectedSeats(prev =>
      prev.includes(seatNum) ? prev.filter(s => s !== seatNum) : prev.length < passengers.length ? [...prev, seatNum] : prev
    );
  };

   const handleConfirm = async () => {
     const err = validatePassengers(passengers);
     if (err) { toast.error(err); return; }
     setSubmitting(true);
     try {
       const res = await api.post('/bookings/checkout', {
         customerId: user?.userId,
         partnerId: inventory?.partnerId,
         itemType: inventory?.itemType,
         inventoryId: Number(id),
         date: travelDate,
         amount: totalAmount,
         purpose,
         approverManagerEmail: purpose === 'BUSINESS' ? approverManagerEmail : undefined,
         passengers: JSON.stringify(passengers),
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
  if (!inventory) return <div className="text-center py-5"><h4>Bus not found</h4><button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>Go Back</button></div>;

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
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #e8f9e8, #d2f5d2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32' }}>
                <Bus size={20} />
              </div>
              <div>
                <h6 className="mb-0 fw-bold">{inventory.name}</h6>
                <small className="text-muted">{details.vehicle || details.operator || 'Trip'}</small>
              </div>
            </div>
            {(details.from || details.to) && (
              <div className="text-muted small mb-2">{[details.from, details.to].filter(Boolean).join(' → ')}</div>
            )}
            {(details.departure || details.arrival) && (
              <div className="text-muted small mb-1">{[details.departure, details.arrival].filter(Boolean).join(' – ')}</div>
            )}
            {detailMeta && <div className="text-muted small">{detailMeta}</div>}
            <hr />
            <div className="d-flex justify-content-between mb-1"><span className="text-muted small">Fare x {passengers.length}</span><span className="small">₹{(basePrice * passengers.length).toLocaleString()}</span></div>
            {travelInsurance && <div className="d-flex justify-content-between mb-1"><span className="text-muted small">Travel insurance</span><span className="small">₹{(50 * passengers.length)}</span></div>}
            <hr />
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Total</span>
              <span className="fw-bold" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Seat Map — only meaningful for buses */}
          {itemType === 'BUS' && (
          <div className="t-card p-4 mt-3">
            <h6 className="fw-bold mb-2">Select Seats ({selectedSeats.length}/{passengers.length})</h6>
            <div className="d-flex gap-3 mb-2">
              <span className="small"><span style={{display:'inline-block',width:16,height:16,background:'#e0e0e0',borderRadius:3,marginRight:4,verticalAlign:'middle'}}></span> Available</span>
              <span className="small"><span style={{display:'inline-block',width:16,height:16,background:'var(--primary)',borderRadius:3,marginRight:4,verticalAlign:'middle'}}></span> Selected</span>
              <span className="small"><span style={{display:'inline-block',width:16,height:16,background:'#ccc',borderRadius:3,marginRight:4,verticalAlign:'middle',opacity:0.5}}></span> Booked</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 20px 1fr 1fr', gap: 6, maxWidth: 260 }}>
              {Array.from({ length: totalSeats }, (_, i) => {
                const seat = i + 1;
                const isBooked = bookedSeats.has(seat);
                const isSelected = selectedSeats.includes(seat);
                const col = (i % 4);
                return (
                  <React.Fragment key={seat}>
                    {col === 2 && <div />}
                    <button
                      type="button"
                      className="btn btn-sm"
                      disabled={isBooked}
                      onClick={() => toggleSeat(seat)}
                      style={{
                        width: 36, height: 32, padding: 0, fontSize: '0.7rem',
                        background: isBooked ? '#ccc' : isSelected ? 'var(--primary)' : '#e0e0e0',
                        color: isSelected ? 'white' : '#333',
                        opacity: isBooked ? 0.5 : 1,
                        borderRadius: 4, border: 'none'
                      }}
                    >{seat}</button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          )}
        </div>

        <div className="col-lg-7">
          <PassengersSection passengers={passengers} setPassengers={setPassengers} showMeal={false} maxPassengers={6}
            showSeat={itemType !== 'TRANSPORT'}
            seatOptions={SEAT_OPTIONS[itemType] || ['No preference', 'Window', 'Aisle']} />

          {/* Boarding/Drop — buses only (trains/cabs don't use boarding stops) */}
          {itemType === 'BUS' && (
          <div className="t-card p-4 mb-3">
            <h6 className="fw-bold mb-3">Boarding and Drop Points</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Boarding Point</label>
                <select className="form-select" value={boardingPoint} onChange={e => setBoardingPoint(e.target.value)}>
                  <option value="">-- Select --</option>
                  {boardingPoints.map(bp => <option key={bp} value={bp}>{bp}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Drop Point</label>
                <select className="form-select" value={dropPoint} onChange={e => setDropPoint(e.target.value)}>
                  <option value="">-- Select --</option>
                  {dropPoints.map(dp => <option key={dp} value={dp}>{dp}</option>)}
                </select>
              </div>
            </div>
          </div>
          )}

          {/* Add-ons */}
          <div className="t-card p-4 mb-3">
            <h6 className="fw-bold mb-3">Add-ons</h6>
            <label className="d-flex align-items-center gap-2">
              <input type="checkbox" className="form-check-input" checked={travelInsurance} onChange={e => setTravelInsurance(e.target.checked)} />
              <span className="small">Travel insurance — ₹50 per passenger</span>
            </label>
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

