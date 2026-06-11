import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/SharedComponents';
import { useLookups } from '../../hooks/useLookups';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ApprovalsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState('');
  const { getUserName } = useLookups();

  const load = () => {
    setLoading(true);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const company = currentUser?.companyName;
    const myEmail = currentUser?.email?.trim().toLowerCase();
    api.get('/bookings?page=0&size=500').then(r => {
      const all = Array.isArray(r.data.content) ? r.data.content : Array.isArray(r.data) ? r.data : [];
      setBookings(all.filter(b => b.status === 'PENDING' && b.purpose === 'BUSINESS' && (
        (b.approverManagerEmail && b.approverManagerEmail.trim().toLowerCase() === myEmail) ||
        (!b.approverManagerEmail && company && b.bookingCompany === company)
      )).sort((a, b) => (b.bookingId || 0) - (a.bookingId || 0)));
    }).catch(() => setBookings([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleApprove = async (b) => {
    try {
      await api.put(`/bookings/${b.bookingId}/approve`);
      toast.success('Booking approved ✓');
      setBookings(prev => prev.filter(x => x.bookingId !== b.bookingId));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to approve'); }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      await api.put(`/bookings/${rejectTarget.bookingId}/reject`, { reason });
      toast.success('Booking rejected');
      setBookings(prev => prev.filter(x => x.bookingId !== rejectTarget.bookingId));
      setRejectTarget(null);
      setReason('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to reject'); }
  };

  const columns = [
    { key: 'bookingId', label: 'ID', accessor: 'bookingId' },
    { key: 'customerId', label: 'Employee', render: r => getUserName(r.customerId) },
    { key: 'itemType', label: 'Type', accessor: 'itemType' },
    { key: 'date', label: 'Travel Date', accessor: 'date' },
    { key: 'amount', label: 'Amount', render: r => `₹${(r.amount || 0).toLocaleString()}` },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <h4 className="fw-bold mb-2">Business Travel Approvals</h4>
      {(() => { const me = JSON.parse(localStorage.getItem('user')); return me?.companyName ? <p className="text-muted small mb-4">Showing approval requests for <strong>{me.companyName}</strong></p> : null; })()}
      {!loading && bookings.length === 0 ? (
        <EmptyState icon="🎉" title="All caught up!" description={`No pending business approvals${(() => { const me = JSON.parse(localStorage.getItem('user')); return me?.companyName ? ` for ${me.companyName}` : ''; })()}`} />
      ) : (
        <div className="t-card p-3">
          <DataTable columns={columns} data={bookings} loading={loading}
            actions={row => (
              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-success d-flex align-items-center gap-1" onClick={() => handleApprove(row)}><CheckCircle size={14} /> Approve</button>
                <button className="btn btn-sm btn-danger d-flex align-items-center gap-1" onClick={() => setRejectTarget(row)}><XCircle size={14} /> Reject</button>
              </div>
            )} />
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <>
          <div className="modal-backdrop show" style={{zIndex:1050}} onClick={() => setRejectTarget(null)}/>
          <div className="modal show d-block" style={{zIndex:1055}}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
              <div className="modal-content border-0 shadow">
                <div className="modal-header">
                  <h6 className="modal-title fw-bold">Reject Booking #{rejectTarget.bookingId}</h6>
                  <button className="btn-close" onClick={() => setRejectTarget(null)}/>
                </div>
                <div className="modal-body">
                  <label className="form-label small fw-semibold">Reason for rejection</label>
                  <textarea className="form-control" rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Exceeds budget limit, not aligned with policy..." />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-light btn-sm" onClick={() => setRejectTarget(null)}>Cancel</button>
                  <button className="btn btn-danger btn-sm" onClick={handleReject}>Reject Booking</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
