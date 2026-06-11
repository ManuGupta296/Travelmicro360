import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { StatCard, SkeletonCard } from '../../components/shared/SharedComponents';
import { CreditCard, TrendingUp, Clock, IndianRupee } from 'lucide-react';
import DataTable from '../../components/shared/DataTable';
import ExportCsvButton from '../../components/shared/ExportCsvButton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CommissionsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const agentEmail = JSON.parse(localStorage.getItem('user'))?.email?.trim().toLowerCase();

    api.get('/bookings?size=500').then(res => {
      const all = res.data.content || res.data || [];
      const mine = all.filter(b => b.createdBy && b.createdBy.trim().toLowerCase() === agentEmail);
      setBookings(mine.sort((a, b) => (b.bookingId || 0) - (a.bookingId || 0)));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  // Commission is earned only on CONFIRMED bookings — keep this consistent with the Agent Dashboard.
  const data = bookings
    .filter(b => b.status === 'CONFIRMED')
    .map(b => ({ ...b, commission: Math.round((b.amount || b.totalAmount || 0) * 0.05) }));
  // Aggregate the SAME way the dashboard does: sum amounts first, then take 5% (avoids per-row rounding drift).
  const commissionOf = (list) => Math.round(list.reduce((s, b) => s + Number(b.amount || b.totalAmount || 0), 0) * 0.05);
  const totalEarned = commissionOf(data);

  const now = new Date();
  // Local YYYY-MM key (avoids the UTC shift that pushed months back one and emptied the chart)
  const monthKey = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthKey = monthKey(now);
  const lastMonthKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const thisMonthComm = commissionOf(data.filter(b => (b.createdAt || '').startsWith(thisMonthKey)));
  const lastMonthComm = commissionOf(data.filter(b => (b.createdAt || '').startsWith(lastMonthKey)));

  // Chart data - last 6 months (local month keys so they match bookings' createdAt)
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    const label = d.toLocaleString('default', { month: 'short' });
    const comm = commissionOf(data.filter(b => (b.createdAt || '').startsWith(key)));
    chartData.push({ month: label, commission: comm });
  }

  const columns = [
    { key: 'bookingId', label: 'Booking ID', accessor: 'bookingId' },
    { key: 'customer', label: 'Customer', render: r => r.travelerName || `#${r.customerId}` },
    { key: 'travelDate', label: 'Date', render: r => r.date || r.travelDate || '—' },
    { key: 'totalAmount', label: 'Amount', render: r => `₹${(r.amount || r.totalAmount || 0).toLocaleString()}` },
    { key: 'commission', label: 'Commission (5%)', render: r => `₹${r.commission.toLocaleString()}` },
    { key: 'status', label: 'Status', render: r => <span className={`badge bg-${r.status === 'CONFIRMED' ? 'success' : 'warning'}-subtle text-${r.status === 'CONFIRMED' ? 'success' : 'warning'}`} style={{fontSize:'0.7rem'}}>{r.status}</span> },
  ];

  if (loading) return <SkeletonCard height={300} />;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold mb-0">Commissions</h4>
        <ExportCsvButton data={data.map(d => ({bookingId:d.bookingId, customer:d.travelerName||d.customerId, amount:d.amount || d.totalAmount, commission:d.commission, date:d.date || d.travelDate}))} filename="commissions.csv" />
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3"><StatCard icon={<CreditCard size={20}/>} label="This Month" value={`₹${thisMonthComm.toLocaleString()}`} color="var(--primary-light)"/></div>
        <div className="col-md-3"><StatCard icon={<TrendingUp size={20}/>} label="Last Month" value={`₹${lastMonthComm.toLocaleString()}`} color="var(--teal)"/></div>
        <div className="col-md-3"><StatCard icon={<IndianRupee size={20}/>} label="Total Earned" value={`₹${totalEarned.toLocaleString()}`} color="var(--accent)"/></div>
        <div className="col-md-3"><StatCard icon={<Clock size={20}/>} label="Pending Payout" value={`₹${totalEarned.toLocaleString()}`} color="var(--danger)"/></div>
      </div>

      <div className="t-card p-4 mb-4">
        <h6 className="fw-bold mb-3">Commission Per Month</h6>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" style={{fontSize:'0.75rem'}} />
            <YAxis style={{fontSize:'0.75rem'}} />
            <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
            <Bar dataKey="commission" fill="var(--teal)" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="t-card p-3">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
