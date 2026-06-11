import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { SkeletonCard } from '../../components/shared/SharedComponents';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const MONTHLY_BUDGET = 50000;
const COLORS = ['#0a2540', '#00bfa6', '#ff6f00'];

export default function BudgetPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const company = currentUser?.companyName;
    api.get('/bookings?page=0&size=500').then(r => {
      const all = r.data.content || r.data || [];
      setBookings(all.filter(b => b.purpose === 'BUSINESS' && (!company || b.bookingCompany === company)));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonCard height={300} />;

  const now = new Date();
  const thisMonth = now.toISOString().substring(0, 7);
  const confirmed = bookings.filter(b =>
    b.status === 'CONFIRMED' &&
    (b.createdAt || '').startsWith(thisMonth)
  );
  const totalSpend = confirmed.reduce((s, b) => s + (b.amount || 0), 0);
  const remaining = Math.max(0, MONTHLY_BUDGET - totalSpend);
  const pct = Math.round((totalSpend / MONTHLY_BUDGET) * 100);

  // Category breakdown by itemType
  const flights = confirmed.filter(b => b.itemType === 'FLIGHT').reduce((s, b) => s + (b.amount || 0), 0);
  const hotels = confirmed.filter(b => b.itemType === 'HOTEL').reduce((s, b) => s + (b.amount || 0), 0);
  const transport = confirmed.filter(b => b.itemType === 'TRANSPORT').reduce((s, b) => s + (b.amount || 0), 0);
  const pieData = [
    { name: 'Flights', value: flights || 0 },
    { name: 'Hotels', value: hotels || 0 },
    { name: 'Transport', value: transport || 0 },
  ].filter(d => d.value > 0);

  return (
    <div>
      <h4 className="fw-bold mb-4">Budget Management</h4>
      <div className="row g-3">
        <div className="col-md-8">
          <div className="t-card p-4 mb-3">
            <h6 className="fw-bold mb-3">Monthly Budget Utilization</h6>
            <div className="d-flex justify-content-between mb-2">
              <span className="small text-muted">Used this month: ₹{totalSpend.toLocaleString()}</span>
              <span className="small text-muted">Budget: ₹{MONTHLY_BUDGET.toLocaleString()}</span>
            </div>
            <div className="progress" style={{height: 28, borderRadius: 12}}>
              <div className="progress-bar" style={{width: `${Math.min(pct, 100)}%`, background: pct > 90 ? '#dc3545' : pct > 70 ? '#ff6f00' : '#00bfa6', borderRadius: 12, fontWeight: 700}}>{pct}%</div>
            </div>
            <p className="text-muted small mt-2">Remaining: ₹{remaining.toLocaleString()}</p>
          </div>

          <div className="t-card p-4">
            <h6 className="fw-bold mb-3">Department Allocation</h6>
            <table className="table table-sm" style={{fontSize:'0.85rem'}}>
              <thead><tr><th>Department</th><th>Allocated</th><th>Used (this month)</th><th>Utilization</th></tr></thead>
              <tbody>
                <tr><td>Travel</td><td>₹{MONTHLY_BUDGET.toLocaleString()}</td><td>₹{totalSpend.toLocaleString()}</td><td>{pct}%</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-md-4">
          <div className="t-card p-4">
            <h6 className="fw-bold mb-3">Spend by Category</h6>
            {pieData.length === 0 ? <p className="text-muted small">No spend data yet.</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
