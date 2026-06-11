import React from 'react';
import CrudPage from '../components/CrudPage';
import { TextField, SelectField } from '../components/FormFields';

const ROLES = ['TRAVELER','TRAVEL_AGENT','CORPORATE_MANAGER','FINANCE_OFFICER','COMPLIANCE_OFFICER','ADMIN'];

function UsersPage() {
  return (
    <CrudPage
      title="Users"
      resource="users"
      idField="userId"
      emptyForm={{ name: '', role: '', email: '', phone: '' }}
      columns={[
        { key: 'userId', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'role', label: 'Role' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
      ]}
      renderForm={(form, setForm) => (
        <>
          <TextField label="Name" value={form.name} onChange={v => setForm({...form, name: v})} required />
          <SelectField label="Role" value={form.role} onChange={v => setForm({...form, role: v})} options={ROLES} required />
          <TextField label="Email" type="email" value={form.email} onChange={v => setForm({...form, email: v})} required />
          <TextField label="Phone" value={form.phone} onChange={v => setForm({...form, phone: v})} />
        </>
      )}
    />
  );
}
export default UsersPage;
