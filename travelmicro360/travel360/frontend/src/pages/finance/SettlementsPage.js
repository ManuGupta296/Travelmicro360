import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import FilterTabs from '../../components/shared/FilterTabs';
import { CheckCircle } from 'lucide-react';
import { useLookups } from '../../hooks/useLookups';

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const { getPartnerName } = useLookups();

  const load = () => {
    setLoading(true);
    api.get('/settlements?page=0&size=500').then(r => {
      setSettlements((Array.isArray(r.data) ? r.data : r.data.content || []).sort((a, b) => (b.settlementId || 0) - (a.settlementId || 0)));
    }).catch(() => toast.error('Failed to load settlements')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const processSettlement = async (s) => {
    try {
      await api.put(`/settlements/${s.settlementId}/complete`);
      toast.success('Settlement processed — partner payout completed');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const filtered = filter === 'ALL' ? settlements : settlements.filter(s => s.status === filter);

  const totalPending = settlements.filter(s => s.status === 'PENDING').reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalCompleted = settlements.filter(s => s.status === 'PROCESSED').reduce((sum, s) => sum + (s.amount || 0), 0);

  const columns = [
    { key: 'settlementId', label: 'ID', accessor: 'settlementId' },
    { key: 'partnerName', label: 'Partner', render: r => getPartnerName(r.partnerId) },
    { key: 'amount', label: 'Amount', render: r => `₹${(r.amount || 0).toLocaleString()}` },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'createdAt', label: 'Date', render: r => (r.createdAt || '').split('T')[0] || '—' },
  ];

  return (
    <div>
      <h4 className="fw-bold mb-1">Partner Settlements</h4>
      <p className="text-muted small mb-4">Active figures exclude reversed/refunded settlements — see the Failed filter.</p>
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="t-card p-3 text-center">
            <div className="text-muted small">Pending Payouts</div>
            <div className="fw-bold" style={{fontSize:'1.5rem', color:'var(--accent)'}}>₹{totalPending.toLocaleString()}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="t-card p-3 text-center">
            <div className="text-muted small">Completed</div>
            <div className="fw-bold" style={{fontSize:'1.5rem', color:'var(--teal)'}}>₹{totalCompleted.toLocaleString()}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="t-card p-3 text-center">
            <div className="text-muted small">Platform Revenue (10%)</div>
            <div className="fw-bold" style={{fontSize:'1.5rem', color:'var(--primary-light)'}}>₹{Math.round(totalCompleted / 9).toLocaleString()}</div>
          </div>
        </div>
      </div>
      <FilterTabs tabs={[{key:'ALL',label:'All'},{key:'PENDING',label:'Pending'},{key:'PROCESSED',label:'Completed'},{key:'FAILED',label:'Failed'}]} active={filter} onChange={setFilter} />
      <div className="t-card p-3">
        <DataTable columns={columns} data={filtered} loading={loading} pageSize={50}
          actions={row => row.status === 'PENDING' ? (
            <button className="btn btn-sm btn-success d-inline-flex align-items-center gap-1" onClick={() => processSettlement(row)}><CheckCircle size={14}/> Process</button>
          ) : null} />
      </div>
    </div>
  );
}

