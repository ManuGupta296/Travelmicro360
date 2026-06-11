import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  onRowClick,
  actions,
  searchable = true,
  searchPlaceholder = 'Search...',
  pageSize: defaultPageSize = 10,
  loading = false,
  emptyMessage = 'No data found',
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        const val = col.accessor ? (typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]) : '';
        return String(val || '').toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const col = columns.find(c => c.key === sortCol);
      const av = col?.accessor ? (typeof col.accessor === 'function' ? col.accessor(a) : a[col.accessor]) : '';
      const bv = col?.accessor ? (typeof col.accessor === 'function' ? col.accessor(b) : b[col.accessor]) : '';
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortCol, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key) => {
    if (sortCol === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(key); setSortDir('asc'); }
  };

  if (loading) {
    return (
      <div className="t-card p-3">
        {[1,2,3,4,5].map(i => <div key={i} className="skeleton mb-2" style={{ height: 20 }} />)}
      </div>
    );
  }

  return (
    <div>
      {searchable && (
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="position-relative flex-grow-1" style={{ maxWidth: 300 }}>
            <Search size={14} className="position-absolute text-muted" style={{ left: 10, top: 10 }} />
            <input className="form-control form-control-sm ps-4" placeholder={searchPlaceholder}
              value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
          </div>
          <select className="form-select form-select-sm" style={{ width: 80 }} value={pageSize}
            onChange={e => { setPageSize(+e.target.value); setPage(0); }}>
            {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover table-striped align-middle mb-0" style={{ fontSize: '0.85rem' }}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={{ cursor: col.sortable !== false ? 'pointer' : 'default', whiteSpace: 'nowrap' }}
                  onClick={() => col.sortable !== false && handleSort(col.key)}>
                  {col.label} {sortCol === col.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
              {actions && <th style={{ width: 120 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="text-center text-muted py-4">{emptyMessage}</td></tr>
            ) : paged.map((row, idx) => (
              <tr key={row.id || idx} style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                onClick={() => onRowClick && onRowClick(row)}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : (typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor])}
                  </td>
                ))}
                {actions && <td onClick={e => e.stopPropagation()}>{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length > pageSize && (
        <div className="d-flex align-items-center justify-content-between mt-3">
          <small className="text-muted">Showing {page * pageSize + 1}–{Math.min((page+1) * pageSize, sorted.length)} of {sorted.length}</small>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-sm btn-light" disabled={page === 0} onClick={() => setPage(p => p-1)}><ChevronLeft size={14}/> Prev</button>
            <span className="small">Page {page+1} of {totalPages}</span>
            <button className="btn btn-sm btn-light" disabled={page >= totalPages-1} onClick={() => setPage(p => p+1)}>Next <ChevronRight size={14}/></button>
          </div>
        </div>
      )}
    </div>
  );
}

