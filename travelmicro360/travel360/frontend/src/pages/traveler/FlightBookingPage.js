import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plane, CheckCircle, CreditCard, Smartphone, Building2, Wallet, Briefcase, Palmtree } from 'lucide-react';
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

export default function FlightBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [travelDate] = useState(() => getValidatedTravelDate(searchParams.get('date')));

  const [passengers, setPassengers] = useState(() => [{
    ...emptyPassenger(),
    fullName: user?.name || '',
  }]);

  const [extraBaggage, setExtraBaggage] = useState(false);
  const [priorityBoarding, setPriorityBoarding] = useState(false);
  const [travelInsurance, setTravelInsurance] = useState(false);

  const isCorporate = !!user?.companyName && user.companyName !== 'Independent';
  const purpose = isCorporate ? 'BUSINESS' : 'PERSONAL';
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [approverManagerEmail, setApproverManagerEmail] = useState('');

  useEffect(() => {
    api.get(`/inventories/${id}`)
      .then(res => setInventory(res.data))
      .catch(() => toast.error('Failed to load flight details'))
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

  const addonsTotal = ((extraBaggage ? 500 : 0) + (priorityBoarding ? 250 : 0) + (travelInsurance ? 199 : 0)) * passengers.length;
  const totalAmount = (inventory?.price || 0) * passengers.length + addonsTotal;

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
      if (purpose === 'BUSINESS') {
        toast.success('Submitted for manager approval.');
      } else {
        toast.success('Booking confirmed');
      }
      setTimeout(() => navigate('/traveler/trips'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="d-flex flex-column gap-3"><SkeletonCard height={200} /><SkeletonCard height={300} /></div>;
  if (!inventory) return <div className="text-center py-5"><h4>Flight not found</h4><button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>Go Back</button></div>;

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
          <div className="small text-muted">Reservation #{success.reservationId}</div>
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
        {/* Left: Flight Summary */}
        <div className="col-lg-5 mb-4">
          <div className="t-card p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-lighter)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Plane size={20} />
              </div>
              <div>
                <h6 className="mb-0 fw-bold">{inventory.name}</h6>
                <small className="text-muted">{details.flightNumber || 'Flight'}</small>
              </div>
            </div>
            {(details.from || details.to) && (
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="text-center">
                  {details.departure && <div className="fw-bold">{details.departure}</div>}
                  {details.from && <div className="text-muted small">{details.from}</div>}
                </div>
                {details.duration && <div className="text-muted small">{details.duration}</div>}
                <div className="text-center">
                  {details.arrival && <div className="fw-bold">{details.arrival}</div>}
                  {details.to && <div className="text-muted small">{details.to}</div>}
                </div>
              </div>
            )}
            {[details.class, details.baggage && `${details.baggage} baggage`].filter(Boolean).length > 0 && (
              <div className="text-muted small">{[details.class, details.baggage && `${details.baggage} baggage`].filter(Boolean).join(' • ')}</div>
            )}
            <hr />
            <div className="d-flex justify-content-between mb-1"><span className="text-muted small">Base fare × {passengers.length}</span><span className="small">₹{((inventory.price || 0) * passengers.length).toLocaleString()}</span></div>
            {extraBaggage && <div className="d-flex justify-content-between mb-1"><span className="text-muted small">Extra baggage</span><span className="small">₹500</span></div>}
            {priorityBoarding && <div className="d-flex justify-content-between mb-1"><span className="text-muted small">Priority boarding</span><span className="small">₹250</span></div>}
            {travelInsurance && <div className="d-flex justify-content-between mb-1"><span className="text-muted small">Travel insurance</span><span className="small">₹199</span></div>}
            <hr />
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Total</span>
              <span className="fw-bold" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="col-lg-7">
          <PassengersSection passengers={passengers} setPassengers={setPassengers}
            seatOptions={['No preference', 'Window', 'Middle', 'Aisle']} />

          {/* Add-ons */}
          <div className="t-card p-4 mb-3">
            <h6 className="fw-bold mb-3">Add-ons</h6>
            <div className="d-flex flex-column gap-2">
              <label className="d-flex align-items-center gap-2">
                <input type="checkbox" className="form-check-input" checked={extraBaggage} onChange={e => setExtraBaggage(e.target.checked)} />
                <span className="small">Extra baggage (5 kg) — ₹500</span>
              </label>
              <label className="d-flex align-items-center gap-2">
                <input type="checkbox" className="form-check-input" checked={priorityBoarding} onChange={e => setPriorityBoarding(e.target.checked)} />
                <span className="small">Priority boarding — ₹250</span>
              </label>
              <label className="d-flex align-items-center gap-2">
                <input type="checkbox" className="form-check-input" checked={travelInsurance} onChange={e => setTravelInsurance(e.target.checked)} />
                <span className="small">Travel insurance — ₹199</span>
              </label>
            </div>
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
                        <div className="text-muted" style={{ fontSize: '0.65rem' }}>{pm.desc}</div>
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

