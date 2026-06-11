import React from 'react';
import { Download } from 'lucide-react';

export default function ExportCsvButton({ data = [], filename = 'export.csv', columns }) {
  const handleExport = () => {
    if (!data.length) return;
    const cols = columns || Object.keys(data[0]);
    const header = cols.map(c => typeof c === 'object' ? c.label : c).join(',');
    const rows = data.map(row =>
      cols.map(c => {
        const key = typeof c === 'object' ? c.key : c;
        const val = String(row[key] ?? '').replace(/,/g, ';').replace(/\n/g, ' ');
        return `"${val}"`;
      }).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={handleExport}>
      <Download size={14} /> Export CSV
    </button>
  );
}

