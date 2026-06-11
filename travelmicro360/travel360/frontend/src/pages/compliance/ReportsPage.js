import React, { useEffect, useState } from 'react';
import { Plus, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import DetailDrawer from '../../components/shared/DetailDrawer';

// Available metrics, auto-computed client-side from real booking data.
// (GET /bookings is open to any authenticated user.)
const METRIC_DEFS = [
  { key: 'totalBookings',     label: 'Total Bookings',     compute: b => b.length },
  { key: 'confirmedBookings', label: 'Confirmed Bookings', compute: b => b.filter(x => x.status === 'CONFIRMED').length },
  { key: 'cancellations',     label: 'Cancellations',      compute: b => b.filter(x => x.status === 'CANCELLED').length },
  { key: 'cancellationRate',  label: 'Cancellation Rate',  compute: b => b.length ? `${((b.filter(x => x.status === 'CANCELLED').length / b.length) * 100).toFixed(1)}%` : '0%' },
  { key: 'totalSpend',        label: 'Total Spend',        compute: b => b.filter(x => x.status !== 'CANCELLED').reduce((s, x) => s + (Number(x.amount) || 0), 0) },
  { key: 'spendPerTraveler',  label: 'Spend Per Traveler', compute: b => {
      const active = b.filter(x => x.status !== 'CANCELLED');
      const spend = active.reduce((s, x) => s + (Number(x.amount) || 0), 0);
      const travelers = new Set(active.map(x => x.customerId)).size;
      return travelers ? Math.round(spend / travelers) : 0;
    } },
];

const csvEscape = (val) => {
  const s = String(val ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Metrics are stored as a readable "Label: value | Label: value" string.
// Older rows may be stored as JSON — normalise both into [label, value] pairs.
const metricPairs = (raw) => {
  if (!raw) return [];
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object') return Object.entries(obj);
  } catch { /* not JSON — treat as readable text below */ }
  return raw.split('|').map(s => s.trim()).filter(Boolean).map(part => {
    const i = part.indexOf(':');
    return i === -1 ? [part, ''] : [part.slice(0, i).trim(), part.slice(i + 1).trim()];
  });
};

const formatMetrics = (raw) => {
  const pairs = metricPairs(raw);
  if (pairs.length === 0) return raw || '—';
  return pairs.map(([k, v]) => (v === '' ? k : `${k}: ${v}`)).join(' • ');
};

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [scope, setScope] = useState('MONTHLY');
  const [chosen, setChosen] = useState({});                 // metricKey -> bool
  const [bookings, setBookings] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); api.get('/compliance-reports?page=0&size=500').then(r => setReports((r.data.content || r.data || []).sort((a, b) => new Date(b.createdAt || b.generatedDate || 0) - new Date(a.createdAt || a.generatedDate || 0)))).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openModal = async () => {
    setScope('MONTHLY');
    setChosen({});
    setShowModal(true);
    setDataLoading(true);
    try {
      const r = await api.get('/bookings?size=500');
      setBookings(r.data.content || r.data || []);
    } catch { setBookings([]); }
    setDataLoading(false);
  };

  const toggle = (key) => setChosen(prev => ({ ...prev, [key]: !prev[key] }));

  const handleCreate = async () => {
    const picks = METRIC_DEFS.filter(d => chosen[d.key]);
    if (picks.length === 0) { toast.error('Select at least one metric'); return; }
    const metrics = picks.map(d => `${d.label}: ${d.compute(bookings)}`).join(' | ');
    setSaving(true);
    try {
      await api.post('/compliance-reports', { scope, metrics });
      toast.success('Report generated');
      setShowModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const downloadCsv = (row) => {
    const rows = [
      ['Field', 'Value'],
      ['Report ID', row.reportId],
      ['Scope', row.scope ?? ''],
      ['Generated Date', row.generatedDate || row.createdAt?.split('T')[0] || ''],
    ];
    metricPairs(row.metrics).forEach(([k, v]) => rows.push([k, v]));
    const csv = rows.map(r => r.map(csvEscape).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${row.reportId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'reportId', label: 'ID', accessor: 'reportId' },
    { key: 'scope', label: 'Scope', accessor: 'scope' },
    { key: 'metrics', label: 'Metrics', sortable: false, render: r => (
      <div style={{ maxWidth: 360, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
        {formatMetrics(r.metrics)}
      </div>
    ) },
    { key: 'generatedDate', label: 'Date', render: r => r.generatedDate || r.createdAt?.split('T')[0] || '—' },
  ];

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold mb-0">Compliance Reports</h4>
        <button className="btn btn-accent btn-sm d-flex align-items-center gap-1" onClick={openModal}><Plus size={14}/> Generate Report</button>
      </div>
      <div className="t-card p-3">
        <DataTable
          columns={columns}
          data={reports}
          loading={loading}
          onRowClick={setSelected}
          actions={row => (
            <button className="btn btn-sm btn-light d-flex align-items-center gap-1" onClick={() => downloadCsv(row)}>
              <Download size={13}/> CSV
            </button>
          )}
        />
      </div>

      <DetailDrawer open={!!selected} onClose={() => setSelected(null)} title={`Report #${selected?.reportId}`}>
        {selected && (
          <div>
            <p><strong>Scope:</strong> {selected.scope}</p>
            <p className="mb-1"><strong>Metrics:</strong></p>
            <ul className="small ps-3 mb-3">
              {metricPairs(selected.metrics).length === 0
                ? <li className="text-muted">—</li>
                : metricPairs(selected.metrics).map(([k, v], i) => (
                    <li key={i}>{k}{v === '' ? '' : `: ${v}`}</li>
                  ))}
            </ul>
            <p><strong>Date:</strong> {selected.generatedDate || '—'}</p>
          </div>
        )}
      </DetailDrawer>

      {showModal && (
        <>
          <div className="modal-backdrop show" style={{zIndex:1050}} onClick={() => setShowModal(false)}/>
          <div className="modal show d-block" style={{zIndex:1055}}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
              <div className="modal-content border-0 shadow">
                <div className="modal-header"><h6 className="modal-title fw-bold">Generate Report</h6><button className="btn-close" onClick={() => setShowModal(false)}/></div>
                <div className="modal-body">
                  <div className="mb-3"><label className="form-label small">Scope</label><select className="form-select form-select-sm" value={scope} onChange={e => setScope(e.target.value)}><option>MONTHLY</option><option>QUARTERLY</option><option>ANNUAL</option><option>AD_HOC</option></select></div>
                  <label className="form-label small">Metrics {dataLoading && <span className="text-muted">(loading data…)</span>}</label>
                  <div className="border rounded p-2">
                    {METRIC_DEFS.map(def => (
                      <div key={def.key} className="form-check">
                        <input className="form-check-input" type="checkbox" id={`m-${def.key}`}
                          checked={!!chosen[def.key]} disabled={dataLoading}
                          onChange={() => toggle(def.key)} />
                        <label className="form-check-label small d-flex justify-content-between gap-2" htmlFor={`m-${def.key}`} style={{width:'100%'}}>
                          <span>{def.label}</span>
                          {!dataLoading && <span className="text-muted">{String(def.compute(bookings))}</span>}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-footer"><button className="btn btn-light btn-sm" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={handleCreate} disabled={saving || dataLoading}>{saving ? 'Generating…' : 'Generate'}</button></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
