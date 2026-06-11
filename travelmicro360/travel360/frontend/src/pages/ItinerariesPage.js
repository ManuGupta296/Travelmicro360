import React from 'react';
import CrudPage from '../components/CrudPage';
import { TextField, NumberField, SelectField, DateField } from '../components/FormFields';

function ItinerariesPage() {
  return (
    <CrudPage
      title="Itineraries"
      resource="itineraries"
      idField="itineraryId"
      emptyForm={{ customerId: '', bookings: '', startDate: '', endDate: '', status: '' }}
      columns={[
        { key: 'itineraryId', label: 'ID' },
        { key: 'customerId', label: 'Customer' },
        { key: 'bookings', label: 'Bookings' },
        { key: 'startDate', label: 'Start' },
        { key: 'endDate', label: 'End' },
        { key: 'status', label: 'Status' },
      ]}
      renderForm={(form, setForm) => (
        <>
          <NumberField label="Customer ID" value={form.customerId} onChange={v => setForm({...form, customerId: v})} required />
          <TextField label="Bookings (comma-separated ids)" value={form.bookings} onChange={v => setForm({...form, bookings: v})} />
          <DateField label="Start Date" value={form.startDate} onChange={v => setForm({...form, startDate: v})} required />
          <DateField label="End Date" value={form.endDate} onChange={v => setForm({...form, endDate: v})} required />
          <SelectField label="Status" value={form.status} onChange={v => setForm({...form, status: v})}
                       options={['DRAFT','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED']} required />
        </>
      )}
    />
  );
}
export default ItinerariesPage;
