import React, { useEffect, useState, useMemo } from 'react';
import { ShieldCheck, FileText, AlertTriangle, Activity, Inbox, Eye, Clock } from 'lucide-react';
import { SkeletonCard } from '../../components/shared/SharedComponents';
import api from '../../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ACTION_COLORS = {
  CREATE: '#3b82f6',
  APPROVE: '#16a34a',
  REJECT: '#dc2626',
  CANCEL: '#dc2626',
  MARK_PAID: '#8b5cf6',
  PAYMENT_COMPLETED: '#8b5cf6',
  REFUND: '#d97706',
  UPDATE: '#0ea5e9',
  DELETE: '#6b7280',
};
const FLAG_THRESHOLD = 50000;
const inr = (v) => `₹${Math.round(v || 0).toLocaleString()}`;

export default function ComplianceDashboard() {
  const [logs, setLogs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reportCount, setReportCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/audit-logs?page=0&size=50&sort=createdAt,desc').catch(() => ({ data: {} })),
      api.get('/compliance-reports?page=0&size=1').catch(() => ({ data: {} })),
      api.get('/bookings?page=0&size=500').catch(() => ({ data: {} })),
    ]).then(([al, cr, b]) => {
      setLogs(Array.isArray(al.data?.content) ? al.data.content : Array.isArray(al.data) ? al.data : []);
      setReportCount(cr.data?.totalElements || 0);
      setBookings(Array.isArray(b.data?.content) ? b.data.content : Array.isArray(b.data) ? b.data : []);
      setLoading(false);
    });
  }, []);

  const flagged = useMemo(() => bookings.filter(b => Number(b.amount || 0) > FLAG_THRESHOLD), [bookings]);

  const actionBreakdown = useMemo(() => {
    const map = {};
    logs.forEach(l => { map[l.action] = (map[l.action] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [logs]);

  if (loading) return <div className="row g-3">{[1,2,3,4].map(i => <div className="col-md-3" key={i}><SkeletonCard height={100}/></div>)}</div>;

  const alertBg = flagged.length > 0 ? 'linear-gradient(135deg, #b91c1c, #ef4444)' : 'linear-gradient(135deg, #047857, #10b981)';

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-0">Compliance Dashboard</h4>
      </div>

      {/* Alert banner */}
      <div className="t-card p-3 mt-3 mb-4" style={{ background: alertBg, color: 'white', borderRadius: 'var(--radius-lg)' }}>
        <div className="d-flex align-items-center gap-3">
          {flagged.length > 0 ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
          <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
            {flagged.length > 0
              ? `${flagged.length} high-value booking${flagged.length === 1 ? '' : 's'} flagged`
              : 'All clear — no high-value bookings flagged'}
          </div>
          <div className="ms-auto d-flex gap-4" style={{ fontSize: '0.85rem' }}>
            <div><span style={{ opacity: 0.75 }}>Audit entries</span>&nbsp;<strong>{logs.length}</strong></div>
            <div><span style={{ opacity: 0.75 }}>Reports</span>&nbsp;<strong>{reportCount}</strong></div>
          </div>
        </div>
      </div>

      {/* Live audit feed + action breakdown */}
      <h6 className="fw-bold text-muted mt-4 mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Live Audit Feed</h6>
      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="t-card p-4 position-relative">
            <Activity size={20} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--primary-light)' }} />
            <div className="fw-semibold mb-3">Recent Actions ({logs.length} captured)</div>
            {logs.length === 0 ? (
              <FriendlyEmpty icon={<Inbox size={28} className="text-muted" />} title="Audit log is empty" hint="State-changing actions across booking, payment, and approval flows will stream here." />
            ) : (
              <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                {logs.slice(0, 15).map(log => {
                  const color = ACTION_COLORS[log.action] || '#6b7280';
                  const ts = (log.timestamp || log.createdAt || '');
                  return (
                    <div key={log.logId} className="d-flex align-items-start gap-3 py-2" style={{ borderBottom: '1px solid var(--primary-lighter)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, marginTop: 6, flexShrink: 0 }} />
                      <div className="flex-grow-1" style={{ fontSize: '0.82rem' }}>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge" style={{ background: color + '22', color, fontSize: '0.65rem', fontWeight: 700 }}>{log.action}</span>
                          <span className="fw-semibold">{log.entityType} #{log.entityId}</span>
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{log.details || '—'}</div>
                      </div>
                      <div className="text-muted text-end" style={{ fontSize: '0.7rem', minWidth: 130 }}>
                        <div>{log.performedBy || 'system'}</div>
                        <div><Clock size={10} className="me-1"/>{ts.replace('T', ' ').substring(0, 19)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="t-card p-4 position-relative h-100">
            <FileText size={20} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--primary-light)' }} />
            <div className="fw-semibold mb-3">Action Breakdown</div>
            {actionBreakdown.length === 0 ? (
              <FriendlyEmpty icon={<FileText size={28} className="text-muted" />} title="No actions yet" hint="A pie chart will appear once events accumulate." />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={actionBreakdown} dataKey="value" nameKey="name" outerRadius={75}>
                    {actionBreakdown.map(e => <Cell key={e.name} fill={ACTION_COLORS[e.name] || '#94a3b8'} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '0.65rem' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Flagged items */}
      <h6 className="fw-bold text-muted mt-4 mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Flagged Items · Amount &gt; {inr(FLAG_THRESHOLD)}</h6>
      <div className="t-card p-4 mb-4 position-relative">
        <Eye size={20} style={{ position: 'absolute', top: 16, right: 16, color: 'var(--primary-light)' }} />
        <div className="fw-semibold mb-3">High-Value Bookings Requiring Review</div>
        {flagged.length === 0 ? (
          <FriendlyEmpty icon={<ShieldCheck size={28} className="text-success" />} title="Nothing flagged" hint={`No booking has exceeded the ${inr(FLAG_THRESHOLD)} review threshold.`} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-sm align-middle mb-0" style={{ fontSize: '0.82rem' }}>
              <thead><tr className="text-muted"><th>Booking</th><th>Employee</th><th>Company</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {flagged.slice(0, 10).map(b => (
                  <tr key={b.bookingId}>
                    <td className="fw-semibold">#{b.bookingId}</td>
                    <td>#{b.customerId}</td>
                    <td className="small text-muted">{b.bookingCompany || '—'}</td>
                    <td className="small">{b.itemType}</td>
                    <td className="fw-bold" style={{ color: '#dc2626' }}>{inr(b.amount)}</td>
                    <td><span className="badge" style={{ background: '#dc262622', color: '#dc2626', fontSize: '0.7rem', fontWeight: 600 }}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
