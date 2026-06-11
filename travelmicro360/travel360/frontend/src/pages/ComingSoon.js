import React from 'react';
import { useLocation } from 'react-router-dom';

export default function ComingSoon() {
  const { pathname } = useLocation();
  return (
    <div className="text-center py-5">
      <div style={{ fontSize: '4rem', opacity: 0.3 }}>🚧</div>
      <h4 className="fw-bold mt-3">Coming Soon</h4>
      <p className="text-muted">The <code>{pathname}</code> page is under development.</p>
    </div>
  );
}

