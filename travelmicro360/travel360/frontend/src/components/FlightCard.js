import React from 'react';
import { Plane, ArrowRight } from 'lucide-react';
import { parseDetails } from '../utils/inventoryFilter';

export default function FlightCard({ inventory, onBook }) {
  const d = parseDetails(inventory) || {};

  const price = inventory?.price || 0;
  const seatsLeft = inventory?.availability || 0;
  const name = inventory?.name || '';

  // Parse route from name (e.g., "AI-101 Delhi → Mumbai" or "AI-101 DEL-BOM")
  const nameParts = name.match(/^(\S+)\s+(.+?)\s*[→\->\-]\s*(.+)$/);
  const flightCode = d.flightNumber || nameParts?.[1] || name?.split(' ')[0] || '';
  const fromLabel = d.from || nameParts?.[2]?.trim() || '—';
  const toLabel = d.to || nameParts?.[3]?.trim() || '—';
  const fromCity = d.fromCity || fromLabel;
  const toCity = d.toCity || toLabel;

  return (
    <div className="t-card t-card-lift p-3" style={{ cursor: 'pointer' }} onClick={onBook}>
      <div className="d-flex align-items-center gap-3">
        {/* Airline icon */}
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, #e8f0fe, #d2e8f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Plane size={20} style={{ color: 'var(--primary)' }} />
        </div>

        {/* Flight info */}
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="fw-bold small">{name?.split(' ')[0] || 'Airline'}</span>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>{flightCode}</span>
            {d.class === 'Business' && <span className="badge bg-warning text-dark" style={{ fontSize: '0.6rem' }}>Business</span>}
            {seatsLeft > 0 && seatsLeft <= 10 && <span className="badge-custom badge-danger">{seatsLeft} seats left</span>}
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-center">
              <div className="fw-bold" style={{ fontSize: '1.15rem' }}>{d.departure || '—'}</div>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>{fromLabel}</div>
              <div className="text-muted" style={{ fontSize: '0.65rem' }}>{fromCity !== fromLabel ? fromCity : ''}</div>
            </div>
            <div className="flex-grow-1 text-center px-2">
              <div className="text-muted" style={{ fontSize: '0.65rem' }}>{d.duration || ''}</div>
              <div className="position-relative" style={{ height: 2, background: '#e0e0e0', borderRadius: 1, margin: '4px 0' }}>
                <div style={{ position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)' }}>
                  <Plane size={10} style={{ color: 'var(--primary)', transform: 'rotate(90deg)' }} />
                </div>
              </div>
              <div className="text-muted" style={{ fontSize: '0.65rem' }}>{d.stops === 0 ? 'Non-stop' : d.stops ? `${d.stops} stop` : ''}</div>
            </div>
            <div className="text-center">
              <div className="fw-bold" style={{ fontSize: '1.15rem' }}>{d.arrival || '—'}</div>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>{toLabel}</div>
              <div className="text-muted" style={{ fontSize: '0.65rem' }}>{toCity !== toLabel ? toCity : ''}</div>
            </div>
          </div>
          <div className="text-muted mt-1" style={{ fontSize: '0.65rem' }}>
            {[d.class, d.baggage ? `${d.baggage} baggage` : null].filter(Boolean).join(' • ')}
          </div>
        </div>

        {/* Price */}
        <div className="text-end" style={{ minWidth: 110 }}>
          <div className="price-tag">₹{price.toLocaleString()}</div>
          <small className="text-muted">per person</small>
          <div className="mt-2">
            <button className="btn btn-accent btn-sm w-100" onClick={(e) => { e.stopPropagation(); onBook(); }}>
              Book Now <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
