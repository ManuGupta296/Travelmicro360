import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Generic CRUD page.
 *
 * Props:
 *  - title          : string
 *  - resource       : URL segment, e.g. 'users'
 *  - idField        : entity id field name, e.g. 'userId'
 *  - columns        : [{ key, label, render? }]
 *  - emptyForm      : default form object
 *  - renderForm     : (form, setForm) => JSX
 *  - transformForSubmit (optional): form -> request body
 */
function CrudPage({ title, resource, idField, columns, emptyForm, renderForm, transformForSubmit }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/${resource}?page=${page}&size=${size}`);
      setItems(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [resource, page, size]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const body = transformForSubmit ? transformForSubmit(form) : form;
    try {
      if (editingId == null) {
        await api.post(`/${resource}`, body);
      } else {
        await api.put(`/${resource}/${editingId}`, body);
      }
      resetForm();
      load();
    } catch (e) {
      const details = e.response?.data?.details;
      setError(details ? details.join(', ') : (e.response?.data?.message || e.message));
    }
  };

  const handleEdit = (item) => {
    setEditingId(item[idField]);
    setForm({ ...emptyForm, ...item });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.delete(`/${resource}/${id}`);
      load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  return (
    <div>
      <h2 className="mb-3">{title}</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card mb-4">
        <div className="card-header">{editingId == null ? 'Create new' : `Edit #${editingId}`}</div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {renderForm(form, setForm)}
            <div className="mt-2">
              <button type="submit" className="btn btn-primary me-2">
                {editingId == null ? 'Create' : 'Update'}
              </button>
              {editingId != null && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Records ({items.length})</span>
          {loading && <span className="text-muted small">Loading...</span>}
        </div>
        <div className="card-body p-0">
          <table className="table table-striped table-hover mb-0">
            <thead className="table-light">
              <tr>
                {columns.map(c => <th key={c.key}>{c.label}</th>)}
                <th style={{width: '160px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item[idField]}>
                  {columns.map(c => (
                    <td key={c.key}>{c.render ? c.render(item) : String(item[c.key] ?? '')}</td>
                  ))}
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item[idField])}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr><td colSpan={columns.length + 1} className="text-center text-muted py-3">No records</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="card-footer d-flex justify-content-between align-items-center">
          <button className="btn btn-sm btn-outline-secondary"
                  disabled={page === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}>
            Previous
          </button>
          <span>Page {page + 1} of {Math.max(1, totalPages)}</span>
          <button className="btn btn-sm btn-outline-secondary"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage(p => p + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default CrudPage;
