import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/shared/StatusBadge';
import { SkeletonCard } from '../../components/shared/SharedComponents';

// Agent isolation: GET /customers/:id returns only if owned by this agent (backend-enforced)

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, bookingsRes] = await Promise.all([
          api.get(`/customers/${id}`),
          api.get(`/bookings?size=500`),
        ]);
        setCustomer(custRes.data);

        const allBookings = bookingsRes.data.content || bookingsRes.data || [];
        const custBookings = allBookings.filter(b => b.agentCustomerId === Number(id));
        setBookings(custBookings);
      } catch (err) {
        console.error('Customer detail error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <SkeletonCard height={300} />;
  if (!customer) return <p className="text-muted">Customer not found.</p>;

  const totalSpent = bookings.reduce((s, b) => s + (b.amount || 0), 0);

  return (
    <div>
      <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => navigate('/agent/customers')}>← Back</button>
      <h4 className="fw-bold mb-4">{customer.name}</h4>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="t-card p-3 text-center">
            <div className="text-muted small">Email</div>
            <div className="fw-bold">{customer.email}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="t-card p-3 text-center">
            <div className="text-muted small">Phone</div>
            <div className="fw-bold">{customer.phone || '—'}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="t-card p-3 text-center">
            <div className="text-muted small">Bookings</div>
            <div className="fw-bold">{bookings.length}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="t-card p-3 text-center">
            <div className="text-muted small">Total Spent</div>
            <div className="fw-bold">₹{totalSpent.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="t-card p-4">
        <h6 className="fw-bold mb-3">Booking History</h6>
        {bookings.length === 0 ? (
          <p className="text-muted small">No bookings found for this customer.</p>
        ) : (
          <table className="table table-sm table-hover" style={{ fontSize: '0.8rem' }}>
            <thead><tr><th>ID</th><th>Type</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.bookingId}>
                  <td>#{b.bookingId}</td>
                  <td>{b.itemType || '—'}</td>
                  <td>{b.date || '—'}</td>
                  <td>₹{(b.amount || 0).toLocaleString()}</td>
                  <td><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
