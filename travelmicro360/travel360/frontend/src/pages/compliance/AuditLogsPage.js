import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/audit-logs?page=0&size=500&sort=createdAt,desc').then(r => setLogs(r.data.content || r.data || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'logId', label: 'ID', accessor: 'logId' },
    { key: 'performedBy', label: 'User', render: r => r.performedBy || '—' },
    { key: 'action', label: 'Action', accessor: 'action' },
    { key: 'timestamp', label: 'Timestamp', render: r => (r.timestamp || r.createdAt || '—').replace('T', ' ').substring(0, 19) },
  ];

  return (
    <div>
      <h4 className="fw-bold mb-4">Audit Logs</h4>
      <div className="t-card p-3"><DataTable columns={columns} data={logs} loading={loading} /></div>
    </div>
  );
}

