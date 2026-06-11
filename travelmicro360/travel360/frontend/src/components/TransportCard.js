import React from 'react';
import { Car, ArrowRight, Clock, MapPin, Users } from 'lucide-react';
import { parseDetails } from '../utils/inventoryFilter';

export default function TransportCard({ inventory, onBook }) {
  const d = parseDetails(inventory) || {};

  const price = inventory?.price || 0;
  const name = inventory?.name || 'Transport';

  const hasRoute = !!(d.from || d.to);

  return (
    <div className="t-card t-card-lift p-3" style={{ cursor: 'pointer' }} onClick={onBook}>
      <div className="d-flex align-items-center gap-3">
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #e8f9e8, #d2f5d2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Car size={22} style={{ color: '#2e7d32' }} />
        </div>

        <div className="flex-grow-1">
          <div className="fw-bold small mb-1">{name}</div>
          {hasRoute && (
            <div className="d-flex align-items-center gap-1 text-muted small">
              <MapPin size={11} /> {[d.from, d.to].filter(Boolean).join(' → ')}
            </div>
          )}
          <div className="d-flex gap-3 mt-1 text-muted" style={{ fontSize: '0.7rem' }}>
            {d.departure && <span><Clock size={10} /> {d.departure}{d.arrival ? ` – ${d.arrival}` : ''}</span>}
            {d.duration && <span>{d.duration}</span>}
            {d.vehicle && <span>{d.vehicle}</span>}
            {d.capacity != null && <span><Users size={10} /> {d.capacity} seats</span>}
          </div>
        </div>

        <div className="text-end" style={{ minWidth: 100 }}>
          <div className="price-tag">₹{price.toLocaleString()}</div>
          <small className="text-muted">{d.vehicle || d.class || ''}</small>
          <div className="mt-2">
            <button className="btn btn-accent btn-sm w-100" onClick={(e) => { e.stopPropagation(); onBook(); }}>
              Book <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
