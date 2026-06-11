import React from 'react';
import CrudPage from '../components/CrudPage';
import { TextField, NumberField, SelectField } from '../components/FormFields';

function NotificationsPage() {
  return (
    <CrudPage
      title="Notifications"
      resource="notifications"
      idField="notificationId"
      emptyForm={{ userId: '', message: '', category: '', status: '' }}
      columns={[
        { key: 'notificationId', label: 'ID' },
        { key: 'userId', label: 'User' },
        { key: 'message', label: 'Message' },
        { key: 'category', label: 'Category' },
        { key: 'status', label: 'Status' },
        { key: 'createdDate', label: 'Created' },
      ]}
      renderForm={(form, setForm) => (
        <>
          <NumberField label="User ID" value={form.userId} onChange={v => setForm({...form, userId: v})} required />
          <TextField label="Message" value={form.message} onChange={v => setForm({...form, message: v})} required />
          <SelectField label="Category" value={form.category} onChange={v => setForm({...form, category: v})}
                       options={['BOOKING','CANCELLATION','PAYMENT','COMPLIANCE','GENERAL','ALERT']} required />
          <SelectField label="Status" value={form.status} onChange={v => setForm({...form, status: v})}
                       options={['UNREAD','READ','ARCHIVED']} required />
        </>
      )}
    />
  );
}
export default NotificationsPage;
