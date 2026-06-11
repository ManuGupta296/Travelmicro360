import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import FilterTabs from '../../components/shared/FilterTabs';
import { useLookups } from '../../hooks/useLookups';

export default function ViolationsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [reviewed, setReviewed] = useState(new Set());
  const { getUserName } = useLookups();

  useEffect(() => {
    api.get('/bookings?page=0&size=500').then(r => {
      const all = r.data.content || r.data || [];
      const violations = all.filter(b => (b.amount || b.totalAmount || 0) > 15000 || b.status === 'CANCELLED');
      setBookings(violations.map(b => ({
        ...b,
        reason: (b.amount || b.totalAmount || 0) > 15000 ? 'Above Limit' : 'Cancelled',
      })));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = (() => {
    if (filter === 'ALL') return bookings;
    if (filter === 'ABOVE_LIMIT') return bookings.filter(b => b.reason === 'Above Limit');
    if (filter === 'CANCELLED') return bookings.filter(b => b.reason === 'Cancelled');
    if (filter === 'UNREVIEWED') return bookings.filter(b => !reviewed.has(b.bookingId));
    return bookings;
  })();

  const columns = [
    { key: 'bookingId', label: 'Booking ID', accessor: 'bookingId' },
    { key: 'userId', label: 'Customer', render: r => getUserName(r.customerId || r.userId) },
    { key: 'totalAmount', label: 'Amount', render: r => `₹${(r.amount || r.totalAmount || 0).toLocaleString()}` },
    { key: 'travelDate', label: 'Date', render: r => r.date || r.travelDate || '—' },
    { key: 'reason', label: 'Reason', render: r => <span className={`badge bg-${r.reason === 'Above Limit' ? 'danger' : 'warning'}-subtle text-${r.reason === 'Above Limit' ? 'danger' : 'warning'}`} style={{fontSize:'0.7rem'}}>{r.reason}</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <h4 className="fw-bold mb-4">Policy Violations</h4>
      <FilterTabs tabs={[{key:'ALL',label:'All'},{key:'ABOVE_LIMIT',label:'Above Limit'},{key:'CANCELLED',label:'Cancelled'},{key:'UNREVIEWED',label:'Unreviewed'}]} active={filter} onChange={setFilter} />
      <div className="t-card p-3">
        <DataTable columns={columns} data={filtered} loading={loading}
          actions={row => (
            reviewed.has(row.bookingId)
              ? <span className="badge bg-success-subtle text-success" style={{fontSize:'0.7rem'}}>Reviewed</span>
              : <button className="btn btn-sm btn-outline-success" onClick={() => setReviewed(new Set([...reviewed, row.bookingId]))}>Mark Reviewed</button>
          )} />
      </div>
    </div>
  );
}

