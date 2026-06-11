import React from 'react';
import CrudPage from '../components/CrudPage';
import { NumberField, SelectField, DateField } from '../components/FormFields';

function InvoicesPage() {
  return (
    <CrudPage
      title="Invoices"
      resource="invoices"
      idField="invoiceId"
      emptyForm={{ bookingId: '', amount: 0, date: '', status: '' }}
      columns={[
        { key: 'invoiceId', label: 'ID' },
        { key: 'bookingId', label: 'Booking' },
        { key: 'amount', label: 'Amount' },
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Status' },
      ]}
      renderForm={(form, setForm) => (
        <>
          <NumberField label="Booking ID" value={form.bookingId} onChange={v => setForm({...form, bookingId: v})} required />
          <NumberField label="Amount" value={form.amount} onChange={v => setForm({...form, amount: v})} required step="0.01" />
          <DateField label="Date" value={form.date} onChange={v => setForm({...form, date: v})} required />
          <SelectField label="Status" value={form.status} onChange={v => setForm({...form, status: v})}
                       options={['PENDING','PAID','OVERDUE','CANCELLED','REFUNDED']} required />
        </>
      )}
    />
  );
}
export default InvoicesPage;
