import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Plane, Building2, Car } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import FilterTabs from '../../components/shared/FilterTabs';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const TYPES = ['AIRLINE','HOTEL','TRANSPORT'];
const TYPE_ICONS = { AIRLINE: <Plane size={14}/>, HOTEL: <Building2 size={14}/>, TRANSPORT: <Car size={14}/> };

export default function PartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'AIRLINE', status: 'ACTIVE' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => { setLoading(true); api.get('/partners?page=0&size=500').then(r => setPartners((r.data.content || r.data || []).sort((a, b) => (b.partnerId || 0) - (a.partnerId || 0)))).catch(() => toast.error('Failed')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const filtered = filter === 'ALL' ? partners : partners.filter(p => p.type === filter);

  const columns = [
    { key: 'partnerId', label: 'ID', accessor: 'partnerId' },
    { key: 'name', label: 'Name', accessor: 'name' },
    { key: 'type', label: 'Type', render: r => <span className="d-flex align-items-center gap-1">{TYPE_ICONS[r.type]} {r.type}</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  const openAdd = () => { setEditItem(null); setForm({ name: '', type: 'AIRLINE', status: 'ACTIVE' }); setShowModal(true); };
  const openEdit = (p) => { setEditItem(p); setForm({ name: p.name, type: p.type, status: p.status }); setShowModal(true); };

  const handleSave = async () => {
    try {
      if (editItem) { await api.put(`/partners/${editItem.partnerId}`, form); toast.success('Updated'); }
      else { await api.post('/partners', form); toast.success('Created'); }
      setShowModal(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/partners/${deleteTarget.partnerId}`); toast.success('Deleted'); setDeleteTarget(null); load(); }
    catch { toast.error('Failed'); setDeleteTarget(null); }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold mb-0">Partner Management</h4>
        <button className="btn btn-accent btn-sm d-flex align-items-center gap-1" onClick={openAdd}><Plus size={14}/> Add Partner</button>
      </div>
      <FilterTabs tabs={[{key:'ALL',label:'All'}, ...TYPES.map(t => ({key:t, label:t.charAt(0)+t.slice(1).toLowerCase()+'s'}))]} active={filter} onChange={setFilter} />
      <div className="t-card p-3">
        <DataTable columns={columns} data={filtered} loading={loading}
          actions={row => (
            <div className="d-flex gap-1">
              <button className="btn btn-sm btn-light" onClick={() => openEdit(row)}><Edit size={13}/></button>
              <button className="btn btn-sm btn-light text-danger" onClick={() => setDeleteTarget(row)}><Trash2 size={13}/></button>
            </div>
          )} />
      </div>
      {showModal && (
        <>
          <div className="modal-backdrop show" style={{zIndex:1050}} onClick={() => setShowModal(false)}/>
          <div className="modal show d-block" style={{zIndex:1055}}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
              <div className="modal-content border-0 shadow">
                <div className="modal-header"><h6 className="modal-title fw-bold">{editItem ? 'Edit' : 'Add'} Partner</h6><button className="btn-close" onClick={() => setShowModal(false)}/></div>
                <div className="modal-body">
                  <div className="mb-2"><label className="form-label small">Name</label><input className="form-control form-control-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/></div>
                  <div className="mb-2"><label className="form-label small">Type</label><select className="form-select form-select-sm" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                  <div className="mb-2"><label className="form-label small">Status</label><select className="form-select form-select-sm" value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option>ACTIVE</option><option>INACTIVE</option><option>SUSPENDED</option></select></div>
                </div>
                <div className="modal-footer"><button className="btn btn-light btn-sm" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button></div>
              </div>
            </div>
          </div>
        </>
      )}
      <ConfirmDialog open={!!deleteTarget} title="Delete Partner" message={`Delete ${deleteTarget?.name}?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} confirmLabel="Delete" danger />
    </div>
  );
}

