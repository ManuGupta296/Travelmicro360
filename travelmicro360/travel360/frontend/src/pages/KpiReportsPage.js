import React from 'react';
import CrudPage from '../components/CrudPage';
import { TextField } from '../components/FormFields';

function KpiReportsPage() {
  return (
    <CrudPage
      title="KPI Reports"
      resource="kpi-reports"
      idField="reportId"
      emptyForm={{ scope: '', metrics: '' }}
      columns={[
        { key: 'reportId', label: 'ID' },
        { key: 'scope', label: 'Scope' },
        { key: 'metrics', label: 'Metrics' },
        { key: 'generatedDate', label: 'Generated' },
      ]}
      renderForm={(form, setForm) => (
        <>
          <TextField label="Scope" value={form.scope} onChange={v => setForm({...form, scope: v})} required />
          <TextField label="Metrics" value={form.metrics} onChange={v => setForm({...form, metrics: v})} />
        </>
      )}
    />
  );
}
export default KpiReportsPage;
