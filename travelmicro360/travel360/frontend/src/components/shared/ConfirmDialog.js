import React from 'react';

export default function ConfirmDialog({ open, title = 'Confirm', message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  if (!open) return null;
  return (
    <>
      <div className="modal-backdrop show" style={{ zIndex: 1050 }} onClick={onCancel} />
      <div className="modal show d-block" style={{ zIndex: 1055 }} onClick={onCancel}>
        <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-0">
              <h6 className="modal-title fw-bold">{title}</h6>
              <button className="btn-close" onClick={onCancel} />
            </div>
            <div className="modal-body">
              <p className="text-muted mb-0">{message}</p>
            </div>
            <div className="modal-footer border-0">
              <button className="btn btn-light btn-sm" onClick={onCancel}>Cancel</button>
              <button className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

