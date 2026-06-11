import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import FilterTabs from '../../components/shared/FilterTabs';
import DetailDrawer from '../../components/shared/DetailDrawer';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [paying, setPaying] = useState(null);

  const load = () => { setLoading(true); api.get('/invoices?page=0&size=500').then(r => setInvoices((r.data.content || r.data || []).sort((a, b) => (b.invoiceId || 0) - (a.invoiceId || 0)))).catch(() => toast.error('Failed')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const filtered = filter === 'ALL' ? invoices : invoices.filter(i => i.status === filter);

  const columns = [
    { key: 'invoiceId', label: 'ID', accessor: 'invoiceId' },
    { key: 'bookingId', label: 'Booking', accessor: 'bookingId' },
    { key: 'amount', label: 'Amount', render: r => `₹${(r.amount || 0).toLocaleString()}` },
    { key: 'invoiceDate', label: 'Date', render: r => r.invoiceDate || r.createdAt?.split('T')[0] || '—' },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  const markPaid = async (inv) => {
    console.log('[InvoicesPage] markPaid →', inv.invoiceId);
    setPaying(inv.invoiceId);
    try {
      await api.put(`/invoices/${inv.invoiceId}/mark-paid`);
      toast.success(`Invoice #${inv.invoiceId} marked PAID — payment created`);
      load();
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark paid');
    } finally {
      setPaying(null);
    }
  };

  const rowActions = (inv) => {
    if (inv.status === 'PAID')      return <span className="text-success small fw-semibold">✓ Paid</span>;
    if (inv.status === 'CANCELLED') return <span className="text-muted small">—</span>;
    if (['SENT','DRAFT','OVERDUE'].includes(inv.status)) {
      return (
        <button
          className="btn btn-sm btn-success"
          disabled={paying === inv.invoiceId}
          onClick={() => markPaid(inv)}
        >
          {paying === inv.invoiceId ? 'Paying…' : 'Mark Paid'}
        </button>
      );
    }
    return null;
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">Invoices</h4>
      <FilterTabs tabs={[{key:'ALL',label:'All'},{key:'SENT',label:'Sent'},{key:'PAID',label:'Paid'},{key:'OVERDUE',label:'Overdue'},{key:'DRAFT',label:'Draft'},{key:'CANCELLED',label:'Cancelled'}]} active={filter} onChange={setFilter} />
      <div className="t-card p-3">
        <DataTable columns={columns} data={filtered} loading={loading} onRowClick={setSelected} actions={rowActions} />
      </div>
      <DetailDrawer open={!!selected} onClose={() => setSelected(null)} title={`Invoice #${selected?.invoiceId}`}>
        {selected && (
          <div>
            <p><strong>Booking:</strong> #{selected.bookingId}</p>
            <p><strong>Amount:</strong> ₹{(selected.amount||0).toLocaleString()}</p>
            <p><strong>Status:</strong> <StatusBadge status={selected.status} /></p>
            <p><strong>Date:</strong> {selected.invoiceDate || '—'}</p>
            {['SENT','DRAFT','OVERDUE'].includes(selected.status) && (
              <button className="btn btn-sm btn-success mt-3" onClick={() => markPaid(selected)}>Mark as Paid</button>
            )}
            {selected.status === 'PAID' && (
              <p className="text-success mt-3 mb-0"><strong>✓ Paid</strong> — payment row auto-created, settlement row queued.</p>
            )}
            {selected.status === 'CANCELLED' && (
              <p className="text-muted mt-3 mb-0">Invoice cancelled — cannot be paid.</p>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}

