import React, { useState, useEffect } from 'react';
import { useAuth, apiFetch } from '../Contexts/AuthContext';
import { 
    CheckSquare, Square, FileCheck, Search, Filter, Trash2, Pencil, X, Save,
    CheckCircle, AlertTriangle, HelpCircle, User, Calendar, Plus
} from 'lucide-react';

const VendorStatements = () => {
    const { user, showToast } = useAuth();
    const [statements, setStatements] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Filter states
    const [vendorName, setVendorName] = useState('');
    const [receivedFilter, setReceivedFilter] = useState('');
    const [periodFilter, setPeriodFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Selection state
    const [selectedIds, setSelectedIds] = useState([]);

    // Form state
    const [form, setForm] = useState({
        vendor_name: '',
        statement_received: false,
        status: 'correct',
        assigned_to: '',
        period: '',
        notes: ''
    });

    const fetchStatements = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (vendorName) params.append('vendor_name', vendorName);
            if (receivedFilter) params.append('statement_received', receivedFilter);
            if (periodFilter) params.append('period', periodFilter);
            if (statusFilter) params.append('status', statusFilter);

            const res = await apiFetch(`/api/vendor-statements?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setStatements(data);
                setSelectedIds([]);
            }
        } catch (error) {
            console.error('Error fetching vendor statements:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchStatements();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [vendorName, receivedFilter, periodFilter, statusFilter]);

    const openCreate = () => {
        setEditTarget(null);
        setForm({
            vendor_name: '',
            statement_received: false,
            status: 'correct',
            assigned_to: '',
            period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            notes: ''
        });
        setErrors({});
        setModalOpen(true);
    };

    const openEdit = (statement) => {
        setEditTarget(statement);
        setForm({
            vendor_name: statement.vendor_name,
            statement_received: !!statement.statement_received,
            status: statement.status || 'correct',
            assigned_to: statement.assigned_to || '',
            period: statement.period || '',
            notes: statement.notes || ''
        });
        setErrors({});
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        const url = editTarget ? `/api/vendor-statements/${editTarget.id}` : '/api/vendor-statements';
        const method = editTarget ? 'PUT' : 'POST';

        try {
            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (res.ok) {
                showToast(editTarget ? 'Vendor record updated!' : 'Vendor record tracked successfully!', 'success');
                setModalOpen(false);
                fetchStatements();
            } else {
                setErrors(data.errors || {});
                showToast(data.message || 'Error occurred.', 'error');
            }
        } catch (error) {
            showToast('Network error.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleReceived = async (stmt) => {
        try {
            const res = await apiFetch(`/api/vendor-statements/${stmt.id}/toggle`, {
                method: 'PUT'
            });
            if (res.ok) {
                showToast(`Received status toggled for ${stmt.vendor_name}`, 'success');
                // Optimistic local update to avoid loading flicker
                setStatements(statements.map(s => s.id === stmt.id ? { ...s, statement_received: !s.statement_received } : s));
            } else {
                showToast('Failed to toggle statement status.', 'error');
            }
        } catch (error) {
            showToast('Network error.', 'error');
        }
    };

    const handleDelete = async (stmt) => {
        if (!window.confirm(`Are you sure you want to remove the vendor tracking for "${stmt.vendor_name}"?`)) {
            return;
        }

        try {
            const res = await apiFetch(`/api/vendor-statements/${stmt.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast('Vendor tracker record deleted.', 'success');
                fetchStatements();
            } else {
                showToast('Failed to delete vendor record.', 'error');
            }
        } catch (error) {
            showToast('Network error.', 'error');
        }
    };

    // Stats
    const totalVendors = statements.length;
    const receivedCount = statements.filter(s => s.statement_received).length;
    const pendingCount = totalVendors - receivedCount;
    const issueCount = statements.filter(s => s.status && s.status !== 'correct').length;

    const allSelected = statements.length > 0 && statements.every(s => selectedIds.includes(s.id));
    const toggleSelectAll = () => setSelectedIds(allSelected ? [] : statements.map(s => s.id));
    const toggleSelectOne = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedIds.length} selected vendor statement tracker record(s)? This cannot be undone.`)) return;
        let deleted = 0;
        for (const id of selectedIds) {
            const res = await apiFetch(`/api/vendor-statements/${id}`, { method: 'DELETE' });
            if (res.ok) deleted++;
        }
        showToast(`${deleted} record(s) deleted.`, 'success');
        setSelectedIds([]);
        fetchStatements();
    };

    const exportToExcel = () => {
        if (statements.length === 0) return;
        const escapeCSV = (val) => {
            if (val === null || val === undefined) return '';
            let result = String(val).replace(/"/g, '""');
            if (result.search(/("|"|,|\n)/g) >= 0) {
                result = `"${result}"`;
            }
            return result;
        };

        const headers = ["Vendor Name", "Period", "Statement Received", "Status / Notes"];
        const rows = statements.map(s => [
            escapeCSV(s.vendor_name),
            escapeCSV(s.period),
            escapeCSV(s.statement_received ? 'Yes' : 'No'),
            escapeCSV(s.status ? s.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '')
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Vendor_Statements_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusStyle = (status) => {
        const val = (status || '').toLowerCase().trim();
        if (val.includes('correct') || val.includes('ok')) {
            return { color: 'var(--color-success)', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)', icon: CheckCircle };
        }
        if (val.includes('diff') || val.includes('opening') || val.includes('missing') || val.includes('error')) {
            return { color: 'var(--color-danger)', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', icon: AlertTriangle };
        }
        return { color: 'var(--color-text-secondary)', bg: 'var(--bg-input)', border: 'var(--border-subtle)', icon: HelpCircle };
    };

    // Get unique periods for drop down filter
    const periods = Array.from(new Set(statements.map(s => s.period).filter(Boolean)));

    return (
        <div style={{ padding: '28px' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>Vendor Statements</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        Track received monthly statements from suppliers and review account reconciliation status.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={exportToExcel} disabled={statements.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: statements.length === 0 ? 0.45 : 1, cursor: statements.length === 0 ? 'not-allowed' : 'pointer' }}>
                        <span>Export to Excel</span>
                    </button>
                    <button className="btn btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={18} />
                        <span>Track New Vendor</span>
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Tracked Vendors</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>{totalVendors}</div>
                </div>

                <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Statements Received</span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                            {totalVendors > 0 ? Math.round((receivedCount / totalVendors) * 100) : 0}%
                        </span>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-success)' }}>{receivedCount}</div>
                </div>

                <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Statements Pending</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-text-secondary)' }}>{pendingCount}</div>
                </div>

                <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Differences / Issues</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-danger)' }}>{issueCount}</div>
                </div>
            </div>

            {/* Filter Row */}
            <div className="card" style={{ padding: '18px 24px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 2, minWidth: '240px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 12px' }}>
                    <Search size={16} color="var(--color-text-muted)" />
                    <input 
                        type="text" 
                        placeholder="Search vendor name..." 
                        value={vendorName} 
                        onChange={(e) => setVendorName(e.target.value)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', outline: 'none', width: '100%', fontSize: '0.875rem' }} 
                    />
                </div>

                <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
                    <select className="form-control" value={receivedFilter} onChange={(e) => setReceivedFilter(e.target.value)} style={{ padding: '8px 12px', height: 'auto', fontSize: '0.875rem' }}>
                        <option value="">All Received Status</option>
                        <option value="1">Received ✓</option>
                        <option value="0">Pending ✗</option>
                    </select>
                </div>

                <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
                    <select className="form-control" value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} style={{ padding: '8px 12px', height: 'auto', fontSize: '0.875rem' }}>
                        <option value="">All Periods</option>
                        {periods.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>

                <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
                    <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', height: 'auto', fontSize: '0.875rem' }}>
                        <option value="">All Reconciliation Status</option>
                        <option value="correct">Correct / Matches</option>
                        <option value="difference">Has Difference</option>
                        <option value="missing">Missing Statement</option>
                    </select>
                </div>

                {(vendorName || receivedFilter || periodFilter || statusFilter) && (
                    <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => { setVendorName(''); setReceivedFilter(''); setPeriodFilter(''); setStatusFilter(''); }}
                        style={{ height: '38px', padding: '0 16px' }}
                    >
                        Reset Clear
                    </button>
                )}
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: '10px', padding: '10px 18px', marginBottom: '12px'
                }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-accent)' }}>
                        {selectedIds.length} row{selectedIds.length > 1 ? 's' : ''} selected
                    </span>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedIds([])} style={{ marginLeft: 'auto' }}>Clear Selection</button>
                    {user?.role === 'admin' && (
                        <button className="btn btn-danger btn-sm" onClick={handleBulkDelete} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Trash2 size={13} /> Delete Selected
                        </button>
                    )}
                </div>
            )}

            {/* Main Table */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                    <div className="spinner"></div>
                </div>
            ) : statements.length === 0 ? (
                <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <FileCheck size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>No vendor statement records tracked.</p>
                </div>
            ) : (
                <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                                <th style={{ padding: '16px 18px', width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleSelectAll}
                                        style={{ accentColor: 'var(--color-accent)', width: '15px', height: '15px', cursor: 'pointer' }}
                                        title="Select All"
                                    />
                                </th>
                                <th style={{ padding: '16px 24px', width: '80px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Received?</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Vendor / Supplier</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Period</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Reconciliation Status</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Assigned Person</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Additional Notes</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Added By</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statements.map((stmt) => {
                                const style = getStatusStyle(stmt.status);
                                const StatusIcon = style.icon;

                                return (
                                    <tr key={stmt.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s', background: selectedIds.includes(stmt.id) ? 'rgba(99,102,241,0.05)' : '' }} className="table-row-hover">
                                        <td style={{ padding: '14px 18px' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(stmt.id)}
                                                onChange={() => toggleSelectOne(stmt.id)}
                                                style={{ accentColor: 'var(--color-accent)', width: '15px', height: '15px', cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                            <button 
                                                onClick={() => handleToggleReceived(stmt)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                                                title="Toggle Received"
                                            >
                                                {stmt.statement_received ? (
                                                    <CheckSquare size={20} color="var(--color-success)" />
                                                ) : (
                                                    <Square size={20} color="var(--color-text-muted)" />
                                                )}
                                            </button>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: '600' }}>
                                            {stmt.vendor_name}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                                            {stmt.period || '—'}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ 
                                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                color: style.color, backgroundColor: style.bg, border: `1px solid ${style.border}`,
                                                padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '600',
                                                textTransform: 'capitalize'
                                            }}>
                                                <StatusIcon size={12} />
                                                {stmt.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                            {stmt.assigned_to ? (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <User size={13} color="var(--color-text-muted)" /> {stmt.assigned_to}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '200px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                            {stmt.notes || '—'}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                                            {stmt.creator?.name || 'System'}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => openEdit(stmt)} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }}>
                                                    <Pencil size={13} />
                                                </button>
                                                {user?.role === 'admin' && (
                                                    <button onClick={() => handleDelete(stmt)} className="btn btn-danger btn-sm" style={{ padding: '6px 10px' }}>
                                                        <Trash2 size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="modal-overlay">
                    <form className="modal-content" onSubmit={handleSubmit} style={{ maxWidth: '480px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileCheck size={18} color="var(--color-accent)" />
                                {editTarget ? 'Edit Vendor Tracking' : 'Track New Vendor Statement'}
                            </h3>
                            <button type="button" className="modal-close-btn" onClick={() => setModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Vendor Name / Supplier</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Enter supplier corporate name"
                                    value={form.vendor_name} 
                                    onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} 
                                    required 
                                    disabled={submitting} 
                                />
                                {errors.vendor_name && <span className="error-text">{errors.vendor_name[0]}</span>}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Period / Month</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="e.g. July 2026"
                                        value={form.period} 
                                        onChange={(e) => setForm({ ...form, period: e.target.value })} 
                                        required
                                        disabled={submitting} 
                                    />
                                    {errors.period && <span className="error-text">{errors.period[0]}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Assigned Accountant</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Name of staff reconciling"
                                        value={form.assigned_to} 
                                        onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} 
                                        disabled={submitting} 
                                    />
                                    {errors.assigned_to && <span className="error-text">{errors.assigned_to[0]}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Reconciliation Status</label>
                                <select 
                                    className="form-control" 
                                    value={form.status} 
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    disabled={submitting}
                                >
                                    <option value="correct">Correct (Statement matches internal general ledger)</option>
                                    <option value="opening difference">Opening Balance Difference</option>
                                    <option value="missing transaction">Missing transaction entries in ledger</option>
                                    <option value="duplicate entry">Duplicate bills entry found</option>
                                    <option value="pending reconciliation">Pending detail verification</option>
                                </select>
                                {errors.status && <span className="error-text">{errors.status[0]}</span>}
                            </div>

                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                                <input 
                                    type="checkbox" 
                                    id="modal_received"
                                    checked={form.statement_received} 
                                    onChange={(e) => setForm({ ...form, statement_received: e.target.checked })} 
                                    disabled={submitting}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="modal_received" style={{ margin: 0, fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                                    Statement Received from Supplier
                                </label>
                            </div>

                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label className="form-label">Audit Remarks / Differences Details (Optional)</label>
                                <textarea 
                                    className="form-control" 
                                    placeholder="Enter discrepancy notes, differences value, actions required..."
                                    value={form.notes} 
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                                    disabled={submitting} 
                                    rows={3}
                                />
                                {errors.notes && <span className="error-text">{errors.notes[0]}</span>}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Save size={15} />
                                {submitting ? 'Saving...' : 'Save Vendor Tracker'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default VendorStatements;
