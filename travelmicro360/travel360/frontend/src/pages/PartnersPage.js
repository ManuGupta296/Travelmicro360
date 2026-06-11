import React from 'react';
import CrudPage from '../components/CrudPage';
import { TextField, SelectField } from '../components/FormFields';

function PartnersPage() {
  return (
    <CrudPage
      title="Partners"
      resource="partners"
      idField="partnerId"
      emptyForm={{ name: '', type: '', status: '' }}
      columns={[
        { key: 'partnerId', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'type', label: 'Type' },
        { key: 'status', label: 'Status' },
      ]}
      renderForm={(form, setForm) => (
        <>
          <TextField label="Name" value={form.name} onChange={v => setForm({...form, name: v})} required />
          <SelectField label="Type" value={form.type} onChange={v => setForm({...form, type: v})}
                       options={['AIRLINE','HOTEL','TRANSPORT']} required />
          <SelectField label="Status" value={form.status} onChange={v => setForm({...form, status: v})}
                       options={['ACTIVE','INACTIVE','SUSPENDED']} required />
        </>
      )}
    />
  );
}
export default PartnersPage;
