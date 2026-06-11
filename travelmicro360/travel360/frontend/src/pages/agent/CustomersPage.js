import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Plane } from 'lucide-react';
import { SkeletonCard } from '../../components/shared/SharedComponents';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { isValidEmail, isValidPhone, EMAIL_ERROR, PHONE_ERROR } from '../../utils/validators';

// Agent isolation: GET /customers returns only this agent's customers (backend-filtered)

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers?size=200');
      setCustomers((res.data.content || res.data || []).sort((a, b) => (b.customerId || 0) - (a.customerId || 0)));
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!isValidEmail(form.email)) errs.email = EMAIL_ERROR;
    if (form.phone && !isValidPhone(form.phone)) errs.phone = PHONE_ERROR;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      if (editing) {
        await api.put(`/customers/${editing.customerId}`, form);
        toast.success('Customer updated');
      } else {
        await api.post('/customers', form);
        toast.success('Customer added');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', email: '', phone: '' });
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Customer deleted');
      setConfirmDelete(null);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const openEdit = (c) => {
    setEditing(c);
    setErrors({});
    setForm({ name: c.name, email: c.email, phone: c.phone || '' });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditing(null);
    setErrors({});
    setForm({ name: '', email: '', phone: '' });
    setShowModal(true);
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="row g-3">{[1,2,3].map(i => <div className="col-12" key={i}><SkeletonCard height={60}/></div>)}</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Your Customers</h4>
        <button className="btn btn-sm btn-accent" onClick={openAdd}><Plus size={16} className="me-1"/>Add Customer</button>
      </div>

      <div className="t-card p-3 mb-3">
        <div className="position-relative">
          <Search size={16} className="position-absolute top-50 translate-middle-y" style={{left:12}}/>
          <input className="form-control form-control-sm ps-5" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="t-card p-5 text-center">
          <p className="text-muted mb-2">You haven't added any customers yet.</p>
          <button className="btn btn-sm btn-accent" onClick={openAdd}>Add Your First Customer →</button>
        </div>
      ) : (
        <div className="t-card">
          <table className="table table-hover mb-0" style={{fontSize:'0.85rem'}}>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Since</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.customerId} style={{cursor:'pointer'}} onClick={() => navigate(`/agent/customer/${c.customerId}`)}>
                  <td className="fw-semibold">{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="btn btn-sm btn-accent me-1 d-inline-flex align-items-center gap-1"
                      onClick={() => navigate('/agent/group-booking', { state: { customerId: c.customerId } })}>
                      <Plane size={14}/> Book
                    </button>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(c)}><Edit2 size={14}/></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setConfirmDelete(c)}><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{background:'rgba(0,0,0,0.4)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header"><h5>{editing ? 'Edit Customer' : 'Add Customer'}</h5><button className="btn-close" onClick={() => setShowModal(false)}/></div>
              <div className="modal-body">
                <div className="mb-3"><label className="form-label small">Name *</label><input className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>{errors.name && <div className="invalid-feedback">{errors.name}</div>}</div>
                <div className="mb-3"><label className="form-label small">Email *</label><input className={`form-control ${errors.email ? 'is-invalid' : ''}`} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}/>{errors.email && <div className="invalid-feedback">{errors.email}</div>}</div>
                <div className="mb-3"><label className="form-label small">Phone</label><input className={`form-control ${errors.phone ? 'is-invalid' : ''}`} inputMode="numeric" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}/>{errors.phone && <div className="invalid-feedback">{errors.phone}</div>}</div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-sm btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-sm btn-accent" onClick={handleSave}>{editing ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Customer"
        message={confirmDelete ? `Are you sure you want to delete "${confirmDelete.name}"?` : ''}
        onConfirm={() => handleDelete(confirmDelete.customerId)}
        onCancel={() => setConfirmDelete(null)}
        danger
      />
    </div>
  );
}
