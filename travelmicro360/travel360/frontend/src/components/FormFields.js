import React from 'react';

export function TextField({ label, value, onChange, required, type = 'text', placeholder }) {
  return (
    <div className="mb-2">
      <label className="form-label">{label}{required && ' *'}</label>
      <input type={type} className="form-control" value={value ?? ''} placeholder={placeholder}
             onChange={e => onChange(e.target.value)} required={required} />
    </div>
  );
}

export function NumberField({ label, value, onChange, required, step = 'any' }) {
  return (
    <div className="mb-2">
      <label className="form-label">{label}{required && ' *'}</label>
      <input type="number" step={step} className="form-control" value={value ?? ''}
             onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))} required={required} />
    </div>
  );
}

export function SelectField({ label, value, onChange, options, required }) {
  return (
    <div className="mb-2">
      <label className="form-label">{label}{required && ' *'}</label>
      <select className="form-select" value={value ?? ''}
              onChange={e => onChange(e.target.value)} required={required}>
        <option value="">-- select --</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function DateField({ label, value, onChange, required }) {
  return (
    <div className="mb-2">
      <label className="form-label">{label}{required && ' *'}</label>
      <input type="date" className="form-control" value={value ?? ''}
             onChange={e => onChange(e.target.value)} required={required} />
    </div>
  );
}
