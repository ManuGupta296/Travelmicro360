import React from 'react';
import CrudPage from '../components/CrudPage';
import { TextField, NumberField, SelectField, DateField } from '../components/FormFields';

function BookingsPage() {
  return (
    <CrudPage
      title="Bookings"
      resource="bookings"
      idField="bookingId"
      emptyForm={{ customerId: '', partnerId: '', itemType: '', date: '', status: '', amount: 0 }}
      columns={[
        { key: 'bookingId', label: 'ID' },
        { key: 'customerId', label: 'Customer' },
        { key: 'partnerId', label: 'Partner' },
        { key: 'itemType', label: 'Type' },
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Status' },
        { key: 'amount', label: 'Amount' },
      ]}
      renderForm={(form, setForm) => (
        <>
          <NumberField label="Customer ID" value={form.customerId} onChange={v => setForm({...form, customerId: v})} required />
          <NumberField label="Partner ID" value={form.partnerId} onChange={v => setForm({...form, partnerId: v})} required />
          <TextField label="Item Type" value={form.itemType} onChange={v => setForm({...form, itemType: v})} required />
          <DateField label="Date" value={form.date} onChange={v => setForm({...form, date: v})} required />
          <SelectField label="Status" value={form.status} onChange={v => setForm({...form, status: v})}
                       options={['PENDING','CONFIRMED','CANCELLED','COMPLETED']} required />
          <NumberField label="Amount" value={form.amount} onChange={v => setForm({...form, amount: v})} required step="0.01" />
        </>
      )}
    />
  );
}
export default BookingsPage;
