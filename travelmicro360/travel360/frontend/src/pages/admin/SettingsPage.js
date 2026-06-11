import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, Database, User } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div>
      <h4 className="fw-bold mb-4">System Settings</h4>
      <div className="row g-3">
        <div className="col-md-6">
          <div className="t-card p-4">
            <h6 className="fw-bold d-flex align-items-center gap-2 mb-3"><Settings size={18}/> Application Info</h6>
            <table className="table table-sm table-borderless" style={{fontSize:'0.85rem'}}>
              <tbody>
                <tr><td className="text-muted">Version</td><td>1.0.0</td></tr>
                <tr><td className="text-muted">Backend</td><td>http://localhost:9090 (Gateway)</td></tr>
                <tr><td className="text-muted">Database</td><td><span className="badge bg-success-subtle text-success">Connected</span></td></tr>
                <tr><td className="text-muted">Framework</td><td>Spring Boot 3.3.4</td></tr>
                <tr><td className="text-muted">Frontend</td><td>React 18 + Bootstrap 5</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-md-6">
          <div className="t-card p-4">
            <h6 className="fw-bold d-flex align-items-center gap-2 mb-3"><User size={18}/> Admin Profile</h6>
            <table className="table table-sm table-borderless" style={{fontSize:'0.85rem'}}>
              <tbody>
                <tr><td className="text-muted">Name</td><td>{user?.name}</td></tr>
                <tr><td className="text-muted">Email</td><td>{user?.email}</td></tr>
                <tr><td className="text-muted">Role</td><td><span className="badge bg-primary-subtle text-primary">{user?.role}</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

