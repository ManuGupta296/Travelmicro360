import React from 'react';
import CrudPage from '../components/CrudPage';
import { TextField } from '../components/FormFields';

function ComplianceReportsPage() {
  return (
    <CrudPage
      title="Compliance Reports"
      resource="compliance-reports"
      idField="reportId"
      emptyForm={{ scope: '', metrics: '' }}
      columns={[
        { key: 'reportId', label: 'ID' },
        { key: 'scope', label: 'Scope' },
        { key: 'metrics', label: 'Metrics', render: (item) => (
          <div style={{ maxWidth: 360, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {String(item.metrics ?? '')}
          </div>
        ) },
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
export default ComplianceReportsPage;
