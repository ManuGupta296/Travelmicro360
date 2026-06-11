import React from 'react';

const COLORS = {
  AVAILABLE: 'success', ACTIVE: 'success', CONFIRMED: 'success', PAID: 'success', SUCCESS: 'success',
  PENDING: 'warning', PROCESSING: 'warning', SENT: 'warning', DRAFT: 'secondary',
  CANCELLED: 'danger', FAILED: 'danger', OVERDUE: 'danger', SUSPENDED: 'danger', SOLD_OUT: 'danger', BLOCKED: 'danger',
  REFUNDED: 'info', INACTIVE: 'secondary',
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const color = COLORS[status.toUpperCase()] || 'secondary';
  return (
    <span className={`badge bg-${color}-subtle text-${color}`} style={{ fontSize: '0.7rem', borderRadius: 12, padding: '3px 8px' }}>
      {status}
    </span>
  );
}

