import React, { useState, useRef, useEffect } from 'react';

export default function Autocomplete({ items = [], value, onChange, placeholder, icon }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const ref = useRef();

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = items.filter(i =>
    i.label.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 15);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    onChange({ label: val, value: val });
  };

  const handleBlur = () => {
    const match = items.find(i => i.label.toLowerCase() === query.toLowerCase());
    if (match) onChange(match);
  };

  return (
    <div className="position-relative" ref={ref}>
      <div className="input-group">
        {icon && <span className="input-group-text bg-transparent border-end-0">{icon}</span>}
        <input
          className={`form-control ${icon ? 'border-start-0' : ''}`}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          aria-label={placeholder}
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="autocomplete-dropdown">
          {filtered.map((item, i) => (
            <div
              key={i}
              className="autocomplete-item"
              onClick={() => { setQuery(item.label); onChange(item); setOpen(false); }}
            >
              <div className="fw-semibold">{item.label}</div>
              {item.sub && <small className="text-muted">{item.sub}</small>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

