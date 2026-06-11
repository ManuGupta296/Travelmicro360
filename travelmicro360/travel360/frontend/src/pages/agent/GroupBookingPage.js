import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Trash2, CheckCircle, Search, Plane, Building2, TrainFront, Bus, Car, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { Stepper } from '../../components/shared/SharedComponents';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { isValidEmail, isValidPhone, EMAIL_ERROR, PHONE_ERROR } from '../../utils/validators';

const STEPS = ['Select Customer', 'Add Passengers', 'Select Inventory', 'Review & Confirm', 'Success'];

// Filter chip definitions — 'value' is what we match against inventory.itemType (TRANSPORT == "Car" in the UI)
const TYPE_FILTERS = [
  { key: 'ALL',       label: 'All',     icon: Layers,     value: null },
  { key: 'FLIGHT',    label: 'Flights', icon: Plane,      value: 'FLIGHT' },
  { key: 'HOTEL',     label: 'Hotels',  icon: Building2,  value: 'HOTEL' },
  { key: 'BUS',       label: 'Bus',     icon: Bus,        value: 'BUS' },
  { key: 'TRAIN',     label: 'Train',   icon: TrainFront, value: 'TRAIN' },
  { key: 'TRANSPORT', label: 'Car',     icon: Car,        value: 'TRANSPORT' },
];

const TYPE_BADGE = {
  FLIGHT:    { color: '#3b82f6', label: 'FLIGHT' },
  HOTEL:     { color: '#8b5cf6', label: 'HOTEL' },
  TRAIN:     { color: '#0ea5e9', label: 'TRAIN' },
  BUS:       { color: '#f59e0b', label: 'BUS' },
  TRANSPORT: { color: '#10b981', label: 'CAB' },
};

// Display-only: build a compact per-type detail line from the inventory's details JSON
// (same shapes the traveler cards parse). Missing fields are skipped — never shows "--:--".
function inventoryDetailLine(inv) {
  let d = {};
  try { d = inv?.details ? JSON.parse(inv.details) : {}; } catch { d = {}; }
  const t = inv?.itemType;
  const parts = [];
  if (t === 'FLIGHT' || t === 'TRAIN') {
    const route = [d.from, d.to].filter(Boolean).join(' → ');
    const times = [d.departure, d.arrival].filter(Boolean).join(' – ');
    [route, times, d.duration, d.class, t === 'TRAIN' ? d.operator : null].forEach(v => { if (v) parts.push(v); });
  } else if (t === 'BUS') {
    const route = [d.from, d.to].filter(Boolean).join(' → ');
    [route, d.departure, d.duration, d.vehicle, d.operator].forEach(v => { if (v) parts.push(v); });
  } else if (t === 'TRANSPORT') {
    [d.vehicle, d.capacity && `${d.capacity} seats`, d.duration, d.includes].forEach(v => { if (v) parts.push(v); });
  } else if (t === 'HOTEL') {
    const loc = [d.area, d.city].filter(Boolean).join(', ');
    [loc, d.roomType, d.starRating ? `${d.starRating}★` : null].forEach(v => { if (v) parts.push(v); });
  }
  return parts.join(' • ');
}

