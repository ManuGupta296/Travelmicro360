import React, { useEffect, useState, useMemo } from 'react';
import { ClipboardCheck, CheckCircle, IndianRupee, AlertOctagon, Briefcase, Inbox, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SkeletonCard } from '../../components/shared/SharedComponents';
import { useLookups } from '../../hooks/useLookups';
import api from '../../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';

const BUDGET_CEILING = 50000;
const TYPE_COLORS = { FLIGHT: '#3b82f6', HOTEL: '#8b5cf6', TRAIN: '#0ea5e9', BUS: '#f59e0b', TRANSPORT: '#10b981' };
const inr = (v) => `₹${Math.round(v || 0).toLocaleString()}`;

export default function CorpDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [me, setMe] = useState({ email: '', companyName: '' });
  const [loading, setLoading] = useState(true);
  const { getUserName } = useLookups();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    setMe({ email: (u.email || '').trim().toLowerCase(), companyName: u.companyName || '' });
    api.get('/bookings?page=0&size=500')
      .then(r => {
        const all = Array.isArray(r.data?.content) ? r.data.content : Array.isArray(r.data) ? r.data : [];
        const company = u.companyName;
        setBookings(all.filter(b => b.purpose === 'BUSINESS' && (!company || b.bookingCompany === company)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const thisMonth = new Date().toISOString().substring(0, 7);

  const pending = useMemo(() => bookings.filter(b => b.status === 'PENDING' && (
    (b.approverManagerEmail && b.approverManagerEmail.trim().toLowerCase() === me.email) ||
    (!b.approverManagerEmail && me.companyName)
  )), [bookings, me]);

  const approvedMonth = useMemo(() => bookings.filter(b => b.status === 'CONFIRMED' && (b.createdAt || '').startsWith(thisMonth)).length, [bookings, thisMonth]);
  const rejectedMonth = useMemo(() => bookings.filter(b => b.status === 'CANCELLED' && (b.createdAt || '').startsWith(thisMonth)).length, [bookings, thisMonth]);
  const totalSpend = useMemo(() => bookings.filter(b => b.status === 'CONFIRMED' && (b.createdAt || '').startsWith(thisMonth)).reduce((s, b) => s + Number(b.amount || 0), 0), [bookings, thisMonth]);
  const budgetPct = Math.min(100, Math.round((totalSpend / BUDGET_CEILING) * 100));

  const spendByCategory = useMemo(() => {
    const map = {};
    bookings.filter(b => b.status === 'CONFIRMED').forEach(b => {
      map[b.itemType] = (map[b.itemType] || 0) + Number(b.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  const approvedVsRejected = [
    { name: 'Approved', count: approvedMonth, fill: '#16a34a' },
    { name: 'Rejected', count: rejectedMonth, fill: '#dc2626' },
  ];

  const handleApprove = async (b) => {
    try {
      await api.put(`/bookings/${b.bookingId}/approve`);
      setBookings(prev => prev.map(x => x.bookingId === b.bookingId ? { ...x, status: 'CONFIRMED' } : x));
    } catch {}
  };
  const handleReject = async (b) => {
    try {
      await api.put(`/bookings/${b.bookingId}/reject`);
      setBookings(prev => prev.map(x => x.bookingId === b.bookingId ? { ...x, status: 'CANCELLED' } : x));
    } catch {}
  };

  if (loading) return <div className="row g-3">{[1,2,3,4].map(i => <div className="col-md-3" key={i}><SkeletonCard height={100}/></div>)}</div>;

  const budgetColor = budgetPct > 90 ? '#dc2626' : budgetPct > 70 ? '#d97706' : '#16a34a';

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-0">Corporate Dashboard</h4>
        {me.companyName && <div className="text-muted small mt-1">{me.companyName}</div>}
      </div>

      {/* Hero — pending approvals as an attention card */}
      <div className="t-card p-4 mt-3 mb-4 position-relative" style={{ background: pending.length > 0 ? 'linear-gradient(135deg, #b91c1c, #ef4444)' : 'linear-gradient(135deg, #047857, #10b981)', color: 'white', borderRadius: 'var(--radius-lg)' }}>
        <ClipboardCheck size={22} style={{ position: 'absolute', top: 16, right: 16, opacity: 0.5 }} />
        <div style={{ opacity: 0.85, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Approvals</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: 4 }}>
          {pending.length}
        </div>
      </div>

      {/* Spending snapshot */}
      <h6 className="fw-bold text-muted mt-4 mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Spending Snapshot · {thisMonth}</h6>
      <div className="row g-3 mb-4">
        <div className="col-lg-4">
          <div className="t-card p-4 h-100 position-relative">
            <IndianRupee size={20} style={{ position: 'absolute', top: 16, right: 16, color: budgetColor }} />
            <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Budget Used</div>
            <div className="fw-bold mb-2" style={{ fontSize: '1.75rem', color: budgetColor }}>{budgetPct}%</div>
            <div className="progress" style={{ height: 10, background: 'var(--primary-lighter)' }}>
              <div className="progress-bar" role="progressbar" style={{ width: `${budgetPct}%`, background: budgetColor }} />
            </div>
            <div className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>{inr(totalSpend)} of {inr(BUDGET_CEILING)}</div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="t-card p-4 h-100 position-relative">
            <CheckCircle size={20} style={{ position: 'absolute', top: 16, right: 16, color: '#16a34a' }} />
            <div className="text-muted mb-2" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>This Month</div>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={approvedVsRejected} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" style={{ fontSize: '0.75rem' }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0,4,4,0]}>
                  {approvedVsRejected.map((e,i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="t-card p-4 h-100 position-relative">
            <Briefcase size={20} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--primary-light)' }} />
            <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Spend</div>
            <div className="fw-bold mb-1" style={{ fontSize: '1.75rem' }}>{inr(totalSpend)}</div>
            <div className="small text-muted">{approvedMonth} confirmed trip{approvedMonth === 1 ? '' : 's'} this month</div>
          </div>
        </div>
      </div>

      {/* Approval queue */}
      <h6 className="fw-bold text-muted mt-4 mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Approval Queue</h6>
      <div className="t-card p-4 mb-4 position-relative">
        <ClipboardCheck size={20} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--primary-light)' }} />
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="fw-semibold">Requires Action</div>
          <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/corp/approvals')}>View all →</button>
        </div>
        {pending.length === 0 ? (
          <FriendlyEmpty icon={<ThumbsUp size={28} className="text-success" />} title="Queue is empty" hint="No business bookings need your approval right now." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-sm align-middle mb-0" style={{ fontSize: '0.82rem' }}>
              <thead><tr className="text-muted"><th>ID</th><th>Employee</th><th>Type</th><th>Travel Date</th><th>Amount</th><th>Action</th></tr></thead>
              <tbody>
                {pending.slice(0, 6).map(b => (
                  <tr key={b.bookingId}>
                    <td className="fw-semibold">#{b.bookingId}</td>
                    <td>{getUserName(b.customerId)}</td>
                    <td><span className="badge" style={{ background: (TYPE_COLORS[b.itemType] || '#94a3b8') + '22', color: TYPE_COLORS[b.itemType] || '#475569', fontSize: '0.7rem' }}>{b.itemType}</span></td>
                    <td className="small">{b.date || '—'}</td>
                    <td className="fw-semibold">{inr(b.amount)}</td>
                    <td>
                      <button className="btn btn-sm btn-success me-1" style={{ fontSize: '0.7rem', padding: '2px 8px' }} onClick={() => handleApprove(b)}>Approve</button>
                      <button className="btn btn-sm btn-outline-danger" style={{ fontSize: '0.7rem', padding: '2px 8px' }} onClick={() => handleReject(b)}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Spend mix */}
      <h6 className="fw-bold text-muted mt-4 mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Spend Mix</h6>
      <div className="t-card p-4 mb-4 position-relative">
        <AlertOctagon size={20} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--primary-light)' }} />
        <div className="fw-semibold mb-3">Confirmed Spend by Category</div>
        {spendByCategory.length === 0 ? (
          <FriendlyEmpty icon={<Inbox size={28} className="text-muted" />} title="No confirmed bookings yet" hint="Category breakdown will appear after the first approval lands." />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={spendByCategory} dataKey="value" nameKey="name" outerRadius={80} label={({ value }) => inr(value)}>
                {spendByCategory.map(e => <Cell key={e.name} fill={TYPE_COLORS[e.name] || '#94a3b8'} />)}
              </Pie>
              <Tooltip formatter={(v) => inr(v)} />
              <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function FriendlyEmpty({ icon, title, hint }) {
  return (
    <div className="text-center py-4">
      <div className="mb-2">{icon}</div>
      <div className="fw-semibold small">{title}</div>
      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{hint}</div>
    </div>
  );
}
