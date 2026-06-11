import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';
import api from '../../services/api';
import { ROLE_HOME, useAuth } from '../../context/AuthContext';
import { isValidEmail, isValidPhone, EMAIL_ERROR, PHONE_ERROR } from '../../utils/validators';

const ROLES = ['TRAVELER', 'TRAVEL_AGENT', 'CORPORATE_MANAGER', 'FINANCE_OFFICER', 'COMPLIANCE_OFFICER', 'ADMIN'];
const STRONG_PWD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// Password rules (the last one is optional but boosts strength).
const PWD_RULES = [
  { key: 'length', label: '8+ characters', test: v => v.length >= 8 },
  { key: 'upper', label: 'Uppercase', test: v => /[A-Z]/.test(v) },
  { key: 'lower', label: 'Lowercase', test: v => /[a-z]/.test(v) },
  { key: 'number', label: 'Number', test: v => /\d/.test(v) },
  { key: 'special', label: 'Special char', test: v => /[^A-Za-z0-9]/.test(v) },
];

// Pure, reusable strength calculator → { score, label, color, pct, checks }.
export function calculatePasswordStrength(pwd = '') {
  const checks = PWD_RULES.map(r => ({ key: r.key, label: r.label, passed: !!pwd && r.test(pwd) }));
  const score = checks.filter(c => c.passed).length;
  const LEVELS = {
    0: { label: '', color: '#e5e7eb' },
    1: { label: 'Weak', color: '#ef4444' },
    2: { label: 'Weak', color: '#ef4444' },
    3: { label: 'Medium', color: '#f59e0b' },
    4: { label: 'Strong', color: '#10b981' },
    5: { label: 'Very Strong', color: '#059669' },
  };
  const lvl = LEVELS[score] || LEVELS[0];
  return { score, label: lvl.label, color: lvl.color, pct: (score / PWD_RULES.length) * 100, checks };
}

