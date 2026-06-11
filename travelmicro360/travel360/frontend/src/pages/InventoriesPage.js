import React from 'react';
import CrudPage from '../components/CrudPage';
import { TextField, NumberField, SelectField } from '../components/FormFields';

function InventoriesPage() {
  return (
    <CrudPage
      title="Inventories"
      resource="inventories"
      idField="inventoryId"
      emptyForm={{ partnerId: '', itemType: '', availability: 0, status: '' }}
      columns={[
        { key: 'inventoryId', label: 'ID' },
        { key: 'partnerId', label: 'Partner ID' },
        { key: 'itemType', label: 'Item Type' },
        { key: 'availability', label: 'Availability' },
        { key: 'status', label: 'Status' },
      ]}
      renderForm={(form, setForm) => (
        <>
          <NumberField label="Partner ID" value={form.partnerId} onChange={v => setForm({...form, partnerId: v})} required />
          <TextField label="Item Type" value={form.itemType} onChange={v => setForm({...form, itemType: v})} required />
          <NumberField label="Availability" value={form.availability} onChange={v => setForm({...form, availability: v})} required />
          <SelectField label="Status" value={form.status} onChange={v => setForm({...form, status: v})}
                       options={['AVAILABLE','BLOCKED','SOLD_OUT']} required />
        </>
      )}
    />
  );
}
export default InventoriesPage;
