import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Building2, Car, MapPin, Star, Shield, CreditCard, Clock, ArrowRight, ArrowLeftRight, Briefcase, Calendar, TrendingUp, TrainFront, Bus } from 'lucide-react';
import Autocomplete from '../../components/shared/Autocomplete';
import CITIES from '../../data/cities';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const features = [
  { icon: <Shield size={28}/>, title: 'Secure Booking', desc: '100% secure payments & data' },
  { icon: <CreditCard size={28}/>, title: 'Easy Payments', desc: 'UPI, Cards, Wallets & more' },
  { icon: <Clock size={28}/>, title: 'Instant Confirmation', desc: 'E-ticket in seconds' },
  { icon: <Star size={28}/>, title: 'Best Prices', desc: 'Guaranteed lowest fares' },
];

export default function TravelerHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState('flights');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [tripType, setTripType] = useState('one-way');
  const [cabinClass, setCabinClass] = useState('Economy');

  // KPIs & recent bookings — fetched from /bookings (server returns all; filter client-side by customerId)
  const [myBookings, setMyBookings] = useState([]);
  useEffect(() => {
    if (!user?.userId) return;
    api.get('/bookings', { params: { page: 0, size: 200, sort: 'createdAt,desc' } })
      .then(res => {
        const all = Array.isArray(res.data.content) ? res.data.content : Array.isArray(res.data) ? res.data : [];
        setMyBookings(all.filter(b => b.customerId === user.userId));
      })
      .catch(() => setMyBookings([]));
  }, [user?.userId]);

  const kpis = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const active = myBookings.filter(b => b.status !== 'CANCELLED');
    return {
      total: myBookings.length,
      upcoming: myBookings.filter(b => b.status === 'CONFIRMED' && (b.date || '') >= today).length,
      spent: active.reduce((s, b) => s + Number(b.amount || 0), 0),
    };
  }, [myBookings]);

  const recentBookings = useMemo(() => myBookings.slice(0, 5), [myBookings]);

  const cityItems = CITIES.map(c => ({ label: c.label, sub: c.country, value: c.code }));
  const today = new Date().toISOString().split('T')[0];

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ type: tab, from: from || '', to: to || '', date, returnDate, travelers, cabinClass });
    navigate(`/search?${params}`);
    // Save to recent searches — only complete route searches (both origin & destination chosen)
    if (from && to) {
      const recent = JSON.parse(localStorage.getItem('t360_recent') || '[]');
      recent.unshift({ type: tab, from, to, date, time: Date.now() });
      localStorage.setItem('t360_recent', JSON.stringify(recent.slice(0, 10)));
    }
  };

  // Recent searches from localStorage — drop incomplete entries and de-duplicate by route.
  const recentSearches = (() => {
    const all = JSON.parse(localStorage.getItem('t360_recent') || '[]').filter(s => s.from && s.to);
    const seen = new Set();
    return all.filter(s => {
      const key = `${s.type}|${s.from}|${s.to}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 5);
  })();

  return (
    <div>
      {/* Hero */}
      <section className="hero-section">
        <div className="container">
          <h1 className="mb-2">Where to next?</h1>
          <p style={{ opacity: 0.85, fontSize: '0.95rem' }}>Search flights, hotels & transport — best prices guaranteed</p>
        </div>
      </section>

      {/* KPI Cards */}
      <div className="container mt-4">
        <div className="row g-3">
          {[
            { label: 'Total Bookings', value: kpis.total, icon: <Briefcase size={20}/>, color: 'var(--primary)' },
            { label: 'Upcoming Trips', value: kpis.upcoming, icon: <Calendar size={20}/>, color: '#16a34a' },
            { label: 'Total Spent', value: `₹${kpis.spent.toLocaleString()}`, icon: <TrendingUp size={20}/>, color: '#d97706' },
          ].map(k => (
            <div className="col-6 col-md-4" key={k.label}>
              <div className="t-card p-3 h-100 d-flex align-items-center gap-3">
                <div className="d-inline-flex align-items-center justify-content-center"
                  style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--primary-lighter)', color: k.color }}>
                  {k.icon}
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.label}</div>
                  <div className="fw-bold" style={{ fontSize: '1.35rem', lineHeight: 1.1 }}>{k.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search Widget */}
      <div className="container mt-4">
        <div className="search-widget">
          {/* Tabs */}
          <ul className="nav search-tabs mb-3">
            {[
              { key: 'flights', icon: <Plane size={15}/>, label: 'Flights' },
              { key: 'hotels',  icon: <Building2 size={15}/>, label: 'Hotels' },
              { key: 'trains',  icon: <TrainFront size={15}/>, label: 'Trains' },
              { key: 'buses',   icon: <Bus size={15}/>, label: 'Buses' },
              { key: 'cabs',    icon: <Car size={15}/>, label: 'Cabs' },
            ].map(t => (
              <li className="nav-item" key={t.key}>
                <button className={`nav-link ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                  {t.icon} <span className="ms-1">{t.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Trip type (flights only) */}
          {tab === 'flights' && (
            <div className="d-flex gap-3 mb-3">
              {['one-way', 'round-trip'].map(t => (
                <label className="form-check-label d-flex align-items-center gap-1 small" key={t}>
                  <input type="radio" className="form-check-input" name="tripType"
                    checked={tripType === t} onChange={() => setTripType(t)} />
                  {t.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
              ))}
            </div>
          )}

          <form onSubmit={handleSearch}>
            <div className="row g-2 align-items-end">
              {(tab === 'flights' || tab === 'trains' || tab === 'buses') && (
                <>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">From</label>
                    <Autocomplete
                      items={cityItems}
                      value={from}
                      onChange={(item) => setFrom(item.label)}
                      placeholder="City or airport"
                      icon={<MapPin size={14}/>}
                    />
                  </div>
                  <div className="col-auto d-flex align-items-end pb-2">
                    <button type="button" className="btn btn-light btn-sm rounded-circle" onClick={() => { const tmp = from; setFrom(to); setTo(tmp); }}>
                      <ArrowLeftRight size={14}/>
                    </button>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">To</label>
                    <Autocomplete
                      items={cityItems}
                      value={to}
                      onChange={(item) => setTo(item.label)}
                      placeholder="City or airport"
                      icon={<MapPin size={14}/>}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small fw-semibold">Departure</label>
                    <input type="date" className="form-control" min={today} value={date} onChange={e => setDate(e.target.value)} required />
                  </div>
                  {tripType === 'round-trip' && (
                    <div className="col-md-2">
                      <label className="form-label small fw-semibold">Return</label>
                      <input type="date" className="form-control" min={date || today} value={returnDate} onChange={e => setReturnDate(e.target.value)} />
                    </div>
                  )}
                  <div className="col-md-1">
                    <label className="form-label small fw-semibold">Pax</label>
                    <select className="form-select" value={travelers} onChange={e => setTravelers(e.target.value)}>
                      {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </>
              )}
              {tab === 'hotels' && (
                <>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">City</label>
                    <Autocomplete items={cityItems} value={from} onChange={(item) => setFrom(item.label)} placeholder="Where are you going?" icon={<MapPin size={14}/>} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Check-in</label>
                    <input type="date" className="form-control" min={today} value={date} onChange={e => setDate(e.target.value)} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Check-out</label>
                    <input type="date" className="form-control" min={date || today} value={returnDate} onChange={e => setReturnDate(e.target.value)} required />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small fw-semibold">Guests</label>
                    <select className="form-select" value={travelers} onChange={e => setTravelers(e.target.value)}>
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </>
              )}
              {tab === 'cabs' && (
                <>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Pickup</label>
                    <Autocomplete items={cityItems} value={from} onChange={(item) => setFrom(item.label)} placeholder="Pickup location" icon={<MapPin size={14}/>} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Drop</label>
                    <Autocomplete items={cityItems} value={to} onChange={(item) => setTo(item.label)} placeholder="Drop location" icon={<MapPin size={14}/>} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Date</label>
                    <input type="date" className="form-control" min={today} value={date} onChange={e => setDate(e.target.value)} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Vehicle</label>
                    <select className="form-select" value={cabinClass} onChange={e => setCabinClass(e.target.value)}>
                      <option>Sedan</option><option>SUV</option><option>Van</option><option>Luxury</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {tab === 'flights' && (
              <div className="mt-2">
                <select className="form-select form-select-sm d-inline-block w-auto" value={cabinClass} onChange={e => setCabinClass(e.target.value)}>
                  <option>Economy</option><option>Premium Economy</option><option>Business</option><option>First</option>
                </select>
              </div>
            )}

            <div className="text-center mt-3">
              <button type="submit" className="btn btn-accent px-5 py-2">
                Search <ArrowRight size={16} className="ms-1"/>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="container mt-4">
          <div className="t-card p-3">
            <h6 className="small fw-semibold text-muted mb-2">Recent Searches</h6>
            <div className="d-flex gap-2 flex-wrap">
              {recentSearches.map((s, i) => (
                <span key={i} className="badge bg-light text-dark border px-3 py-2" style={{ borderRadius: 20, cursor: 'pointer', fontSize: '0.8rem' }}
                  onClick={() => navigate(`/search?${new URLSearchParams(s)}`)}>
                  {s.from} → {s.to}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <section className="container mt-5">
          <div className="t-card p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Recent Bookings</h5>
              <button className="btn btn-sm btn-link p-0" onClick={() => navigate('/traveler/trips')}>View all <ArrowRight size={14}/></button>
            </div>
            <div style={{ overflowX: 'auto' }}>
            <table className="table table-sm mb-0 align-middle">
              <thead style={{ background: 'var(--primary-lighter)' }}>
                <tr>
                  <th className="small text-muted ps-3">ID</th>
                  <th className="small text-muted">Type</th>
                  <th className="small text-muted">Date</th>
                  <th className="small text-muted">Amount</th>
                  <th className="small text-muted pe-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(b => (
                  <tr key={b.bookingId}>
                    <td className="ps-3 small fw-semibold">#{b.bookingId}</td>
                    <td className="small">{b.itemType}</td>
                    <td className="small">{b.date}</td>
                    <td className="small">₹{Number(b.amount || 0).toLocaleString()}</td>
                    <td className="pe-3">
                      <span className={`badge ${b.status === 'CONFIRMED' ? 'bg-success' : b.status === 'PENDING' ? 'bg-warning text-dark' : b.status === 'CANCELLED' ? 'bg-danger' : 'bg-secondary'}`} style={{ fontSize: '0.7rem' }}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </section>
      )}

      {/* Why Travel360 */}
      <section className="container mt-5 mb-4">
        <h5 className="fw-bold mb-3 text-center">Why Travel360?</h5>
        <div className="row g-4">
          {features.map((f, i) => (
            <div className="col-6 col-md-3 text-center" key={i}>
              <div className="d-inline-flex align-items-center justify-content-center mb-2"
                style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--primary-lighter)', color: 'var(--primary-light)' }}>
                {f.icon}
              </div>
              <h6 className="small fw-bold mb-1">{f.title}</h6>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


