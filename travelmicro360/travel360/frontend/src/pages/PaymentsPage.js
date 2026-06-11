import React from 'react';
import CrudPage from '../components/CrudPage';
import { NumberField, SelectField, DateField } from '../components/FormFields';

function PaymentsPage() {
  return (
    <CrudPage
      title="Payments"
      resource="payments"
      idField="paymentId"
      emptyForm={{ invoiceId: '', amount: 0, date: '', method: '', status: '' }}
      columns={[
        { key: 'paymentId', label: 'ID' },
        { key: 'invoiceId', label: 'Invoice' },
        { key: 'amount', label: 'Amount' },
        { key: 'date', label: 'Date' },
        { key: 'method', label: 'Method' },
        { key: 'status', label: 'Status' },
      ]}
      renderForm={(form, setForm) => (
        <>
          <NumberField label="Invoice ID" value={form.invoiceId} onChange={v => setForm({...form, invoiceId: v})} required />
          <NumberField label="Amount" value={form.amount} onChange={v => setForm({...form, amount: v})} required step="0.01" />
          <DateField label="Date" value={form.date} onChange={v => setForm({...form, date: v})} required />
          <SelectField label="Method" value={form.method} onChange={v => setForm({...form, method: v})}
                       options={['CREDIT_CARD','DEBIT_CARD','NET_BANKING','UPI','WALLET','CASH']} required />
          <SelectField label="Status" value={form.status} onChange={v => setForm({...form, status: v})}
                       options={['INITIATED','SUCCESS','FAILED','REFUNDED']} required />
        </>
      )}
    />
  );
}
export default PaymentsPage;
