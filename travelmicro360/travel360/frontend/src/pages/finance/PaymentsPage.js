import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import FilterTabs from '../../components/shared/FilterTabs';
import DetailDrawer from '../../components/shared/DetailDrawer';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);

  const load = () => { setLoading(true); api.get('/payments?page=0&size=500').then(r => { const data = Array.isArray(r.data.content) ? r.data.content : Array.isArray(r.data) ? r.data : []; setPayments(data.sort((a, b) => (b.paymentId || 0) - (a.paymentId || 0))); }).catch(() => toast.error('Failed')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const filtered = filter === 'ALL' ? payments : payments.filter(p => p.status === filter);

  const columns = [
    { key: 'paymentId', label: 'ID', accessor: 'paymentId' },
    { key: 'bookingId', label: 'Booking', render: r => r.bookingId != null ? `#${r.bookingId}` : '—' },
    { key: 'amount', label: 'Amount', render: r => `₹${(r.amount || 0).toLocaleString()}` },
    { key: 'method', label: 'Method', render: r => r.method || r.paymentMethod || '—' },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  const handleRefund = async (p) => {
    try {
      await api.put(`/payments/${p.paymentId}/refund`);
      toast.success('Payment refunded'); load(); setSelected(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to refund'); }
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">Payments</h4>
      <FilterTabs tabs={[{key:'ALL',label:'All'},{key:'COMPLETED',label:'Completed'},{key:'PENDING',label:'Pending'},{key:'FAILED',label:'Failed'},{key:'REFUNDED',label:'Refunded'}]} active={filter} onChange={setFilter} />
      <div className="t-card p-3">
        <DataTable columns={columns} data={filtered} loading={loading} onRowClick={setSelected} />
      </div>
      <DetailDrawer open={!!selected} onClose={() => setSelected(null)} title={`Payment #${selected?.paymentId}`}>
        {selected && (
          <div>
            <p><strong>Invoice:</strong> #{selected.invoiceId}</p>
            <p><strong>Amount:</strong> ₹{(selected.amount||0).toLocaleString()}</p>
            <p><strong>Method:</strong> {selected.method || selected.paymentMethod || '—'}</p>
            <p><strong>Status:</strong> <StatusBadge status={selected.status} /></p>
            {selected.status === 'COMPLETED' && (
              <button className="btn btn-sm btn-danger mt-3" onClick={() => handleRefund(selected)}>Refund Payment</button>
            )}
            {selected.status === 'REFUNDED' && (
              <p className="text-muted mt-3 mb-0"><strong>Already refunded</strong></p>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}

