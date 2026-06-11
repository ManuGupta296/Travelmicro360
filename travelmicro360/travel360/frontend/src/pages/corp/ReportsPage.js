import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { SkeletonCard } from '../../components/shared/SharedComponents';
import ExportCsvButton from '../../components/shared/ExportCsvButton';
import { useLookups } from '../../hooks/useLookups';

export default function ReportsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { users, getUserName } = useLookups();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const company = currentUser?.companyName;
    api.get('/bookings?page=0&size=500').then(r => {
      const all = r.data.content || r.data || [];
      setBookings(all.filter(b => b.purpose === 'BUSINESS' && (!company || b.bookingCompany === company)));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonCard height={300} />;

  // Top spenders
  const spendByUser = {};
  bookings.filter(b => b.status === 'CONFIRMED').forEach(b => { spendByUser[b.customerId || b.userId] = (spendByUser[b.customerId || b.userId] || 0) + (b.amount || b.totalAmount || 0); });
  const topSpenders = Object.entries(spendByUser).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Compliance
  const withinPolicy = bookings.filter(b => (b.amount || b.totalAmount || 0) <= 15000).length;
  const overPolicy = bookings.filter(b => (b.amount || b.totalAmount || 0) > 15000).length;

  const csvData = bookings.map(b => ({ bookingId: b.bookingId, user: getUserName(b.customerId || b.userId), amount: b.amount || b.totalAmount, date: b.date || b.travelDate, status: b.status }));

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold mb-0">Travel Reports</h4>
        <ExportCsvButton data={csvData} filename="travel_reports.csv" />
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="t-card p-4">
            <h6 className="fw-bold mb-3">Top 5 Spenders</h6>
            <table className="table table-sm" style={{fontSize:'0.85rem'}}>
              <thead><tr><th>#</th><th>Employee</th><th>Total Spent</th></tr></thead>
              <tbody>
                {topSpenders.map(([uid, amt], i) => (
                  <tr key={uid}><td>{i+1}</td><td>{getUserName(Number(uid))}</td><td>₹{amt.toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-md-6">
          <div className="t-card p-4">
            <h6 className="fw-bold mb-3">Policy Compliance</h6>
            <div className="d-flex justify-content-around text-center">
              <div>
                <div className="fw-bold" style={{fontSize:'2rem', color:'var(--teal)'}}>{withinPolicy}</div>
                <div className="text-muted small">Within Policy</div>
              </div>
              <div>
                <div className="fw-bold" style={{fontSize:'2rem', color:'var(--danger)'}}>{overPolicy}</div>
                <div className="text-muted small">Over Policy</div>
              </div>
            </div>
            <div className="progress mt-3" style={{height:12, borderRadius:6}}>
              <div className="progress-bar bg-success" style={{width: `${bookings.length ? (withinPolicy/bookings.length*100) : 0}%`}} />
              <div className="progress-bar bg-danger" style={{width: `${bookings.length ? (overPolicy/bookings.length*100) : 0}%`}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