export default function GroupBookingPage() {
  const { user } = useAuth();
  const location = useLocation();
  const preselectCustomerId = location.state?.customerId;
  const [step, setStep] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [passengers, setPassengers] = useState([{ name: '', email: '', phone: '', type: 'Adult', age: '' }]);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [invSearch, setInvSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [confirmationsSent, setConfirmationsSent] = useState(false);
  const [pErrors, setPErrors] = useState({}); // { [rowIndex]: { email, phone } }

  useEffect(() => {
    api.get('/customers').then(r => {
      setCustomers(Array.isArray(r.data) ? r.data : r.data.content || []);
    }).catch(() => {});
    api.get('/inventories?page=0&size=200').then(r => {
      setInventories(Array.isArray(r.data.content) ? r.data.content : Array.isArray(r.data) ? r.data : []);
    }).catch(() => {});
  }, []);

  // If navigated here with a customerId (from the Customers page "Book" action),
  // pre-select that customer once the list loads and advance past Step 1.
  // No id passed → normal manual selection flow is unchanged.
  useEffect(() => {
    if (!preselectCustomerId || selectedCustomer) return;
    const match = customers.find(c => c.customerId === preselectCustomerId);
    if (match) {
      setSelectedCustomer(match);
      setStep(1);
    }
  }, [customers, preselectCustomerId, selectedCustomer]);

  const addPassenger = () => { if (passengers.length < 9) setPassengers([...passengers, { name: '', email: '', phone: '', type: 'Adult', age: '' }]); };
  const removePassenger = (i) => { if (passengers.length > 1) setPassengers(passengers.filter((_, idx) => idx !== i)); };
  const updatePassenger = (i, field, val) => {
    const p = [...passengers]; p[i][field] = val; setPassengers(p);
    if (pErrors[i]?.[field]) setPErrors(prev => ({ ...prev, [i]: { ...prev[i], [field]: undefined } }));
  };

  // Validate optional passenger email/phone before leaving Step 1 (block if any present-but-invalid).
  const goToInventory = () => {
    const errs = {};
    passengers.forEach((p, i) => {
      const e = {};
      if (p.email && !isValidEmail(p.email)) e.email = EMAIL_ERROR;
      if (p.phone && !isValidPhone(p.phone)) e.phone = PHONE_ERROR;
      if (e.email || e.phone) errs[i] = e;
    });
    setPErrors(errs);
    if (Object.keys(errs).length) return;
    setStep(2);
  };

  const totalPrice = selectedInventory ? (selectedInventory.price || 0) * passengers.length : 0;

  const handleConfirm = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (travelDate && travelDate < today) { toast.error('Travel date cannot be in the past'); return; }
    setSubmitting(true);
    const bookingResults = [];
    // Use the date picked in Step 2 if provided, else default to today + 7
    let dateStr = travelDate;
    if (!dateStr) {
      const d = new Date(); d.setDate(d.getDate() + 7);
      dateStr = d.toISOString().split('T')[0];
    }

    for (const p of passengers) {
      try {
        const res = await api.post('/bookings/checkout', {
          customerId: selectedCustomer.customerId,
          partnerId: selectedInventory.partnerId,
          itemType: selectedInventory.itemType,
          inventoryId: selectedInventory.inventoryId,
          date: dateStr,
          amount: selectedInventory.price,
          agentCustomerId: user?.userId,
        });
        bookingResults.push({ ...res.data, passenger: p.name, success: true });
      } catch (err) {
        bookingResults.push({ passenger: p.name, success: false, error: err.response?.data?.message || 'Failed' });
      }
    }
    setResults(bookingResults);
    const successCount = bookingResults.filter(r => r.success).length;
    if (successCount === passengers.length) toast.success(`All ${successCount} bookings confirmed!`);
    else if (successCount > 0) toast.success(`${successCount}/${passengers.length} bookings confirmed. Some failed.`);
    else toast.error('All bookings failed.');
    setSubmitting(false);
    setStep(4);
  };

  const exportCsv = () => {
    const rows = results.filter(r => r.success).map(r => `${r.bookingId},${r.passenger},${selectedInventory?.name},${selectedInventory?.price},${r.status}`);
    const csv = 'BookingID,Passenger,Item,Amount,Status\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'group_booking.csv'; a.click();
  };

  const filteredCustomers = customers.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.email?.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredInv = useMemo(() => {
    const search = invSearch.trim().toLowerCase();
    const from = fromCity.trim().toLowerCase();
    const to = toCity.trim().toLowerCase();
    const activeType = TYPE_FILTERS.find(t => t.key === typeFilter)?.value;

    return inventories.filter(inv => {
      // Capacity
      if ((inv.availability ?? 0) < passengers.length) return false;
      // Type chip
      if (activeType && inv.itemType !== activeType) return false;
      // Parse structured details if available
      let det = {};
      try { det = inv.details ? JSON.parse(inv.details) : {}; } catch { det = {}; }
      const haystack = [inv.name, inv.itemType, det.from, det.to, det.city, det.operator]
        .filter(Boolean).join(' ').toLowerCase();
      // Free-text search (name, route, type, operator)
      if (search && !haystack.includes(search)) return false;
      // Cabs/transport are local point-to-point services with no from/to route —
      // don't apply the From/To city filter to them (parity with traveler search).
      if (inv.itemType !== 'TRANSPORT') {
        // From city — match name or details.from / details.city
        if (from && !haystack.includes(from)) return false;
        // To city — same fallback
        if (to && !haystack.includes(to)) return false;
      }
      return true;
    });
  }, [inventories, invSearch, typeFilter, fromCity, toCity, passengers.length]);

  return (
    <div>
      <h4 className="fw-bold mb-4">New Booking</h4>
      <Stepper steps={STEPS} current={step} />
      <div className="t-card p-4 mt-4">

        {/* Step 0: Select Customer */}
        {step === 0 && (
          <div>
            <h6 className="fw-bold mb-3">Select Primary Customer (Payer)</h6>
            <div className="position-relative mb-3" style={{maxWidth:400}}>
              <Search size={14} className="position-absolute text-muted" style={{left:10,top:10}} />
              <input className="form-control form-control-sm ps-4" placeholder="Search customers..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div style={{maxHeight:300, overflowY:'auto'}}>
              {filteredCustomers.map(c => (
                <div key={c.customerId} className={`p-2 border rounded mb-2 d-flex align-items-center gap-2 ${selectedCustomer?.customerId === c.customerId ? 'border-primary bg-light' : ''}`}
                  style={{cursor:'pointer'}} onClick={() => setSelectedCustomer(c)}>
                  <div className="fw-semibold small">{c.name}</div>
                  <div className="text-muted small">{c.email}</div>
                </div>
              ))}
            </div>
            <button className="btn btn-accent btn-sm mt-3" disabled={!selectedCustomer} onClick={() => setStep(1)}>Next →</button>
          </div>
        )}

        {/* Step 1: Add Passengers */}
        {step === 1 && (
          <div>
            <h6 className="fw-bold mb-3">Passengers ({passengers.length})</h6>
            {passengers.map((p, i) => (
              <div key={i} className="row g-2 mb-2 align-items-end">
                <div className="col-md-3"><input className="form-control form-control-sm" placeholder="Name" value={p.name} onChange={e => updatePassenger(i, 'name', e.target.value)} /></div>
                <div className="col-md-2"><input className={`form-control form-control-sm ${pErrors[i]?.email ? 'is-invalid' : ''}`} placeholder="Email" value={p.email} onChange={e => updatePassenger(i, 'email', e.target.value)} />{pErrors[i]?.email && <div className="text-danger" style={{fontSize:'0.7rem'}}>{pErrors[i].email}</div>}</div>
                <div className="col-md-2"><input className={`form-control form-control-sm ${pErrors[i]?.phone ? 'is-invalid' : ''}`} inputMode="numeric" placeholder="Phone" value={p.phone} onChange={e => updatePassenger(i, 'phone', e.target.value)} />{pErrors[i]?.phone && <div className="text-danger" style={{fontSize:'0.7rem'}}>{pErrors[i].phone}</div>}</div>
                <div className="col-md-2"><select className="form-select form-select-sm" value={p.type} onChange={e => updatePassenger(i, 'type', e.target.value)}><option>Adult</option><option>Child</option><option>Infant</option><option>Senior</option></select></div>
                <div className="col-md-1"><input type="number" className="form-control form-control-sm" placeholder="Age" min="0" max="120" value={p.age} onChange={e => updatePassenger(i, 'age', e.target.value)} /></div>
                <div className="col-md-2">{passengers.length > 1 && <button className="btn btn-sm btn-outline-danger" onClick={() => removePassenger(i)}><Trash2 size={13}/></button>}</div>
              </div>
            ))}
            <p className="text-muted mt-1" style={{fontSize:'0.7rem'}}>Adults (18+) full fare. Children (2-17) 25% off. Infants (&lt;2) free. Seniors (60+) 10% off.</p>
            <button className="btn btn-sm btn-outline-primary mt-2" onClick={addPassenger} disabled={passengers.length >= 9}><Plus size={13}/> Add Passenger</button>
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-light btn-sm" onClick={() => setStep(0)}>← Back</button>
              <button className="btn btn-accent btn-sm" disabled={!passengers[0].name} onClick={goToInventory}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 2: Select Inventory */}
        {step === 2 && (
          <div>
            <div className="d-flex justify-content-between align-items-baseline mb-3">
              <h6 className="fw-bold mb-0">Select Inventory</h6>
              <span className="text-muted small">{filteredInv.length} result{filteredInv.length === 1 ? '' : 's'} · min {passengers.length} seat{passengers.length === 1 ? '' : 's'}</span>
            </div>

            {/* Type filter chips */}
            <div className="d-flex flex-wrap gap-2 mb-3">
              {TYPE_FILTERS.map(t => {
                const Icon = t.icon;
                const active = typeFilter === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTypeFilter(t.key)}
                    className="btn btn-sm d-flex align-items-center gap-1"
                    style={{
                      background: active ? 'var(--primary)' : '#fff',
                      color: active ? '#fff' : '#475569',
                      border: `1px solid ${active ? 'var(--primary)' : '#cbd5e1'}`,
                      fontSize: '0.78rem',
                      padding: '0.3rem 0.7rem',
                      borderRadius: '999px',
                      fontWeight: 500,
                    }}
                  >
                    <Icon size={13} /> {t.label}
                  </button>
                );
              })}
            </div>

            {/* Search + optional from/to/date */}
            <div className="row g-2 mb-3">
              <div className="col-md-5 position-relative">
                <Search size={14} className="position-absolute text-muted" style={{ left: 10, top: 10 }} />
                <input
                  className="form-control form-control-sm ps-4"
                  placeholder="Search by route, name, or type..."
                  value={invSearch}
                  onChange={e => setInvSearch(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <input className="form-control form-control-sm" placeholder="From city" value={fromCity} onChange={e => setFromCity(e.target.value)} />
              </div>
              <div className="col-md-2">
                <input className="form-control form-control-sm" placeholder="To city" value={toCity} onChange={e => setToCity(e.target.value)} />
              </div>
              <div className="col-md-3">
                <input type="date" className="form-control form-control-sm" min={new Date().toISOString().split('T')[0]} value={travelDate} onChange={e => setTravelDate(e.target.value)} />
              </div>
            </div>

            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {filteredInv.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-muted small fw-semibold">No matching inventory</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Try a different type filter, clear the route fields, or reduce the passenger count.
                  </div>
                </div>
              ) : filteredInv.map(inv => {
                const badge = TYPE_BADGE[inv.itemType] || { color: '#94a3b8', label: inv.itemType };
                const isSelected = selectedInventory?.inventoryId === inv.inventoryId;
                const detail = inventoryDetailLine(inv);
                return (
                  <div
                    key={inv.inventoryId}
                    className={`p-3 border rounded mb-2 d-flex justify-content-between align-items-center ${isSelected ? 'border-primary bg-light' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedInventory(inv)}
                  >
                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                      <span
                        className="badge"
                        style={{
                          background: badge.color + '22',
                          color: badge.color,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '0.3rem 0.55rem',
                          minWidth: 56,
                          textAlign: 'center',
                        }}
                      >
                        {badge.label}
                      </span>
                      <div>
                        <div className="fw-semibold small">{inv.name}</div>
                        {detail && <div className="text-muted" style={{ fontSize: '0.7rem' }}>{detail}</div>}
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                          {inv.availability} seat{inv.availability === 1 ? '' : 's'} available
                        </div>
                      </div>
                    </div>
                    <div className="fw-bold">₹{(inv.price || 0).toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-light btn-sm" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-accent btn-sm" disabled={!selectedInventory} onClick={() => setStep(3)}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <div>
            <h6 className="fw-bold mb-3">Review & Confirm</h6>
            <div className="row g-3">
              <div className="col-md-7">
                <div className="t-card p-3 mb-3">
                  <div className="small text-muted mb-1">Primary Customer</div>
                  <div className="fw-bold">{selectedCustomer?.name} — {selectedCustomer?.email}</div>
                </div>
                <div className="t-card p-3 mb-3">
                  <div className="small text-muted mb-1">Passengers ({passengers.length})</div>
                  {passengers.map((p, i) => <div key={i} className="small">{i+1}. {p.name} ({p.type}) — {p.email}</div>)}
                </div>
                <div className="t-card p-3 mb-3">
                  <div className="small text-muted mb-1">Selected Inventory</div>
                  <div className="fw-bold">{selectedInventory?.name}</div>
                  {selectedInventory && inventoryDetailLine(selectedInventory) && (
                    <div className="small text-muted">{inventoryDetailLine(selectedInventory)}</div>
                  )}
                  <div className="small text-muted">{selectedInventory?.itemType} • ₹{(selectedInventory?.price||0).toLocaleString()} per person</div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Payment Method</label>
                  <select className="form-select form-select-sm" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                    <option>UPI</option><option>CREDIT_CARD</option><option>NET_BANKING</option><option>WALLET</option>
                  </select>
                </div>
              </div>
              <div className="col-md-5">
                <div className="t-card p-3" style={{position:'sticky', top:20}}>
                  <h6 className="fw-bold mb-2">Price Summary</h6>
                  <div className="d-flex justify-content-between small"><span>Base fare × {passengers.length}</span><span>₹{((selectedInventory?.price||0) * passengers.length).toLocaleString()}</span></div>
                  <div className="d-flex justify-content-between small text-muted"><span>Taxes (10%)</span><span>₹{Math.round(totalPrice * 0.1).toLocaleString()}</span></div>
                  <hr/>
                  <div className="d-flex justify-content-between fw-bold"><span>Total</span><span style={{color:'var(--primary)'}}>₹{Math.round(totalPrice * 1.1).toLocaleString()}</span></div>
                </div>
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-light btn-sm" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-gradient btn-sm px-4" onClick={handleConfirm} disabled={submitting}>
                {submitting ? <span className="spinner-border spinner-border-sm me-1"/> : <CheckCircle size={14} className="me-1"/>}
                Confirm Group Booking
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center py-4">
            <CheckCircle size={48} className="text-success" />
            <h5 className="fw-bold mt-2">Group Booking Complete</h5>
            <p className="text-muted small">{results.filter(r => r.success).length} of {results.length} bookings confirmed</p>
            <div className="t-card p-3 mx-auto" style={{maxWidth:500}}>
              {results.map((r, i) => (
                <div key={i} className={`d-flex justify-content-between small p-1 ${r.success ? '' : 'text-danger'}`}>
                  <span>{r.passenger}</span>
                  <span>{r.success ? `#${r.bookingId} — ${r.status}` : r.error}</span>
                </div>
              ))}
            </div>
            <div className="d-flex gap-2 justify-content-center mt-3">
              <button className="btn btn-sm btn-outline-primary" onClick={exportCsv}>Download CSV</button>
              <button className="btn btn-sm btn-outline-secondary" disabled={confirmationsSent} onClick={async () => {
                const successful = results.filter(r => r.success);
                let sent = 0;
                for (const r of successful) {
                  try {
                    await api.post('/notifications', {
                      userId: selectedCustomer?.customerId,
                      message: `Your booking #${r.bookingId} for ${selectedInventory?.name || 'trip'} has been confirmed.`,
                      category: 'BOOKING',
                      status: 'UNREAD',
                    });
                    sent++;
                  } catch {}
                }
                toast.success(`Sent ${sent} confirmation(s)`);
                setConfirmationsSent(true);
              }}>{confirmationsSent ? 'Sent' : 'Send Confirmations'}</button>
              <button className="btn btn-sm btn-accent" onClick={() => { setStep(0); setResults([]); setPassengers([{name:'',email:'',phone:'',type:'Adult',age:''}]); setSelectedCustomer(null); setSelectedInventory(null); setConfirmationsSent(false); }}>New Booking</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

