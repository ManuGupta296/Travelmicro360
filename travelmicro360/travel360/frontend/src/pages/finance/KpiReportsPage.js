import React, { useEffect, useState } from 'react';
import { Plus, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';

// KPI metrics, auto-computed client-side from real booking data. Each selected
// metric is saved as its own kpi-report record, matching the backend contract:
// POST /kpi-reports { metricName, metricValue (Double), period, reportDate }.
const METRIC_DEFS = [
  { key: 'bookingVolume',    name: 'Booking Volume',     compute: b => b.length },
  { key: 'cancellationRate', name: 'Cancellation Rate',  compute: b => b.length ? Number(((b.filter(x => x.status === 'CANCELLED').length / b.length) * 100).toFixed(1)) : 0 },
  { key: 'totalSpend',       name: 'Total Spend',        compute: b => b.filter(x => x.status === 'CONFIRMED').reduce((s, x) => s + (Number(x.amount) || 0), 0) },
  { key: 'spendPerTraveler', name: 'Spend Per Traveler', compute: b => {
      const confirmed = b.filter(x => x.status === 'CONFIRMED');
      const spend = confirmed.reduce((s, x) => s + (Number(x.amount) || 0), 0);
      const travelers = new Set(confirmed.map(x => x.customerId)).size;
      return travelers ? Math.round(spend / travelers) : 0;
    } },
];

const csvEscape = (val) => {
  const s = String(val ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export default function KpiReportsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [period, setPeriod] = useState('MONTHLY');
  const [chosen, setChosen] = useState({});
  const [bookings, setBookings] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); api.get('/kpi-reports?page=0&size=500').then(r => setRecords((r.data.content || r.data || []).sort((a, b) => new Date(b.createdAt || b.reportDate || 0) - new Date(a.createdAt || a.reportDate || 0)))).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openModal = async () => {
    setPeriod('MONTHLY');
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
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      await Promise.all(picks.map(d => api.post('/kpi-reports', {
        metricName: d.name,
        metricValue: d.compute(bookings),
        period,
        reportDate: today,
      })));
      toast.success(`${picks.length} KPI record(s) generated`);
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
      ['KPI ID', row.kpiId],
      ['Metric', row.metricName ?? ''],
      ['Value', row.metricValue ?? ''],
      ['Period', row.period ?? ''],
      ['Date', row.reportDate || row.createdAt?.split('T')[0] || ''],
    ];
    const csv = rows.map(r => r.map(csvEscape).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kpi-report-${row.kpiId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'kpiId', label: 'ID', accessor: 'kpiId' },
    { key: 'metricName', label: 'Metric', accessor: 'metricName' },
    { key: 'metricValue', label: 'Value', render: r => (r.metricValue ?? 0).toLocaleString() },
    { key: 'period', label: 'Period', accessor: 'period' },
    { key: 'reportDate', label: 'Date', render: r => r.reportDate || r.createdAt?.split('T')[0] || '—' },
  ];

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold mb-0">KPI Reports</h4>
        <button className="btn btn-accent btn-sm d-flex align-items-center gap-1" onClick={openModal}><Plus size={14}/> Generate Report</button>
      </div>
      <div className="t-card p-3">
        <DataTable
          columns={columns}
          data={records}
          loading={loading}
          actions={row => (
            <button className="btn btn-sm btn-light d-flex align-items-center gap-1" onClick={() => downloadCsv(row)}>
              <Download size={13}/> CSV
            </button>
          )}
        />
      </div>

      {showModal && (
        <>
          <div className="modal-backdrop show" style={{zIndex:1050}} onClick={() => setShowModal(false)}/>
          <div className="modal show d-block" style={{zIndex:1055}}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
              <div className="modal-content border-0 shadow">
                <div className="modal-header"><h6 className="modal-title fw-bold">Generate KPI Report</h6><button className="btn-close" onClick={() => setShowModal(false)}/></div>
                <div className="modal-body">
                  <div className="mb-3"><label className="form-label small">Period</label><select className="form-select form-select-sm" value={period} onChange={e => setPeriod(e.target.value)}><option>MONTHLY</option><option>QUARTERLY</option><option>ANNUAL</option><option>AD_HOC</option></select></div>
                  <label className="form-label small">Metrics {dataLoading && <span className="text-muted">(loading data…)</span>}</label>
                  <div className="border rounded p-2">
                    {METRIC_DEFS.map(def => (
                      <div key={def.key} className="form-check">
                        <input className="form-check-input" type="checkbox" id={`k-${def.key}`}
                          checked={!!chosen[def.key]} disabled={dataLoading}
                          onChange={() => toggle(def.key)} />
                        <label className="form-check-label small d-flex justify-content-between gap-2" htmlFor={`k-${def.key}`} style={{width:'100%'}}>
                          <span>{def.name}</span>
                          {!dataLoading && <span className="text-muted">{def.compute(bookings).toLocaleString()}</span>}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="form-text">Each selected metric is saved as a separate KPI record, computed live from current booking data.</div>
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
