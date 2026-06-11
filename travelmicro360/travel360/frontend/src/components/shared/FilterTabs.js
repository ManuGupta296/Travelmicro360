import React from 'react';

export default function FilterTabs({ tabs = [], active, onChange }) {
  return (
    <div className="d-flex flex-wrap gap-2 mb-3">
      {tabs.map(t => {
        const key = typeof t === 'string' ? t : t.key;
        const label = typeof t === 'string' ? t : t.label;
        const count = typeof t === 'object' ? t.count : undefined;
        return (
          <button key={key}
            className={`btn btn-sm ${active === key ? 'btn-gradient' : 'btn-light'}`}
            style={{ borderRadius: 20, fontSize: '0.8rem' }}
            onClick={() => onChange(key)}>
            {label} {count !== undefined && <span className="badge bg-white text-dark ms-1">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

