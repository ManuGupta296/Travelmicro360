import React, { useEffect, useState } from 'react';
import { Plus, Send, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';

const STORAGE_KEY = 't360_agent_quotes';

function loadQuotes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function saveQuotes(q) { localStorage.setItem(STORAGE_KEY, JSON.stringify(q)); }

export default function QuotesPage() {
  const [quotes, setQuotes] = useState(loadQuotes);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ customer: '', destination: '', price: '', notes: '' });

  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const isFormValid = form.customer.trim().length >= 2 && form.destination.trim().length >= 2 && Number(form.price) > 0 && Number(form.price) <= 1000000;

  const handleCreate = () => {
    if (!isFormValid) { toast.error('Please fill all fields correctly'); return; }
    const newQuote = {
      id: Date.now(),
      customer: form.customer,
      destination: form.destination,
      price: Number(form.price) || 0,
      notes: form.notes,
      status: 'Draft',
      createdDate: new Date().toISOString().split('T')[0],
    };
    const updated = [newQuote, ...quotes];
    setQuotes(updated);
    saveQuotes(updated);
    setShowModal(false);
    setForm({ customer: '', destination: '', price: '', notes: '' });
    toast.success('Quote created');
  };

  const sendQuote = (id) => {
    const updated = quotes.map(q => q.id === id ? { ...q, status: 'Sent' } : q);
    setQuotes(updated); saveQuotes(updated);
    toast.success('Quote sent to customer (mock)');
  };

  const deleteQuote = (id) => {
    const updated = quotes.filter(q => q.id !== id);
    setQuotes(updated); saveQuotes(updated);
    toast.success('Quote deleted');
  };

  const clearAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setQuotes([]);
    setShowConfirmClear(false);
    toast.success('All quotes cleared');
  };

  const columns = [
    { key: 'customer', label: 'Customer', accessor: 'customer' },
    { key: 'destination', label: 'Destination', accessor: 'destination' },
    { key: 'price', label: 'Price', render: r => `₹${r.price.toLocaleString()}` },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status.toUpperCase()} /> },
    { key: 'createdDate', label: 'Created', accessor: 'createdDate' },
  ];

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold mb-0">Quotes</h4>
        <div className="d-flex gap-2">
          {quotes.length > 0 && <button className="btn btn-outline-danger btn-sm" onClick={() => setShowConfirmClear(true)}>🗑 Clear All</button>}
          <button className="btn btn-accent btn-sm d-flex align-items-center gap-1" onClick={() => setShowModal(true)}><Plus size={14}/> Create Quote</button>
        </div>
      </div>

      <div className="t-card p-3">
        <DataTable columns={columns} data={quotes}
          actions={row => (
            <div className="d-flex gap-1">
              {row.status === 'Draft' && <button className="btn btn-sm btn-outline-primary" onClick={() => sendQuote(row.id)}><Send size={12}/></button>}
              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteQuote(row.id)}><Trash2 size={12}/></button>
            </div>
          )} />
      </div>

      {showModal && (
        <>
          <div className="modal-backdrop show" style={{zIndex:1050}} onClick={() => setShowModal(false)}/>
          <div className="modal show d-block" style={{zIndex:1055}}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
              <div className="modal-content border-0 shadow">
                <div className="modal-header"><h6 className="modal-title fw-bold">Create Quote</h6><button className="btn-close" onClick={() => setShowModal(false)}/></div>
                <div className="modal-body">
                  <div className="mb-2"><label className="form-label small">Customer Name <span className="text-danger">*</span></label><input className="form-control form-control-sm" value={form.customer} onChange={e => setForm({...form, customer: e.target.value})}/>{form.customer && form.customer.trim().length < 2 && <small className="text-danger">Min 2 characters</small>}</div>
                  <div className="mb-2"><label className="form-label small">Destination <span className="text-danger">*</span></label><input className="form-control form-control-sm" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})}/>{form.destination && form.destination.trim().length < 2 && <small className="text-danger">Min 2 characters</small>}</div>
                  <div className="mb-2"><label className="form-label small">Estimated Price (₹) <span className="text-danger">*</span></label><input type="number" className="form-control form-control-sm" value={form.price} onChange={e => setForm({...form, price: e.target.value})} min="1" max="1000000"/>{form.price && (Number(form.price) <= 0 || Number(form.price) > 1000000) && <small className="text-danger">Must be ₹1 – ₹10,00,000</small>}</div>
                  <div className="mb-2"><label className="form-label small">Notes</label><textarea className="form-control form-control-sm" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}/></div>
                </div>
                <div className="modal-footer"><button className="btn btn-light btn-sm" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={handleCreate} disabled={!isFormValid}>Create</button></div>
              </div>
            </div>
          </div>
        </>
      )}

      {showConfirmClear && (
        <>
          <div className="modal-backdrop show" style={{zIndex:1060}} onClick={() => setShowConfirmClear(false)}/>
          <div className="modal show d-block" style={{zIndex:1065}}>
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <div className="modal-content border-0 shadow">
                <div className="modal-header"><h6 className="modal-title fw-bold">Delete all quotes?</h6></div>
                <div className="modal-body"><p className="small text-muted mb-0">This will permanently remove all {quotes.length} quotes from your local storage.</p></div>
                <div className="modal-footer"><button className="btn btn-light btn-sm" onClick={() => setShowConfirmClear(false)}>Cancel</button><button className="btn btn-danger btn-sm" onClick={clearAll}>Delete All</button></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

