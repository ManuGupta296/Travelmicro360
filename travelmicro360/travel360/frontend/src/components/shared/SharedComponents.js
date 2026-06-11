import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({ icon, label, value, trend, trendLabel, color = 'var(--primary-light)' }) {
  const isUp = trend > 0;
  return (
    <div className="stat-card">
      <div className="d-flex align-items-start justify-content-between mb-2">
        <div className="stat-icon" style={{ background: `${color}15`, color }}>{icon}</div>
        {trend !== undefined && (
          <span className={`stat-trend ${isUp ? 'text-success' : 'text-danger'} d-flex align-items-center gap-1`}>
            {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="stat-value" style={{ color }}>{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {trendLabel && <div className="text-muted" style={{ fontSize: '0.7rem' }}>{trendLabel}</div>}
    </div>
  );
}

export function SkeletonCard({ height = 160 }) {
  return <div className="skeleton" style={{ height, width: '100%' }} />;
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="t-card p-3">
      <div className="skeleton mb-3" style={{ height: 20, width: '30%' }} />
      {Array.from({ length: rows }).map((_, r) => (
        <div className="d-flex gap-3 mb-2" key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <div className="skeleton flex-grow-1" style={{ height: 16 }} key={c} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon, title = 'Nothing here yet', description, action, onAction }) {
  return (
    <div className="text-center py-5">
      <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }}>{icon || '📭'}</div>
      <h5>{title}</h5>
      {description && <p className="text-muted small">{description}</p>}
      {action && <button className="btn btn-gradient mt-2" onClick={onAction}>{action}</button>}
    </div>
  );
}

export function Stepper({ steps, current }) {
  return (
    <div className="stepper">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className={`step-item ${i === current ? 'active' : i < current ? 'done' : ''}`}>
            <span>{i < current ? '✓' : i + 1}</span> {s}
          </div>
          {i < steps.length - 1 && <div className={`step-line ${i < current ? 'done' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

