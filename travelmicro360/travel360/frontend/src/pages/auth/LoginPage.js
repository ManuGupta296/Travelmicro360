import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, Globe, User, Briefcase, Building2, Wallet, ShieldCheck, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DEMO_ACCOUNTS = [
  { email: 'traveler@cognizant.com',           label: 'Traveler' },
  { email: 'agent@independent.com',            label: 'Agent' },
  { email: 'corporate.cognizant@cognizant.com', label: 'Corporate' },
  { email: 'finance@cognizant.com',            label: 'Finance' },
  { email: 'compliance@cognizant.com',         label: 'Compliance' },
  { email: 'admin@cognizant.com',              label: 'Admin' },
];

// Per-role icon + accent for the demo chips (display only — does not affect login).
const ROLE_META = {
  Traveler:   { Icon: User,        accent: '#1B6CA8', soft: '#eaf3f9' },
  Agent:      { Icon: Briefcase,   accent: '#0e7490', soft: '#e6f4f6' },
  Corporate:  { Icon: Building2,   accent: '#7c3aed', soft: '#f1ebfb' },
  Finance:    { Icon: Wallet,      accent: '#d97706', soft: '#fcf2e3' },
  Compliance: { Icon: ShieldCheck, accent: '#059669', soft: '#e6f6ef' },
  Admin:      { Icon: Settings,    accent: '#475569', soft: '#eef1f5' },
};

