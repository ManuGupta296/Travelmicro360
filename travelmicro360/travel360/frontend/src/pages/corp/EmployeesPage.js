import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';

export default function EmployeesPage() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const myCompany = currentUser?.companyName;
    Promise.all([
      api.get('/users?page=0&size=500').catch(() => ({ data: {} })),
      api.get('/bookings?page=0&size=500').catch(() => ({ data: {} })),
    ]).then(([u, b]) => {
      const allUsers = (u.data.content || u.data || []).filter(u => u.role === 'TRAVELER');
      setUsers(myCompany ? allUsers.filter(u => u.companyName === myCompany) : allUsers);
      const allBookings = b.data.content || b.data || [];
      setBookings(myCompany ? allBookings.filter(b => b.bookingCompany === myCompany) : allBookings);
      setLoading(false);
    });
  }, []);

  const data = users.map(u => {
    const ub = bookings.filter(b => (b.customerId || b.userId) === u.userId);
    const confirmed = ub.filter(b => b.status === 'CONFIRMED');
    return { ...u, trips: ub.length, spent: confirmed.reduce((s, b) => s + (b.amount || b.totalAmount || 0), 0) };
  });

  const columns = [
    { key: 'name', label: 'Name', accessor: 'name' },
    { key: 'email', label: 'Email', accessor: 'email' },
    { key: 'phone', label: 'Phone', accessor: 'phone' },
    { key: 'trips', label: 'Total Trips', accessor: 'trips' },
    { key: 'spent', label: 'Total Spent', render: r => `₹${r.spent.toLocaleString()}` },
  ];

  return (
    <div>
      <h4 className="fw-bold mb-4">Employees</h4>
      <div className="t-card p-3"><DataTable columns={columns} data={data} loading={loading} /></div>
    </div>
  );
}

