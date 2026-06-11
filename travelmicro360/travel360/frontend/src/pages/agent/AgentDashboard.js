import React, { useEffect, useState, useMemo } from 'react';
import { Users, BookOpen, CreditCard, TrendingUp, Trophy, Inbox, ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SkeletonCard } from '../../components/shared/SharedComponents';
import { useLookups } from '../../hooks/useLookups';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = { CONFIRMED: '#16a34a', PENDING: '#d97706', CANCELLED: '#dc2626' };
const inr = (v) => `₹${Math.round(v || 0).toLocaleString()}`;

export default function AgentDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getUserName } = useLookups();

  useEffect(() => {
    const agentEmail = JSON.parse(localStorage.getItem('user') || '{}')?.email?.trim().toLowerCase();
    api.get('/bookings?size=500')
      .then(res => {
        const all = res.data?.content || res.data || [];
        setBookings(all.filter(b => b.createdBy && b.createdBy.trim().toLowerCase() === agentEmail));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const now = new Date();
  const today = now.toISOString().substring(0, 10);
  const thisMonth = now.toISOString().substring(0, 7);

  const stats = useMemo(() => {
    const todaysBookings = bookings.filter(b => (b.createdAt || '').substring(0, 10) === today).length;
    const monthBookings = bookings.filter(b => (b.createdAt || '').startsWith(thisMonth)).length;
    const activeCustomers = new Set(bookings.map(b => b.customerId)).size;
    const commission = bookings.filter(b => b.status === 'CONFIRMED').reduce((s, b) => s + Number(b.amount || 0), 0) * 0.05;
    const monthCommission = bookings.filter(b => b.status === 'CONFIRMED' && (b.createdAt || '').startsWith(thisMonth)).reduce((s, b) => s + Number(b.amount || 0), 0) * 0.05;
    return { todaysBookings, monthBookings, activeCustomers, commission, monthCommission };
  }, [bookings, today, thisMonth]);

  const monthlyChart = useMemo(() => {
    const arr = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().substring(0, 7);
      const label = d.toLocaleString('default', { month: 'short' });
      arr.push({ month: label, bookings: bookings.filter(b => (b.createdAt || '').startsWith(key)).length });
    }
    return arr;
  }, [bookings, now]);

  const topCustomers = useMemo(() => {
    const map = {};
    bookings.forEach(b => {
      const id = b.customerId;
      if (!id) return;
      if (!map[id]) map[id] = { customerId: id, count: 0, total: 0 };
      map[id].count += 1;
      map[id].total += Number(b.amount || 0);
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [bookings]);

  const funnel = useMemo(() => ({
    created: bookings.length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  }), [bookings]);

  if (loading) return <div className="row g-3">{[1,2,3,4].map(i => <div className="col-md-3" key={i}><SkeletonCard height={100}/></div>)}</div>;

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-0">Agent Dashboard</h4>
      </div>

      {/* Hero: commission + active customers */}
      <div className="row g-3 mt-3 mb-4">
        <div className="col-lg-8">
          <div className="t-card p-4 h-100 position-relative" style={{ background: 'linear-gradient(135deg, #0e7490, #06b6d4)', color: 'white', borderRadius: 'var(--radius-lg)' }}>
            <Trophy size={22} style={{ position: 'absolute', top: 16, right: 16, opacity: 0.5 }} />
            <div style={{ opacity: 0.85, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Commission Earned</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: 4 }}>{inr(stats.commission)}</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{inr(stats.monthCommission)} this month</div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="t-card p-4 h-100 position-relative" style={{ borderLeft: '4px solid #06b6d4' }}>
            <Users size={22} style={{ position: 'absolute', top: 16, right: 16, color: '#06b6d4' }} />
            <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Customers</div>
            <div className="fw-bold" style={{ fontSize: '1.75rem' }}>{stats.activeCustomers}</div>
            <div className="row g-2 mt-2">
              <div className="col-6">
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Today</div>
                <div className="fw-semibold">{stats.todaysBookings}</div>
              </div>
              <div className="col-6">
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>This month</div>
                <div className="fw-semibold">{stats.monthBookings}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking trend + top customers */}
      <h6 className="fw-bold text-muted mt-4 mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Booking Trend</h6>
      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="t-card p-4 position-relative">
            <TrendingUp size={20} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--primary-light)' }} />
            <div className="fw-semibold mb-3">Bookings Per Month · Last 6 months</div>
            {monthlyChart.every(m => m.bookings === 0) ? (
              <FriendlyEmpty icon={<Inbox size={28} className="text-muted" />} title="No bookings in the last 6 months" hint="Your monthly trend will populate as you create bookings." />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" style={{ fontSize: '0.75rem' }} />
                  <YAxis style={{ fontSize: '0.75rem' }} />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#06b6d4" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="t-card p-4 position-relative h-100">
            <Trophy size={20} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--primary-light)' }} />
            <div className="fw-semibold mb-3">Top Customers</div>
            {topCustomers.length === 0 ? (
              <FriendlyEmpty icon={<Users size={28} className="text-muted" />} title="No customers yet" hint="Book on behalf of customers to see them rank here." />
            ) : (
              <div className="d-flex flex-column gap-2">
                {topCustomers.map((c, i) => (
                  <div key={c.customerId} className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background: 'var(--primary-lighter)', fontSize: '0.82rem' }}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge" style={{ background: '#06b6d433', color: '#0e7490', fontWeight: 700, width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>{i+1}</span>
                      <div>
                        <div className="fw-semibold">{getUserName(c.customerId)}</div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>{c.count} booking{c.count === 1 ? '' : 's'}</div>
                      </div>
                    </div>
                    <div className="fw-bold">{inr(c.total)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <h6 className="fw-bold text-muted mt-4 mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Pipeline</h6>
      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="t-card p-4 position-relative">
            <Activity size={20} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--primary-light)' }} />
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="fw-semibold">Recent Bookings</div>
              <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/agent/bookings')}>View all <ArrowRight size={12}/></button>
            </div>
            {bookings.length === 0 ? (
              <FriendlyEmpty icon={<BookOpen size={28} className="text-muted" />} title="No bookings yet" hint="Use the Group Booking page to create your first booking." />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-sm align-middle mb-0" style={{ fontSize: '0.82rem' }}>
                  <thead><tr className="text-muted"><th>ID</th><th>Customer</th><th>Type</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {bookings.slice(0, 8).map(b => (
                      <tr key={b.bookingId}>
                        <td className="fw-semibold">#{b.bookingId}</td>
                        <td>{getUserName(b.customerId)}</td>
                        <td className="text-muted small">{b.itemType}</td>
                        <td className="text-muted small">{b.date || '—'}</td>
                        <td>{inr(b.amount)}</td>
                        <td><StatusPill value={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="t-card p-4 position-relative h-100">
            <CreditCard size={20} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--primary-light)' }} />
            <div className="fw-semibold mb-3">Conversion Funnel</div>
            <FunnelRow label="Created" value={funnel.created} color="#94a3b8" pct={100} />
            <FunnelRow label="Confirmed" value={funnel.confirmed} color="#16a34a" pct={funnel.created ? Math.round(funnel.confirmed / funnel.created * 100) : 0} />
            <FunnelRow label="Cancelled" value={funnel.cancelled} color="#dc2626" pct={funnel.created ? Math.round(funnel.cancelled / funnel.created * 100) : 0} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FunnelRow({ label, value, color, pct }) {
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between" style={{ fontSize: '0.8rem' }}>
        <span className="text-muted">{label}</span>
        <span className="fw-semibold" style={{ color }}>{value} · {pct}%</span>
      </div>
      <div className="progress mt-1" style={{ height: 8, background: 'var(--primary-lighter)' }}>
        <div className="progress-bar" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function StatusPill({ value }) {
  const color = STATUS_COLORS[value] || '#6b7280';
  return <span className="badge" style={{ background: color + '22', color, fontSize: '0.7rem', fontWeight: 600 }}>{value}</span>;
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
