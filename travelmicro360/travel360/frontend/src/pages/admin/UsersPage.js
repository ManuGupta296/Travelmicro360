import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import FilterTabs from '../../components/shared/FilterTabs';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { isValidEmail, isValidPhone, EMAIL_ERROR, PHONE_ERROR } from '../../utils/validators';

const ROLES = ['TRAVELER','TRAVEL_AGENT','CORPORATE_MANAGER','FINANCE_OFFICER','COMPLIANCE_OFFICER','ADMIN'];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'TRAVELER', phone: '' });
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/users?page=0&size=500').then(res => setUsers((res.data.content || res.data || []).sort((a, b) => (b.userId || 0) - (a.userId || 0))))
      .catch(() => toast.error('Failed to load users')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = roleFilter === 'ALL' ? users : users.filter(u => u.role === roleFilter);

  const columns = [
    { key: 'userId', label: 'ID', accessor: 'userId' },
    { key: 'name', label: 'Name', accessor: 'name' },
    { key: 'email', label: 'Email', accessor: 'email' },
    { key: 'role', label: 'Role', render: r => <StatusBadge status={r.role} /> },
    { key: 'phone', label: 'Phone', accessor: 'phone' },
  ];

  const openAdd = () => { setEditUser(null); setErrors({}); setForm({ name: '', email: '', password: 'demo123', role: 'TRAVELER', phone: '' }); setShowModal(true); };
  const openEdit = (u) => { setEditUser(u); setErrors({}); setForm({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone || '' }); setShowModal(true); };

  const handleSave = async () => {
    const errs = {};
    if (!isValidEmail(form.email)) errs.email = EMAIL_ERROR;
    if (form.phone && !isValidPhone(form.phone)) errs.phone = PHONE_ERROR;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      if (editUser) {
        await api.put(`/users/${editUser.userId}`, form);
        toast.success('User updated');
      } else {
        await api.post('/users', form);
        toast.success('User created');
      }
      setShowModal(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteTarget.userId}`);
      toast.success('User deleted'); setDeleteTarget(null); load();
    } catch { toast.error('Failed to delete'); setDeleteTarget(null); }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold mb-0">User Management</h4>
        <button className="btn btn-accent btn-sm d-flex align-items-center gap-1" onClick={openAdd}><Plus size={14}/> Add User</button>
      </div>

      <FilterTabs tabs={[{key:'ALL',label:'All'}, ...ROLES.map(r => ({key:r, label:r.replace(/_/g,' ')}))]} active={roleFilter} onChange={setRoleFilter} />

      <div className="t-card p-3">
        <DataTable columns={columns} data={filtered} loading={loading}
          actions={row => (
            <div className="d-flex gap-1">
              <button className="btn btn-sm btn-light" onClick={() => openEdit(row)}><Edit size={13}/></button>
              <button className="btn btn-sm btn-light text-danger" onClick={() => setDeleteTarget(row)}><Trash2 size={13}/></button>
            </div>
          )} />
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop show" style={{zIndex:1050}} onClick={() => setShowModal(false)}/>
          <div className="modal show d-block" style={{zIndex:1055}}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
              <div className="modal-content border-0 shadow">
                <div className="modal-header"><h6 className="modal-title fw-bold">{editUser ? 'Edit' : 'Add'} User</h6><button className="btn-close" onClick={() => setShowModal(false)}/></div>
                <div className="modal-body">
                  <div className="mb-2"><label className="form-label small">Name</label><input className="form-control form-control-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/></div>
                  <div className="mb-2"><label className="form-label small">Email</label><input className={`form-control form-control-sm ${errors.email ? 'is-invalid' : ''}`} value={form.email} onChange={e => setForm({...form, email: e.target.value})}/>{errors.email && <div className="invalid-feedback">{errors.email}</div>}</div>
                  {!editUser && <div className="mb-2"><label className="form-label small">Password</label><input className="form-control form-control-sm" value={form.password} onChange={e => setForm({...form, password: e.target.value})}/></div>}
                  <div className="mb-2"><label className="form-label small">Role</label><select className="form-select form-select-sm" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                  <div className="mb-2"><label className="form-label small">Phone</label><input className={`form-control form-control-sm ${errors.phone ? 'is-invalid' : ''}`} inputMode="numeric" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}/>{errors.phone && <div className="invalid-feedback">{errors.phone}</div>}</div>
                </div>
                <div className="modal-footer"><button className="btn btn-light btn-sm" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button></div>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete User" message={`Delete ${deleteTarget?.name}? This cannot be undone.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} confirmLabel="Delete" danger />
    </div>
  );
}

