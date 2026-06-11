import React from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { parseDetails } from '../utils/inventoryFilter';

export default function HotelCard({ inventory, onBook }) {
  const d = parseDetails(inventory) || {};

  const price = inventory?.price || 0;
  const name = inventory?.name || 'Hotel';
  // Try to extract city from name (e.g., "Grand Hotel Mumbai" → "Mumbai")
  const cityFallback = name?.split(' ').pop() || '';
  const city = d.city || cityFallback;
  const area = d.area || '';
  const starRating = d.starRating || 0;
  // Normalize amenities — seed data stores it as a comma-separated string ("WiFi,Pool,Gym"),
  // but some rows might already be arrays. Defensive: handle both shapes.
  const amenities = Array.isArray(d.amenities)
    ? d.amenities
    : (typeof d.amenities === 'string' && d.amenities.trim() !== ''
        ? d.amenities.split(',').map(s => s.trim()).filter(Boolean)
        : []);
  const roomType = d.roomType || '';
  const cancellable = d.cancellable;

  return (
    <div className="t-card t-card-lift p-0 overflow-hidden" style={{ cursor: 'pointer' }} onClick={onBook}>
      <div className="row g-0">
        <div className="col-md-9 p-3">
          <h6 className="fw-bold mb-1" style={{ fontSize: '0.95rem' }}>{name}</h6>
          <div className="text-muted small mb-1">{area}{city ? `${area ? ', ' : ''}${city}` : ''}</div>
          {starRating > 0 && (
            <div className="d-flex align-items-center gap-1 mb-2">
              {Array.from({ length: starRating }).map((_, i) => (
                <Star key={i} size={12} fill="#ff9800" stroke="#ff9800" />
              ))}
            </div>
          )}
          {!starRating && inventory?.partnerName && (
            <div className="text-muted small mb-2">Featured Partner: {inventory.partnerName}</div>
          )}
          {amenities.length > 0 && (
            <div className="d-flex flex-wrap gap-1 mb-2">
              {amenities.slice(0, 5).map(a => (
                <span key={a} className="badge bg-light text-dark border" style={{ fontSize: '0.65rem' }}>
                  {a}
                </span>
              ))}
            </div>
          )}
          {cancellable === true && <span className="text-success small fw-semibold">Free cancellation</span>}
          {cancellable === false && <span className="text-danger small fw-semibold">Non-refundable</span>}
        </div>
        <div className="col-md-3 p-3 d-flex flex-column align-items-end justify-content-between border-start">
          <div className="text-end">
            <div className="price-tag">₹{price.toLocaleString()}</div>
            <small className="text-muted">per night</small>
          </div>
          <div className="text-muted small">{roomType}</div>
          <button className="btn btn-accent btn-sm w-100 mt-2" onClick={(e) => { e.stopPropagation(); onBook(); }}>
            Book Now <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