// Strength bar + label + checklist hints. Renders nothing until the user starts typing.
function PasswordStrength({ value }) {
  if (!value) return null;
  const { label, color, pct, checks } = calculatePasswordStrength(value);
  return (
    <div className="mt-2">
      <div style={{ height: 5, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width 0.25s ease' }} />
      </div>
      <small className="fw-semibold" style={{ color }}>{label} password</small>
      <div className="d-flex flex-wrap gap-2 mt-1">
        {checks.map(c => (
          <span key={c.key} className="small" style={{ color: c.passed ? '#10b981' : '#9ca3af' }}>
            {c.passed ? '✔' : '○'} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [managers, setManagers] = useState([]);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const selectedRole = watch('role');
  const selectedCompanyId = watch('companyId');
  const showCompany = ['TRAVELER', 'CORPORATE_MANAGER'].includes(selectedRole);

  // Live password value (react-hook-form's reactive watcher) — drives the strength indicator.
  const pwd = watch('password') || '';

  useEffect(() => {
    axios.get('http://localhost:9090/api/v1/companies')
      .then(r => setCompanies(r.data.content || r.data || []))
      .catch(err => { console.error('Failed to load companies:', err); setCompanies([]); });
  }, []);

  // Load the selected company's reporting managers (travelers only). Optional field.
  useEffect(() => {
    if (selectedRole !== 'TRAVELER' || !selectedCompanyId) { setManagers([]); return; }
    const company = companies.find(c => String(c.companyId) === String(selectedCompanyId));
    if (!company?.name) { setManagers([]); return; }
    axios.get(`http://localhost:9090/api/v1/auth/managers?companyName=${encodeURIComponent(company.name)}`)
      .then(r => setManagers(r.data || []))
      .catch(() => setManagers([]));
  }, [selectedRole, selectedCompanyId, companies]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        password: data.password,
        companyId: data.companyId ? Number(data.companyId) : null,
        managerEmail: data.managerEmail || null,
      });
      // Route through AuthContext.login so user state populates and the welcome toast fires.
      const user = await login(data.email, data.password);
      if (user) {
        navigate(ROLE_HOME[user.role] || '/traveler/home');
      } else {
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 480, width: '100%' }} className="p-3">
        <div className="t-card p-4 p-md-5">
          <div className="text-center mb-4">
            <h4 className="fw-bold mb-1">Create your account</h4>
            <p className="text-muted small">Join Travel360 — your enterprise travel platform</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small fw-semibold">Full Name</label>
                <input className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="Enter your full name"
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })} />
                {errors.name && <div className="text-danger small mt-1">{errors.name.message}</div>}
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Email</label>
                <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="Enter your email address"
                  {...register('email', { required: 'Email is required', validate: v => isValidEmail(v) || EMAIL_ERROR })} />
                {errors.email && <div className="text-danger small mt-1">{errors.email.message}</div>}
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Phone</label>
                <div className="input-group has-validation">
                  <span className="input-group-text">+91</span>
                  <input className={`form-control ${errors.phone ? 'is-invalid' : ''}`} inputMode="numeric" maxLength={10}
                    placeholder="Enter your mobile number"
                    {...register('phone', { required: 'Phone is required', validate: v => isValidPhone(v) || PHONE_ERROR })} />
                </div>
                {errors.phone && <div className="text-danger small mt-1">{errors.phone.message}</div>}
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Role</label>
                <select className={`form-select ${errors.role ? 'is-invalid' : ''}`}
                  defaultValue="" {...register('role', { required: 'Please select a role' })}>
                  <option value="" disabled>— Select role —</option>
                  {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                </select>
                {errors.role && <div className="text-danger small mt-1">{errors.role.message}</div>}
              </div>
              {showCompany && (
                <div className="col-12">
                  <label className="form-label small fw-semibold">Company</label>
                  <select className={`form-select ${errors.companyId ? 'is-invalid' : ''}`}
                    {...register('companyId', { required: selectedRole === 'CORPORATE_MANAGER' ? 'Company is required for Corporate Manager' : false })}>
                    <option value="">-- Select your company --</option>
                    {[...companies].sort((a,b) => (a.name||'').localeCompare(b.name||'')).map(c => <option key={c.companyId} value={c.companyId}>{c.name}</option>)}
                  </select>
                  {selectedRole === 'CORPORATE_MANAGER' && <small className="text-muted">Your team will be linked to this company.</small>}
                  {errors.companyId && <div className="text-danger small mt-1">{errors.companyId.message}</div>}
                </div>
              )}
              {selectedRole === 'TRAVELER' && selectedCompanyId && (
                <div className="col-12">
                  <label className="form-label small fw-semibold">Reporting Manager <span className="text-muted fw-normal">(optional)</span></label>
                  <select className="form-select" {...register('managerEmail')}>
                    <option value="">— None (use company default) —</option>
                    {managers.map(m => <option key={m.email} value={m.email}>{m.name} ({m.email})</option>)}
                  </select>
                  {managers.length === 0 && <small className="text-muted">No managers listed for this company yet.</small>}
                </div>
              )}
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Password</label>
                <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Create a password"
                  {...register('password', { required: 'Password is required', validate: v => STRONG_PWD.test(v) || 'Min 8 chars with uppercase, lowercase & a number' })} />
                <PasswordStrength value={pwd} />
                {errors.password && <div className="text-danger small mt-1">{errors.password.message}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Confirm Password</label>
                <input type="password" className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="Re-enter your password"
                  {...register('confirmPassword', { required: 'Confirm your password', validate: v => v === watch('password') || 'Passwords do not match' })} />
                {errors.confirmPassword && <div className="text-danger small mt-1">{errors.confirmPassword.message}</div>}
              </div>
            </div>
            <button type="submit" className="btn btn-gradient w-100 py-2 mt-4" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-1"/> : null}
              Create Account
            </button>
          </form>
          <div className="text-center mt-3">
            <small className="text-muted">Already have an account? <a href="/login" className="fw-semibold">Sign in</a></small>
          </div>
        </div>
      </div>
    </div>
  );
}
