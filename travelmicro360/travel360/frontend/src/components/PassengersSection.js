import React from 'react';
import { UserPlus, Trash2, Users } from 'lucide-react';

const ID_TYPES = ['Aadhaar', 'PAN', 'Passport', 'Driving License', 'Voter ID'];
const MEAL_PREFS = ['No meal', 'Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain', 'Kosher', 'Halal'];

export const emptyPassenger = () => ({
  fullName: '',
  age: '',
  gender: 'Male',
  idType: 'Aadhaar',
  idNumber: '',
  seatPreference: 'No preference',
  mealPreference: 'No meal',
});

export const validatePassengers = (passengers) => {
  if (!Array.isArray(passengers) || passengers.length === 0) {
    return 'At least one passenger is required';
  }
  for (let i = 0; i < passengers.length; i++) {
    const p = passengers[i];
    if (!p.fullName?.trim()) return `Passenger ${i + 1}: name is required`;
    if (!p.age || +p.age < 1 || +p.age > 120) return `Passenger ${i + 1}: valid age is required`;
    if (!p.idNumber?.trim()) return `Passenger ${i + 1}: ID number is required`;
  }
  return null;
};

export default function PassengersSection({ passengers, setPassengers, showMeal = true, showSeat = true, seatOptions = ['No preference', 'Window', 'Aisle'], maxPassengers = 9 }) {
  const update = (idx, field, value) => {
    const next = [...passengers];
    next[idx] = { ...next[idx], [field]: value };
    setPassengers(next);
  };

  const add = () => {
    if (passengers.length < maxPassengers) setPassengers([...passengers, emptyPassenger()]);
  };

  const remove = (idx) => {
    if (passengers.length > 1) setPassengers(passengers.filter((_, i) => i !== idx));
  };

  return (
    <div className="t-card p-4 mb-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <Users size={18} /> Passenger Details
          </h6>
          <small className="text-muted">Multiple travelers supported</small>
        </div>
        <span className="badge bg-primary-subtle text-primary" style={{ fontSize: '0.75rem' }}>
          {passengers.length} {passengers.length === 1 ? 'traveler' : 'travelers'}
        </span>
      </div>

      {passengers.map((p, idx) => (
        <div key={idx} className="t-card p-3 mb-3" style={{ background: '#fafbfc', border: '1px solid #e6e9ec' }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold small" style={{ color: 'var(--primary)' }}>Passenger {idx + 1}</span>
            {passengers.length > 1 && (
              <button type="button" className="btn btn-sm btn-link text-danger p-0 d-flex align-items-center gap-1"
                onClick={() => remove(idx)} style={{ textDecoration: 'none' }}>
                <Trash2 size={14} /> Remove
              </button>
            )}
          </div>

          <div className="row g-2">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Full Name</label>
              <input className="form-control form-control-sm" value={p.fullName}
                onChange={e => update(idx, 'fullName', e.target.value)}
                placeholder="As per ID" />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Age</label>
              <input type="number" min="1" max="120" className="form-control form-control-sm"
                value={p.age} onChange={e => update(idx, 'age', e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Gender</label>
              <select className="form-select form-select-sm" value={p.gender}
                onChange={e => update(idx, 'gender', e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">ID Type</label>
              <select className="form-select form-select-sm" value={p.idType}
                onChange={e => update(idx, 'idType', e.target.value)}>
                {ID_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-md-8">
              <label className="form-label small fw-semibold">ID Number</label>
              <input className="form-control form-control-sm" value={p.idNumber}
                onChange={e => update(idx, 'idNumber', e.target.value)}
                placeholder="As per selected ID" />
            </div>
            {showSeat && (
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Seat Preference</label>
                <select className="form-select form-select-sm" value={p.seatPreference}
                  onChange={e => update(idx, 'seatPreference', e.target.value)}>
                  {seatOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            {showMeal && (
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Meal Preference</label>
                <select className="form-select form-select-sm" value={p.mealPreference}
                  onChange={e => update(idx, 'mealPreference', e.target.value)}>
                  {MEAL_PREFS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>
      ))}

      <button type="button" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
        onClick={add} disabled={passengers.length >= maxPassengers}>
        <UserPlus size={14} /> Add Passenger
      </button>
      {passengers.length >= maxPassengers && (
        <small className="text-muted ms-2">Maximum {maxPassengers} passengers per booking</small>
      )}
    </div>
  );
}