const STYLES = `
.t360-brand {
  position: relative;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(120% 120% at 12% 8%, rgba(27,108,168,0.45) 0%, rgba(27,108,168,0) 46%),
    radial-gradient(110% 110% at 92% 96%, rgba(19,49,92,0.6) 0%, rgba(19,49,92,0) 52%),
    linear-gradient(158deg, #0B2545 0%, #13315C 52%, #1B6CA8 120%);
}
.t360-brand__routes {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.16;
  pointer-events: none;
}
.t360-brand__inner {
  position: relative;
  z-index: 1;
  max-width: 440px;
  padding: 3rem;
}
.t360-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 15px;
  color: #fff;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.18);
  margin-bottom: 1.4rem;
}
.t360-wordmark {
  color: #fff;
  font-weight: 700;
  font-size: 2.6rem;
  letter-spacing: -0.025em;
  margin: 0 0 0.6rem;
}
.t360-tagline {
  color: rgba(255,255,255,0.82);
  font-size: 1.06rem;
  font-weight: 400;
  margin: 0;
  letter-spacing: 0.01em;
}

.t360-card {
  max-width: 420px;
  width: 100%;
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 16px;
  padding: 2.5rem 2.25rem;
  box-shadow: 0 10px 30px -12px rgba(11,37,69,0.18), 0 2px 6px -2px rgba(11,37,69,0.08);
}
.t360-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.4rem;
}
.t360-field {
  position: relative;
}
.t360-field__icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}
.t360-input {
  width: 100%;
  padding: 0.7rem 0.85rem 0.7rem 2.55rem;
  font-size: 0.92rem;
  color: #0f172a;
  background: #fff;
  border: 1px solid #d6dee8;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.t360-input::placeholder { color: #9aa7b5; }
.t360-input:focus {
  border-color: #1B6CA8;
  box-shadow: 0 0 0 3px rgba(27,108,168,0.15);
}
.t360-input--error { border-color: #dc2626; }
.t360-input--error:focus { box-shadow: 0 0 0 3px rgba(220,38,38,0.15); }
.t360-input--pwd { padding-right: 2.9rem; }
.t360-toggle {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 0.35rem;
  border-radius: 7px;
  cursor: pointer;
  transition: color 0.15s, background-color 0.15s;
}
.t360-toggle:hover { color: #475569; background: #f1f5f9; }
.t360-error {
  color: #dc2626;
  font-size: 0.78rem;
  margin-top: 0.35rem;
}
.t360-submit {
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.75rem 1rem;
  background: #1B6CA8;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 16px -8px rgba(27,108,168,0.7);
  transition: background-color 0.15s, transform 0.05s, box-shadow 0.15s;
}
.t360-submit:hover:not(:disabled) { background: #13315C; }
.t360-submit:active:not(:disabled) { transform: translateY(1px); }
.t360-submit:disabled {
  background: #9bbdd6;
  cursor: not-allowed;
  box-shadow: none;
}
.t360-demo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.t360-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  background: #fff;
  border: 1px solid #e8edf3;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.65rem 0.4rem;
  border-radius: 11px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background-color 0.15s, box-shadow 0.15s, transform 0.05s;
}
.t360-demo__ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
}
.t360-demo:hover {
  border-color: var(--accent, #1B6CA8);
  color: var(--accent, #1B6CA8);
  box-shadow: 0 5px 14px -7px var(--accent, rgba(27,108,168,0.5));
  transform: translateY(-1px);
}
`;

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const user = await login(data.email, data.password);
    if (user) {
      const { ROLE_HOME } = await import('../../context/AuthContext');
      navigate(ROLE_HOME[user.role] || '/traveler/home');
    }
  };

  const fillDemo = async (email) => {
    setValue('email', email);
    setValue('password', 'demo123');
    const user = await login(email, 'demo123');
    if (user) {
      const { ROLE_HOME } = await import('../../context/AuthContext');
      navigate(ROLE_HOME[user.role] || '/traveler/home');
    }
  };

  return (
    <div className="row g-0" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <style>{STYLES}</style>

      {/* Left panel — brand */}
      <div className="col-lg-6 d-none d-lg-flex t360-brand">
        <svg
          className="t360-brand__routes"
          viewBox="0 0 400 600"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M-20 480 C 120 380, 180 300, 420 120" stroke="#fff" strokeWidth="1.5" strokeDasharray="2 8" strokeLinecap="round" />
          <path d="M-20 560 C 160 460, 260 360, 440 220" stroke="#fff" strokeWidth="1" strokeDasharray="2 10" strokeLinecap="round" opacity="0.6" />
          <circle cx="112" cy="392" r="3" fill="#fff" />
          <circle cx="300" cy="206" r="3" fill="#fff" />
        </svg>

        <div className="t360-brand__inner">
          <span className="t360-logo">
            <Globe size={26} strokeWidth={2} />
          </span>
          <h1 className="t360-wordmark">Travel360</h1>
          <p className="t360-tagline">One platform. Every journey.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div
        className="col-lg-6 d-flex align-items-center justify-content-center"
        style={{ padding: '2rem 1.5rem' }}
      >
        <div className="t360-card">
          <div style={{ marginBottom: '1.75rem' }}>
            <h2
              style={{
                fontWeight: 700,
                fontSize: '1.6rem',
                color: '#0B2545',
                marginBottom: '0.3rem',
                letterSpacing: '-0.01em',
              }}
            >
              Sign in
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
              Access your Travel360 account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={{ marginBottom: '1rem' }}>
              <label className="t360-label">Email</label>
              <div className="t360-field">
                <Mail size={18} className="t360-field__icon" />
                <input
                  type="email"
                  className={`t360-input${errors.email ? ' t360-input--error' : ''}`}
                  placeholder="name@company.com"
                  autoComplete="email"
                  {...register('email', { required: 'Email is required' })}
                />
              </div>
              {errors.email && <div className="t360-error">{errors.email.message}</div>}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="t360-label">Password</label>
              <div className="t360-field">
                <Lock size={18} className="t360-field__icon" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  className={`t360-input t360-input--pwd${errors.password ? ' t360-input--error' : ''}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="t360-toggle"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <div className="t360-error">{errors.password.message}</div>}
            </div>

            <button type="submit" disabled={loading} className="t360-submit">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Quick demo login */}
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #eef2f7',
            }}
          >
            <div className="t360-demo-grid">
              {DEMO_ACCOUNTS.map((d) => {
                const meta = ROLE_META[d.label] || { Icon: User, accent: '#1B6CA8', soft: '#eaf3f9' };
                const { Icon } = meta;
                return (
                  <button
                    key={d.email}
                    type="button"
                    onClick={() => fillDemo(d.email)}
                    className="t360-demo"
                    style={{ '--accent': meta.accent }}
                  >
                    <span className="t360-demo__ico" style={{ background: meta.soft, color: meta.accent }}>
                      <Icon size={16} strokeWidth={2} />
                    </span>
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              marginTop: '1.75rem',
              textAlign: 'center',
              fontSize: '0.82rem',
              color: '#64748b',
            }}
          >
            New to Travel360?{' '}
            <a
              href="/signup"
              style={{ color: '#1B6CA8', fontWeight: 600, textDecoration: 'none' }}
            >
              Create an account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
