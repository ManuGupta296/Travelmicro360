import React from 'react';
import { X } from 'lucide-react';

export default function DetailDrawer({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <>
      <div className="position-fixed top-0 start-0 w-100 h-100" style={{ background: 'rgba(0,0,0,0.3)', zIndex: 1040 }} onClick={onClose} />
      <div className="position-fixed top-0 end-0 h-100 bg-white shadow-lg" style={{ width: 480, maxWidth: '90vw', zIndex: 1050, overflowY: 'auto', transition: 'transform 0.3s' }}>
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
          <h6 className="mb-0 fw-bold">{title}</h6>
          <button className="btn btn-sm btn-light" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="p-3">{children}</div>
      </div>
    </>
  );
}

