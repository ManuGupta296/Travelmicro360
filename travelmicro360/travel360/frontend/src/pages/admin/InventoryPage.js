import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import FilterTabs from '../../components/shared/FilterTabs';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { useLookups } from '../../hooks/useLookups';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ partnerId: '', itemType: 'FLIGHT', name: '', price: '', availability: 30, details: '', status: 'AVAILABLE' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { partners, getPartnerName } = useLookups();

  const load = () => { setLoading(true); api.get('/inventories?page=0&size=500').then(r => setItems((r.data.content || r.data || []).sort((a, b) => (b.inventoryId || 0) - (a.inventoryId || 0)))).catch(() => toast.error('Failed')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const filtered = filter === 'ALL' ? items : items.filter(i => i.itemType === filter);

  const columns = [
    { key: 'name', label: 'Name', accessor: 'name' },
    { key: 'itemType', label: 'Type', accessor: 'itemType' },
    { key: 'partner', label: 'Partner', render: r => getPartnerName(r.partnerId) },
    { key: 'price', label: 'Price', render: r => `₹${(r.price || 0).toLocaleString()}` },
    { key: 'availability', label: 'Avail.', accessor: 'availability' },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  const openAdd = () => { setEditItem(null); setForm({ partnerId: partners[0]?.partnerId || '', itemType: 'FLIGHT', name: '', price: '', availability: 30, details: '{}', status: 'AVAILABLE' }); setShowModal(true); };
  const openEdit = (inv) => { setEditItem(inv); setForm({ partnerId: inv.partnerId, itemType: inv.itemType, name: inv.name, price: inv.price, availability: inv.availability, details: inv.details || '{}', status: inv.status }); setShowModal(true); };

  const handleSave = async () => {
    try {
      const payload = { ...form, price: Number(form.price), availability: Number(form.availability) };
      if (editItem) { await api.put(`/inventories/${editItem.inventoryId}`, payload); toast.success('Updated'); }
      else { await api.post('/inventories', payload); toast.success('Created'); }
      setShowModal(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/inventories/${deleteTarget.inventoryId}`); toast.success('Deleted'); setDeleteTarget(null); load(); }
    catch { toast.error('Failed'); setDeleteTarget(null); }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold mb-0">Inventory Management</h4>
        <button className="btn btn-accent btn-sm d-flex align-items-center gap-1" onClick={openAdd}><Plus size={14}/> Add Inventory</button>
      </div>
      <FilterTabs tabs={[{key:'ALL',label:'All'},{key:'FLIGHT',label:'Flights'},{key:'HOTEL',label:'Hotels'},{key:'TRANSPORT',label:'Transport'}]} active={filter} onChange={setFilter} />
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
            <div className="modal-dialog modal-lg modal-dialog-centered" onClick={e => e.stopPropagation()}>
              <div className="modal-content border-0 shadow">
                <div className="modal-header"><h6 className="modal-title fw-bold">{editItem ? 'Edit' : 'Add'} Inventory</h6><button className="btn-close" onClick={() => setShowModal(false)}/></div>
                <div className="modal-body">
                  <div className="row g-2">
                    <div className="col-md-6 mb-2"><label className="form-label small">Partner</label><select className="form-select form-select-sm" value={form.partnerId} onChange={e => setForm({...form, partnerId: +e.target.value})}>{partners.map(p => <option key={p.partnerId} value={p.partnerId}>{p.name}</option>)}</select></div>
                    <div className="col-md-6 mb-2"><label className="form-label small">Type</label><select className="form-select form-select-sm" value={form.itemType} onChange={e => setForm({...form, itemType: e.target.value})}><option>FLIGHT</option><option>HOTEL</option><option>TRANSPORT</option></select></div>
                    <div className="col-12 mb-2"><label className="form-label small">Name</label><input className="form-control form-control-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/></div>
                    <div className="col-md-4 mb-2"><label className="form-label small">Price (₹)</label><input type="number" className="form-control form-control-sm" value={form.price} onChange={e => setForm({...form, price: e.target.value})}/></div>
                    <div className="col-md-4 mb-2"><label className="form-label small">Availability</label><input type="number" className="form-control form-control-sm" value={form.availability} onChange={e => setForm({...form, availability: e.target.value})}/></div>
                    <div className="col-md-4 mb-2"><label className="form-label small">Status</label><select className="form-select form-select-sm" value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option>AVAILABLE</option><option>BLOCKED</option><option>SOLD_OUT</option></select></div>
                    <div className="col-12 mb-2"><label className="form-label small">Details (JSON)</label><textarea className="form-control form-control-sm" rows={4} value={form.details} onChange={e => setForm({...form, details: e.target.value})}/></div>
                  </div>
                </div>
                <div className="modal-footer"><button className="btn btn-light btn-sm" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button></div>
              </div>
            </div>
          </div>
        </>
      )}
      <ConfirmDialog open={!!deleteTarget} title="Delete Inventory" message={`Delete "${deleteTarget?.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} confirmLabel="Delete" danger />
    </div>
  );
}

