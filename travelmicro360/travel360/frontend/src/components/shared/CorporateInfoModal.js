import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

// In-memory, per-session flag (resets on full reload — no localStorage/sessionStorage).
let shownThisSession = false;

export default function CorporateInfoModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const isCorporate = user?.companyName && user.companyName !== 'Independent';
    if (isCorporate && !shownThisSession) {
      shownThisSession = true;   // remember for the rest of the session
      setOpen(true);
    }
  }, [user]);

  if (!open) return null;
  const dismiss = () => setOpen(false);
  return (
    <>
      <div className="modal-backdrop show" style={{ zIndex: 1050 }} onClick={dismiss} />
      <div className="modal show d-block" style={{ zIndex: 1055 }} onClick={dismiss}>
        <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-0">
              <h6 className="modal-title fw-bold">Corporate account</h6>
              <button className="btn-close" onClick={dismiss} />
            </div>
            <div className="modal-body">
              <p className="text-muted mb-0">
                This is your corporate account — company travel only. For personal trips, please use a personal account.
              </p>
            </div>
            <div className="modal-footer border-0">
              <button className="btn btn-primary btn-sm" onClick={dismiss}>Got it</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
