import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Building2, Wallet, CheckCircle, ArrowLeft, Plane, Hotel, Car } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { SkeletonCard } from '../../components/shared/SharedComponents';
import api from '../../services/api';
import PassengersSection, { emptyPassenger, validatePassengers } from '../../components/PassengersSection';

const PAYMENT_METHODS = [
  { key: 'UPI', label: 'UPI', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
  { key: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard, desc: 'Visa, Mastercard, Amex' },
  { key: 'NET_BANKING', label: 'Net Banking', icon: Building2, desc: 'All major banks' },
  { key: 'WALLET', label: 'Wallet', icon: Wallet, desc: 'Travel360 Wallet' },
];

const SEAT_OPTIONS = {
  FLIGHT: ['No preference', 'Window', 'Middle', 'Aisle'],
  TRAIN: ['No preference', 'Lower Berth', 'Middle Berth', 'Upper Berth', 'Side Lower', 'Side Upper'],
  BUS: ['No preference', 'Window', 'Aisle', 'Sleeper Upper', 'Sleeper Lower'],
};

export default function BookingPage() {
  const { inventoryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const isCorporate = !!user?.companyName && user.companyName !== 'Independent';
  const purpose = isCorporate ? 'BUSINESS' : 'PERSONAL';
  const [passengers, setPassengers] = useState(() => [{ ...emptyPassenger(), fullName: user?.name || '' }]);
  const isHotel = inventory?.itemType === 'HOTEL';
  const unitPrice = inventory?.price || 0;
  const totalAmount = isHotel ? unitPrice : unitPrice * passengers.length;

  useEffect(() => {
    api.get(`/inventories/${inventoryId}`)
      .then(res => setInventory(res.data))
      .catch(() => toast.error('Failed to load inventory'))
      .finally(() => setLoading(false));
  }, [inventoryId]);

  const details = (() => { try { return JSON.parse(inventory?.details || '{}'); } catch { return {}; } })();

  const handleConfirm = async () => {
    const err = validatePassengers(passengers);
    if (err) { toast.error(err); return; }
    setSubmitting(true);
    try {
      const travelDate = new Date();
      travelDate.setDate(travelDate.getDate() + 7);
      const res = await api.post('/bookings/checkout', {
        inventoryId: Number(inventoryId),
        travelDate: travelDate.toISOString().split('T')[0],
        travelerName: passengers[0].fullName,
        travelerEmail: user?.email,
        amount: totalAmount,
        paymentMethod,
        purpose,
        passengers: JSON.stringify(passengers),
      });
      setSuccess(res.data);
      if (purpose === 'BUSINESS') {
        toast.success('Submitted for approval. You\'ll be notified once your manager approves.');
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
  if (!inventory) return <div className="text-center py-5"><h4>Inventory not found</h4><button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>Go Back</button></div>;

  if (success) {
    return (
      <div className="text-center py-5">
        <div style={{ fontSize: '4rem' }}><CheckCircle size={64} className="text-success" /></div>
        <h3 className="fw-bold mt-3" style={{ color: 'var(--primary)' }}>
          {success.status === 'PENDING' ? 'Booking Submitted for Approval' : 'Booking Confirmed!'}
        </h3>
        <p className="text-muted">Your booking ID is <strong>#{success.bookingId}</strong></p>
        <div className="t-card p-3 mx-auto" style={{ maxWidth: 400 }}>
          <div className="small text-muted">Invoice #{success.invoiceId} • Payment #{success.paymentId}</div>
          <div className="small text-muted">Reservation #{success.reservationId}</div>
          <div className="mt-2 fw-bold text-success">Status: {success.status}</div>
        </div>
        <p className="text-muted small mt-3">Redirecting to My Trips...</p>
      </div>
    );
  }

  const typeIcon = inventory.itemType === 'FLIGHT' ? <Plane size={20} /> : inventory.itemType === 'HOTEL' ? <Hotel size={20} /> : <Car size={20} />;

  return (
    <div>
      <button className="btn btn-sm btn-light mb-3 d-flex align-items-center gap-1" onClick={() => navigate(-1)}>
        <ArrowLeft size={14} /> Back to results
      </button>

      <div className="row">
        {/* Left: Summary */}
        <div className="col-lg-5 mb-4">
          <div className="t-card p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-lighter)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                {typeIcon}
              </div>
              <div>
                <h6 className="mb-0 fw-bold">{inventory.name}</h6>
                <small className="text-muted">{inventory.itemType}</small>
              </div>
            </div>

            {inventory.itemType === 'FLIGHT' && (
              <div className="mb-3">
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
              </div>
            )}
            {inventory.itemType === 'TRAIN' && (
              <div className="mb-3">
                {(details.from || details.to) && <div className="text-muted small">{[details.from, details.to].filter(Boolean).join(' → ')}</div>}
                {(details.departure || details.arrival) && <div className="text-muted small">{[details.departure, details.arrival].filter(Boolean).join(' – ')}</div>}
                {[details.duration, details.class, details.operator].filter(Boolean).length > 0 && (
                  <div className="text-muted small">{[details.duration, details.class, details.operator].filter(Boolean).join(' • ')}</div>
                )}
              </div>
            )}
            {inventory.itemType === 'BUS' && (
              <div className="mb-3">
                {(details.from || details.to) && <div className="text-muted small">{[details.from, details.to].filter(Boolean).join(' → ')}</div>}
                {details.departure && <div className="text-muted small">{details.departure}</div>}
                {[details.duration, details.vehicle, details.operator].filter(Boolean).length > 0 && (
                  <div className="text-muted small">{[details.duration, details.vehicle, details.operator].filter(Boolean).join(' • ')}</div>
                )}
              </div>
            )}
            {inventory.itemType === 'HOTEL' && (
              <div className="mb-3">
                <div className="text-muted small">{details.area}, {details.city}</div>
                <div className="text-muted small">{details.roomType} • {details.starRating || 0} star</div>
                <div className="text-muted small mt-1">Check-in: {details.checkIn} | Check-out: {details.checkOut}</div>
              </div>
            )}
            {inventory.itemType === 'TRANSPORT' && (
              <div className="mb-3">
                {[details.vehicle, details.capacity && `${details.capacity} seats`, details.duration, details.includes].filter(Boolean).length > 0 && (
                  <div className="text-muted small">{[details.vehicle, details.capacity && `${details.capacity} seats`, details.duration, details.includes].filter(Boolean).join(' • ')}</div>
                )}
              </div>
            )}

            <hr />
            {!isHotel && (
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted small">Fare × {passengers.length}</span>
                <span className="small">₹{(unitPrice * passengers.length).toLocaleString()}</span>
              </div>
            )}
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted">Total Amount</span>
              <span className="fw-bold" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="col-lg-7">
          <PassengersSection passengers={passengers} setPassengers={setPassengers}
            showMeal={inventory.itemType === 'FLIGHT'}
            showSeat={['FLIGHT', 'TRAIN', 'BUS'].includes(inventory.itemType)}
            seatOptions={SEAT_OPTIONS[inventory.itemType] || ['No preference', 'Window', 'Aisle']} />

          <div className="t-card p-4 mb-3">
            <h6 className="fw-bold mb-3">Purpose of Travel</h6>
            <div className="t-card p-3" style={{ border: '1px solid var(--border)' }}>
              <div className="fw-semibold small">{isCorporate ? 'Business' : 'Personal'}</div>
              {!isCorporate && <div className="text-muted" style={{ fontSize: '0.65rem' }}>Confirmed instantly</div>}
            </div>
          </div>

          {purpose === 'PERSONAL' ? (
            <>
              <div className="t-card p-4 mb-3">
                <h6 className="fw-bold mb-3">Payment Method</h6>
                <div className="row g-2">
                  {PAYMENT_METHODS.map(pm => (
                    <div className="col-6" key={pm.key}>
                      <div
                        className={`t-card p-3 text-center`}
                        style={{ cursor: 'pointer', border: paymentMethod === pm.key ? '2px solid var(--primary)' : '1px solid var(--border)', transition: 'all 0.2s' }}
                        onClick={() => setPaymentMethod(pm.key)}
                      >
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
                {submitting ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString()} & Confirm Booking`}
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
