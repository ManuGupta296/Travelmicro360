import React, { useEffect, useState, useMemo } from 'react';
import { Users, Building2, Package, BarChart3, Plus, Activity, Briefcase, Inbox, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SkeletonCard } from '../../components/shared/SharedComponents';
import api from '../../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TYPE_COLORS = { FLIGHT: '#3b82f6', HOTEL: '#8b5cf6', TRAIN: '#0ea5e9', BUS: '#f59e0b', TRANSPORT: '#10b981' };
const STATUS_COLORS = { CONFIRMED: '#16a34a', PENDING: '#d97706', CANCELLED: '#dc2626', COMPLETED: '#16a34a' };
const inr = (v) => `₹${Math.round(v || 0).toLocaleString()}`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/users?page=0&size=1').catch(() => ({ data: {} })),
      api.get('/partners?page=0&size=1').catch(() => ({ data: {} })),
      api.get('/inventories?page=0&size=500').catch(() => ({ data: {} })),
      api.get('/bookings?page=0&size=1').catch(() => ({ data: {} })),
      api.get('/bookings?page=0&size=8&sort=createdAt,desc').catch(() => ({ data: {} })),
      api.get('/companies?page=0&size=1').catch(() => ({ data: {} })),
    ]).then(([u, p, i, b, rb, c]) => {
      const invArr = Array.isArray(i.data?.content) ? i.data.content : Array.isArray(i.data) ? i.data : [];
      setInventory(invArr);
      setCounts({
        users: u.data?.totalElements || 0,
        partners: p.data?.totalElements || 0,
        inventory: i.data?.totalElements || invArr.length,
        bookings: b.data?.totalElements || 0,
        companies: c.data?.totalElements || 0,
      });
      setRecentBookings(Array.isArray(rb.data?.content) ? rb.data.content : Array.isArray(rb.data) ? rb.data : []);
      setLoading(false);
    });
  }, []);

  const invByType = useMemo(() => {
    const map = {};
    inventory.forEach(i => { map[i.itemType] = (map[i.itemType] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  if (loading) return <div className="row g-3">{[1,2,3,4].map(i => <div className="col-md-3" key={i}><SkeletonCard height={100}/></div>)}</div>;

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-0">Admin Dashboard</h4>
      </div>

      {/* Hero */}
      <div className="row g-3 mt-3 mb-4">
        <div className="col-lg-6">
          <div className="t-card p-4 h-100 position-relative" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', color: 'white', borderRadius: 'var(--radius-lg)' }}>
            <BarChart3 size={22} style={{ position: 'absolute', top: 16, right: 16, opacity: 0.5 }} />
            <div style={{ opacity: 0.85, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Bookings</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: 4 }}>{counts.bookings}</div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="t-card p-4 h-100 position-relative" style={{ borderLeft: '4px solid #16a34a' }}>
            <Shield size={22} style={{ position: 'absolute', top: 16, right: 16, color: '#16a34a' }} />
            <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform Health</div>
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge" style={{ background: '#16a34a22', color: '#16a34a', fontSize: '0.85rem', padding: '6px 10px' }}>● All systems operational</span>
            </div>
            <div className="row g-2">
              {[
                { label: 'Users', value: counts.users, icon: <Users size={14} /> },
                { label: 'Partners', value: counts.partners, icon: <Briefcase size={14} /> },
                { label: 'Inventory', value: counts.inventory, icon: <Package size={14} /> },
                { label: 'Companies', value: counts.companies, icon: <Building2 size={14} /> },
              ].map(p => (
                <div className="col-6" key={p.label}>
                  <div className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: 'var(--primary-lighter)' }}>
                    <div className="text-muted">{p.icon}</div>
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>{p.label}</div>
                      <div className="fw-bold" style={{ fontSize: '0.95rem' }}>{p.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <h6 className="fw-bold text-muted mt-4 mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Recent Platform Activity</h6>
      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="t-card p-4 position-relative">
            <Activity size={20} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--primary-light)' }} />
            <div className="fw-semibold mb-3">Recent Bookings</div>
            {recentBookings.length === 0 ? (
              <FriendlyEmpty icon={<Inbox size={28} className="text-muted" />} title="No bookings yet" hint="Bookings made by any user across the platform will appear here." />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-sm align-middle mb-0" style={{ fontSize: '0.82rem' }}>
                  <thead><tr className="text-muted"><th>ID</th><th>User</th><th>Type</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {recentBookings.map(b => (
                      <tr key={b.bookingId}>
                        <td className="fw-semibold">#{b.bookingId}</td>
                        <td className="text-muted">#{b.customerId}</td>
                        <td><span className="badge" style={{ background: (TYPE_COLORS[b.itemType] || '#94a3b8') + '22', color: TYPE_COLORS[b.itemType] || '#475569', fontSize: '0.7rem' }}>{b.itemType}</span></td>
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
            <Plus size={20} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--primary-light)' }} />
            <div className="fw-semibold mb-3">Quick Actions</div>
            <div className="d-flex flex-column gap-2 mb-4">
              <button className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2" onClick={() => navigate('/admin/users')}><Users size={14}/> Manage users</button>
              <button className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2" onClick={() => navigate('/admin/partners')}><Briefcase size={14}/> Manage partners</button>
              <button className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2" onClick={() => navigate('/admin/inventory')}><Package size={14}/> Manage inventory</button>
            </div>
            <div className="fw-semibold mb-2 small">Inventory by Type</div>
            {invByType.length === 0 ? (
              <FriendlyEmpty icon={<Package size={24} className="text-muted" />} title="Empty" hint="No inventory rows yet." />
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={invByType} dataKey="value" nameKey="name" outerRadius={55}>
                    {invByType.map(e => <Cell key={e.name} fill={TYPE_COLORS[e.name] || '#94a3b8'} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '0.65rem' }} />
                </PieChart>
              </ResponsiveContainer>
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
