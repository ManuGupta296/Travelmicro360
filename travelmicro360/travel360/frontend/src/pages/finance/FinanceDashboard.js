import React, { useEffect, useState, useMemo } from 'react';
import { Receipt, CreditCard, TrendingUp, AlertCircle, Wallet as WalletIcon, Banknote } from 'lucide-react';
import { SkeletonCard } from '../../components/shared/SharedComponents';
import api from '../../services/api';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useLookups } from '../../hooks/useLookups';

const STATUS_COLORS = { PAID: '#16a34a', SENT: '#d97706', REFUNDED: '#dc2626', OVERDUE: '#dc2626', PENDING: '#d97706', CANCELLED: '#6b7280' };
const inr = (v) => `₹${Math.round(v || 0).toLocaleString()}`;

export default function FinanceDashboard() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getPartnerName } = useLookups();

  useEffect(() => {
    Promise.all([
      api.get('/invoices?page=0&size=500').catch(() => ({ data: {} })),
      api.get('/payments?page=0&size=10&sort=createdAt,desc').catch(() => ({ data: {} })),
      api.get('/settlements?page=0&size=500').catch(() => ({ data: {} })),
    ]).then(([inv, pay, sett]) => {
      setInvoices(Array.isArray(inv.data?.content) ? inv.data.content : Array.isArray(inv.data) ? inv.data : []);
      setPayments(Array.isArray(pay.data?.content) ? pay.data.content : Array.isArray(pay.data) ? pay.data : []);
      setSettlements(Array.isArray(sett.data?.content) ? sett.data.content : Array.isArray(sett.data) ? sett.data : []);
      setLoading(false);
    });
  }, []);

  const kpis = useMemo(() => {
    const paid = invoices.filter(i => i.status === 'PAID');
    const pending = invoices.filter(i => i.status === 'SENT' || i.status === 'PENDING' || i.status === 'OVERDUE');
    return {
      totalRevenue: paid.reduce((s, i) => s + Number(i.amount || 0), 0),
      outstanding: pending.reduce((s, i) => s + Number(i.amount || 0), 0),
      invoiceCount: invoices.length,
      pendingSettlements: settlements.filter(s => s.status === 'PENDING').reduce((s, x) => s + Number(x.settlementAmount || x.amount || 0), 0),
    };
  }, [invoices, settlements]);

  const invoiceStatusBreakdown = useMemo(() => {
    const counts = {};
    invoices.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [invoices]);

  if (loading) return <div className="row g-3">{[1,2,3,4].map(i => <div className="col-md-3" key={i}><SkeletonCard height={100}/></div>)}</div>;

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-0">Finance Dashboard</h4>
      </div>

      {/* Hero: revenue (8) + outstanding (4) */}
      <div className="row g-3 mt-3 mb-4">
        <div className="col-lg-8">
          <div className="t-card p-4 h-100 position-relative" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', borderRadius: 'var(--radius-lg)' }}>
            <TrendingUp size={22} style={{ position: 'absolute', top: 16, right: 16, opacity: 0.5 }} />
            <div style={{ opacity: 0.85, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue Collected</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: 4 }}>{inr(kpis.totalRevenue)}</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{invoices.filter(i => i.status === 'PAID').length} paid invoices</div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="t-card p-4 h-100 position-relative" style={{ borderLeft: '4px solid #d97706' }}>
            <AlertCircle size={22} style={{ position: 'absolute', top: 16, right: 16, color: '#d97706' }} />
            <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Outstanding</div>
            <div className="fw-bold" style={{ fontSize: '1.75rem', color: '#92400e' }}>{inr(kpis.outstanding)}</div>
            <div className="small text-muted">{invoices.filter(i => i.status === 'SENT' || i.status === 'PENDING').length} invoice(s) awaiting payment</div>
          </div>
        </div>
      </div>

      {/* Revenue Overview */}
      <h6 className="fw-bold text-muted mt-4 mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Revenue Overview</h6>
      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="t-card p-4 position-relative h-100">
            <Receipt size={20} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--primary-light)' }} />
            <div className="fw-semibold mb-3">Invoice Status Mix</div>
            {invoiceStatusBreakdown.length === 0 ? (
              <FriendlyEmpty icon={<Receipt size={28} className="text-muted" />} title="No invoices" hint="Status breakdown will populate once invoices are created." />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={invoiceStatusBreakdown} dataKey="value" nameKey="name" outerRadius={70} label>
                    {invoiceStatusBreakdown.map(entry => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Payment Activity */}
      <h6 className="fw-bold text-muted mt-4 mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Payment Activity</h6>
      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="t-card p-4 position-relative">
            <CreditCard size={20} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--primary-light)' }} />
            <div className="fw-semibold mb-3">Recent Payments</div>
            {payments.length === 0 ? (
              <FriendlyEmpty icon={<WalletIcon size={28} className="text-muted" />} title="No payments recorded" hint="Mark an invoice paid to see a payment land here." />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-sm align-middle mb-0" style={{ fontSize: '0.82rem' }}>
                  <thead><tr className="text-muted"><th>Payment</th><th>Booking</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
                  <tbody>
                    {payments.slice(0, 8).map(p => (
                      <tr key={p.paymentId}>
                        <td className="fw-semibold">#{p.paymentId}</td>
                        <td>#{p.bookingId}</td>
                        <td>{inr(p.amount)}</td>
                        <td className="text-muted small">{p.method || '—'}</td>
                        <td><StatusPill value={p.status} /></td>
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
            <Banknote size={20} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--primary-light)' }} />
            <div className="fw-semibold mb-3">Settlement Queue</div>
            {settlements.filter(s => s.status === 'PENDING').length === 0 ? (
              <FriendlyEmpty icon={<Banknote size={28} className="text-muted" />} title="Queue clear" hint="No pending partner settlements right now." />
            ) : (
              <div className="d-flex flex-column gap-2">
                {settlements.filter(s => s.status === 'PENDING').slice(0, 6).map(s => (
                  <div key={s.settlementId} className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background: 'var(--primary-lighter)', fontSize: '0.8rem' }}>
                    <div>
                      <div className="fw-semibold">{getPartnerName(s.partnerId)}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>Booking #{s.bookingId || '—'} · settle {s.settlementDate}</div>
                    </div>
                    <div className="fw-bold" style={{ color: '#92400e' }}>{inr(s.settlementAmount || s.amount)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
