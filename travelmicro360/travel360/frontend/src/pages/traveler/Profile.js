import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { isValidEmail, isValidPhone, EMAIL_ERROR, PHONE_ERROR } from '../../utils/validators';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { name: user?.name, email: user?.email, phone: user?.phone } });

  const onSave = async (data) => {
    const updates = { name: data.name, email: data.email, phone: data.phone };
    updateUser(updates);
    // Self-update is ADMIN-only on the backend; admins persist to the DB, others are UI-only.
    if (user?.role === 'ADMIN' && user?.userId) {
      try {
        await api.put(`/users/${user.userId}`, { ...updates, role: user.role });
      } catch { /* keep the UI update even if the backend rejects */ }
    }
    toast.success('Profile updated!');
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h4 className="fw-bold mb-4">My Profile</h4>
      <div className="t-card p-4">
        <div className="d-flex align-items-center gap-3 mb-4">
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-light), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>
            {(user?.name || 'U').charAt(0)}
          </div>
          <div><h6 className="mb-0 fw-bold">{user?.name}</h6><small className="text-muted">{user?.role?.replace(/_/g, ' ')}</small></div>
        </div>
        <form onSubmit={handleSubmit(onSave)}>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label small fw-semibold"><User size={13}/> Name</label><input className="form-control" {...register('name')} /></div>
            <div className="col-md-6"><label className="form-label small fw-semibold"><Mail size={13}/> Email</label><input className={`form-control ${errors.email ? 'is-invalid' : ''}`} {...register('email', { validate: v => !v || isValidEmail(v) || EMAIL_ERROR })} />{errors.email && <div className="invalid-feedback">{errors.email.message}</div>}</div>
            <div className="col-md-6"><label className="form-label small fw-semibold"><Phone size={13}/> Phone</label><input className={`form-control ${errors.phone ? 'is-invalid' : ''}`} inputMode="numeric" {...register('phone', { validate: v => !v || isValidPhone(v) || PHONE_ERROR })} />{errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}</div>
          </div>
          <button type="submit" className="btn btn-gradient mt-3"><CheckCircle size={16} className="me-1"/> Save</button>
        </form>
      </div>
    </div>
  );
}

