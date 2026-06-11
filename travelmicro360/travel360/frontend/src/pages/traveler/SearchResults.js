import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Filter, Users, Plane, Building2, Car, TrainFront, Bus } from 'lucide-react';
import api from '../../services/api';
import { SkeletonCard, EmptyState } from '../../components/shared/SharedComponents';
import FlightCard from '../../components/FlightCard';
import HotelCard from '../../components/HotelCard';
import TransportCard from '../../components/TransportCard';
import { matchInventory } from '../../utils/inventoryFilter';

const TYPE_MAP = {
  flights: 'FLIGHT',
  hotels: 'HOTEL',
  transport: 'TRANSPORT', // legacy URL param — keep working
  cabs: 'TRANSPORT',      // new tab label, same underlying type
  trains: 'TRAIN',
  buses: 'BUS',
};
const TYPE_LABELS = { FLIGHT:'Flights', HOTEL:'Hotels', TRANSPORT:'Cabs', TRAIN:'Trains', BUS:'Buses' };
const TYPE_ICONS = { FLIGHT: Plane, HOTEL: Building2, TRANSPORT: Car, TRAIN: TrainFront, BUS: Bus };

export default function SearchResults() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [allInventories, setAllInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxPrice, setMaxPrice] = useState(50000);

  const from = params.get('from') || '';
  const to = params.get('to') || '';
  const date = params.get('date') || '';
  const travelers = params.get('travelers') || '1';
  const type = params.get('type') || 'flights';
  const itemType = TYPE_MAP[type] || 'FLIGHT';

  useEffect(() => {
    setLoading(true);
    api.get('/inventories', { params: { page: 0, size: 200 } })
      .then(res => {
        const all = res.data.content || res.data || [];
        console.log('[SearchResults] Fetched:', all.length, 'inventories');
        setAllInventories(all);
      })
      .catch(() => setAllInventories([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const result = allInventories.filter(inv =>
      matchInventory(inv, { type: itemType, from: from || undefined, to: to || undefined, maxPrice })
    );
    console.log(`[SearchResults] Type=${itemType} From="${from}" To="${to}" MaxPrice=${maxPrice} → ${result.length}/${allInventories.length}`);
    if (result.length === 0 && allInventories.length > 0) {
      const sameType = allInventories.filter(i => i.itemType === itemType);
      if (sameType.length > 0) console.log('[SearchResults] Sample unmatched:', sameType[0]);
    }
    return result;
  }, [allInventories, itemType, from, to, maxPrice]);

  const results = useMemo(() => {
    return [...filtered].sort((a, b) => (a.price || 0) - (b.price || 0));
  }, [filtered]);

  const handleBook = (inv) => {
    // Forward the search date so the booking carries the actual travel date the user picked.
    const q = date ? `?date=${encodeURIComponent(date)}` : '';
    if (inv.itemType === 'FLIGHT') navigate(`/book/flight/${inv.inventoryId}${q}`);
    else if (inv.itemType === 'HOTEL') navigate(`/book/hotel/${inv.inventoryId}${q}`);
    else navigate(`/book/bus/${inv.inventoryId}${q}`);
  };

  const typeLabel = TYPE_LABELS[itemType] || 'Results';
  const TypeIcon = TYPE_ICONS[itemType] || Car;

  return (
    <div>
      {/* Search Summary */}
      <div className="t-card p-3 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <TypeIcon size={18} className="text-primary" />
          {(from || to) ? (
            <>
              <span className="fw-bold">{from || 'Anywhere'}</span>
              {to && <><ArrowRight size={14} className="text-muted" /><span className="fw-bold">{to}</span></>}
            </>
          ) : (
            <span className="fw-bold">All {typeLabel}</span>
          )}
          {date && <span className="badge-custom badge-info ms-2">{date}</span>}
          <span className="text-muted small ms-2"><Users size={12} /> {travelers} {travelers === '1' ? 'passenger' : 'passengers'}</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">{results.length} {typeLabel.toLowerCase()} found</span>
          <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/traveler/home')}>Edit Search</button>
        </div>
      </div>

      <div className="row">
        {/* Filters */}
        <div className="col-lg-3 mb-4">
          <div className="t-card p-3">
            <h6 className="small fw-bold mb-3 d-flex align-items-center gap-1"><Filter size={14}/> Filters</h6>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Max Price: ₹{maxPrice.toLocaleString()}</label>
              <input type="range" className="form-range" min="500" max="50000" step="500"
                value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} />
            </div>
            {maxPrice < 50000 && (
              <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => setMaxPrice(50000)}>Clear Filters</button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="col-lg-9">
          {loading ? (
            <div className="d-flex flex-column gap-3">
              {[1,2,3,4,5].map(i => <SkeletonCard key={i} height={120} />)}
            </div>
          ) : results.length === 0 ? (
            <EmptyState icon="" title={`No ${typeLabel.toLowerCase()} found`}
              description="Try adjusting your search or filters."
              action="Clear Filters" onAction={() => setMaxPrice(50000)} />
          ) : (
            <div className="d-flex flex-column gap-3">
              {results.map(inv => {
                if (itemType === 'FLIGHT') return <FlightCard key={inv.inventoryId} inventory={inv} onBook={() => handleBook(inv)} />;
                if (itemType === 'HOTEL') return <HotelCard key={inv.inventoryId} inventory={inv} onBook={() => handleBook(inv)} />;
                return <TransportCard key={inv.inventoryId} inventory={inv} onBook={() => handleBook(inv)} />;
              })}
            </div>
          )}
        </div>
      </div>

      {/* Debug panel (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <pre style={{fontSize:'11px',background:'#f0f0f0',padding:'8px',marginTop:'1rem',borderRadius:4}}>
          Type: {itemType} | From: {from} | To: {to} | Fetched: {allInventories.length} | Filtered: {filtered.length}
        </pre>
      )}
    </div>
  );
}
