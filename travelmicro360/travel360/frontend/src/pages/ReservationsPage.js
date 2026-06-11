import React from 'react';
import CrudPage from '../components/CrudPage';
import { TextField, NumberField, SelectField, DateField } from '../components/FormFields';

function ReservationsPage() {
  return (
    <CrudPage
      title="Reservations"
      resource="reservations"
      idField="reservationId"
      emptyForm={{ bookingId: '', details: '', startDate: '', endDate: '', status: '' }}
      columns={[
        { key: 'reservationId', label: 'ID' },
        { key: 'bookingId', label: 'Booking' },
        { key: 'details', label: 'Details' },
        { key: 'startDate', label: 'Start' },
        { key: 'endDate', label: 'End' },
        { key: 'status', label: 'Status' },
      ]}
      renderForm={(form, setForm) => (
        <>
          <NumberField label="Booking ID" value={form.bookingId} onChange={v => setForm({...form, bookingId: v})} required />
          <TextField label="Details" value={form.details} onChange={v => setForm({...form, details: v})} required />
          <DateField label="Start Date" value={form.startDate} onChange={v => setForm({...form, startDate: v})} required />
          <DateField label="End Date" value={form.endDate} onChange={v => setForm({...form, endDate: v})} required />
          <SelectField label="Status" value={form.status} onChange={v => setForm({...form, status: v})}
                       options={['ACTIVE','CANCELLED','COMPLETED']} required />
        </>
      )}
    />
  );
}
export default ReservationsPage;
