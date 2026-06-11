import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { SkeletonCard } from '../../components/shared/SharedComponents';
import ExportCsvButton from '../../components/shared/ExportCsvButton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/invoices?page=0&size=500').then(r => setInvoices(r.data.content || r.data || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonCard height={300} />;

  // Monthly revenue from paid invoices
  const paidInvoices = invoices.filter(i => i.status === 'PAID');
  const monthlyMap = {};
  paidInvoices.forEach(inv => {
    const d = inv.invoiceDate || inv.createdAt || '';
    const month = d.substring(0, 7) || 'Unknown';
    monthlyMap[month] = (monthlyMap[month] || 0) + (inv.amount || 0);
  });
  const chartData = Object.entries(monthlyMap).sort().slice(-6).map(([m, v]) => ({ month: m, revenue: v }));

  const csvData = paidInvoices.map(i => ({ invoiceId: i.invoiceId, bookingId: i.bookingId, amount: i.amount, date: i.invoiceDate, status: i.status }));

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h4 className="fw-bold mb-0">Revenue Reports</h4>
        <ExportCsvButton data={csvData} filename="revenue_report.csv" columns={[{key:'invoiceId',label:'Invoice ID'},{key:'bookingId',label:'Booking ID'},{key:'amount',label:'Amount'},{key:'date',label:'Date'},{key:'status',label:'Status'}]} />
      </div>
      <p className="text-muted small mb-4">Revenue from paid invoices (refunds appear as reversed settlements).</p>

      <div className="t-card p-4 mb-4">
        <h6 className="fw-bold mb-3">Monthly Revenue (Last 6 Months)</h6>
        {chartData.length === 0 ? <p className="text-muted small">No revenue data yet.</p> : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" style={{fontSize:'0.75rem'}} />
              <YAxis style={{fontSize:'0.75rem'}} />
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="var(--teal)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="t-card p-4">
        <h6 className="fw-bold mb-3">Revenue Summary</h6>
        <table className="table table-sm" style={{fontSize:'0.85rem'}}>
          <thead><tr><th>Month</th><th>Revenue</th><th>Invoices</th></tr></thead>
          <tbody>
            {chartData.map(d => (
              <tr key={d.month}><td>{d.month}</td><td>₹{d.revenue.toLocaleString()}</td><td>{paidInvoices.filter(i => (i.invoiceDate||i.createdAt||'').startsWith(d.month)).length}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

