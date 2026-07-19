import React, { useState, useEffect } from 'react';
import { useAuth, apiFetch } from '../Contexts/AuthContext';
import { 
    FileText, Plus, Search, Calendar, Trash2, Pencil, X, Save,
    CheckCircle, AlertCircle, RefreshCw, Slash, DollarSign
} from 'lucide-react';

const ChequeRegister = () => {
    const { user, showToast } = useAuth();
    const [cheques, setCheques] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Filter states
    const [searchChq, setSearchChq] = useState('');
    const [searchVendor, setSearchVendor] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Selection state
    const [selectedIds, setSelectedIds] = useState([]);

    // Form state
    const [form, setForm] = useState({
        issue_date: new Date().toISOString().split('T')[0],
        cheque_no: '',
        vendor_name: '',
        cheque_date: new Date().toISOString().split('T')[0],
        amount: '',
        status: 'issued',
        notes: ''
    });

    const fetchCheques = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchChq) params.append('cheque_no', searchChq);
            if (searchVendor) params.append('vendor_name', searchVendor);
            if (statusFilter) params.append('status', statusFilter);
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            const res = await apiFetch(`/api/cheques?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setCheques(data);
                setSelectedIds([]); // clear selection on refresh
            }
        } catch (error) {
            console.error('Error fetching cheques:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchCheques();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchChq, searchVendor, statusFilter, startDate, endDate]);

    const openCreate = () => {
        setEditTarget(null);
        // Suggest next cheque number automatically if possible
        let nextNo = '';
        if (cheques.length > 0) {
            const numbers = cheques.map(c => parseInt(c.cheque_no)).filter(n => !isNaN(n));
            if (numbers.length > 0) {
                nextNo = String(Math.max(...numbers) + 1);
            }
        }

        setForm({
            issue_date: new Date().toISOString().split('T')[0],
            cheque_no: nextNo,
            vendor_name: '',
            cheque_date: new Date().toISOString().split('T')[0],
            amount: '',
            status: 'issued',
            notes: ''
        });
        setErrors({});
        setModalOpen(true);
    };

    const openEdit = (chq) => {
        setEditTarget(chq);
        setForm({
            issue_date: chq.issue_date ? chq.issue_date.split('T')[0] : '',
            cheque_no: chq.cheque_no,
            vendor_name: chq.vendor_name || '',
            cheque_date: chq.cheque_date ? chq.cheque_date.split('T')[0] : '',
            amount: chq.amount || '',
            status: chq.status || 'issued',
            notes: chq.notes || ''
        });
        setErrors({});
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        const url = editTarget ? `/api/cheques/${editTarget.id}` : '/api/cheques';
        const method = editTarget ? 'PUT' : 'POST';

        try {
            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (res.ok) {
                showToast(editTarget ? 'Cheque record updated!' : 'Cheque recorded in register!', 'success');
                setModalOpen(false);
                fetchCheques();
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

    const handleDelete = async (chq) => {
        if (!window.confirm(`Are you sure you want to delete Cheque No. ${chq.cheque_no} for ₹${parseFloat(chq.amount || 0).toLocaleString('en-IN')}?`)) {
            return;
        }

        try {
            const res = await apiFetch(`/api/cheques/${chq.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast('Cheque record deleted.', 'success');
                fetchCheques();
            } else {
                showToast('Failed to delete cheque record.', 'error');
            }
        } catch (error) {
            showToast('Network error.', 'error');
        }
    };

    // Stats calculations
    const totalIssuedAmount = cheques.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
    const clearedAmount = cheques.filter(c => c.status === 'cleared').reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
    const bouncedCount = cheques.filter(c => c.status === 'bounced').length;
    const pendingAmount = cheques.filter(c => c.status === 'issued').reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);

    const allSelected = cheques.length > 0 && cheques.every(c => selectedIds.includes(c.id));
    const toggleSelectAll = () => setSelectedIds(allSelected ? [] : cheques.map(c => c.id));
    const toggleSelectOne = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedIds.length} selected cheque record(s)? This cannot be undone.`)) return;
        let deleted = 0;
        for (const id of selectedIds) {
            const res = await apiFetch(`/api/cheques/${id}`, { method: 'DELETE' });
            if (res.ok) deleted++;
        }
        showToast(`${deleted} record(s) deleted.`, 'success');
        setSelectedIds([]);
        fetchCheques();
    };

    const exportToExcel = () => {
        if (cheques.length === 0) return;
        const escapeCSV = (val) => {
            if (val === null || val === undefined) return '';
            let result = String(val).replace(/"/g, '""');
            if (result.search(/("|"|,|\n)/g) >= 0) {
                result = `"${result}"`;
            }
            return result;
        };

        const headers = ["Cheque No", "Issue Date", "Vendor / Payee", "Bank", "Amount (INR)", "Status", "Notes"];
        const rows = cheques.map(c => [
            escapeCSV(c.cheque_no),
            escapeCSV(c.issue_date ? new Date(c.issue_date).toLocaleDateString('en-IN') : ''),
            escapeCSV(c.vendor_name),
            escapeCSV(c.bank_name),
            escapeCSV(c.amount),
            escapeCSV({ issued: 'Issued / Pending', cleared: 'Cleared', bounced: 'Bounced', cancelled: 'Cancelled' }[c.status] || (c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : '')),
            escapeCSV(c.notes)
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Cheque_Register_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'cleared':
                return { color: 'var(--color-success)', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)', label: 'Cleared', icon: CheckCircle };
            case 'bounced':
                return { color: 'var(--color-danger)', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', label: 'Bounced', icon: AlertCircle };
            case 'cancelled':
                return { color: 'var(--color-text-muted)', bg: 'rgba(156, 163, 175, 0.1)', border: 'rgba(156, 163, 175, 0.2)', label: 'Cancelled', icon: Slash };
            case 'issued':
            default:
                return { color: 'var(--color-accent)', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.2)', label: 'Issued / Pending', icon: RefreshCw };
        }
    };

    return (
        <div style={{ padding: '28px' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>Cheque Register</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        Track outward cheques issued to suppliers, cheque clearances, and bank deposit statuses.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={exportToExcel} disabled={cheques.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: cheques.length === 0 ? 0.45 : 1, cursor: cheques.length === 0 ? 'not-allowed' : 'pointer' }}>
                        <span>Export to Excel</span>
                    </button>
                    <button className="btn btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={18} />
                        <span>Issue Cheque</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Total Issued</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                        ₹{totalIssuedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>

                <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Cleared Amount</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-success)' }}>
                        ₹{clearedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>

                <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Uncleared / Transit</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-accent)' }}>
                        ₹{pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>

                <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Bounced Cheques</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-danger)' }}>
                        {bouncedCount}
                    </div>
                </div>
            </div>

            {/* Filter Card */}
            <div className="card" style={{ padding: '18px 24px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '150px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 12px' }}>
                    <Search size={16} color="var(--color-text-muted)" />
                    <input 
                        type="text" 
                        placeholder="Chq No..." 
                        value={searchChq} 
                        onChange={(e) => setSearchChq(e.target.value)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', outline: 'none', width: '100%', fontSize: '0.875rem' }} 
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 2, minWidth: '200px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 12px' }}>
                    <Search size={16} color="var(--color-text-muted)" />
                    <input 
                        type="text" 
                        placeholder="Vendor/Supplier payee..." 
                        value={searchVendor} 
                        onChange={(e) => setSearchVendor(e.target.value)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', outline: 'none', width: '100%', fontSize: '0.875rem' }} 
                    />
                </div>

                <div className="form-group" style={{ margin: 0, minWidth: '160px' }}>
                    <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', height: 'auto', fontSize: '0.875rem' }}>
                        <option value="">All Statuses</option>
                        <option value="issued">Issued / Pending</option>
                        <option value="cleared">Cleared</option>
                        <option value="bounced">Bounced</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>FROM</span>
                        <input 
                            type="date" 
                            className="form-control" 
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>TO</span>
                        <input 
                            type="date" 
                            className="form-control" 
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    {(searchChq || searchVendor || statusFilter || startDate || endDate) && (
                        <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => { setSearchChq(''); setSearchVendor(''); setStatusFilter(''); setStartDate(''); setEndDate(''); }}
                            style={{ height: '36px' }}
                        >
                            Clear
                        </button>
                    )}
                </div>
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

            {/* Table */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                    <div className="spinner"></div>
                </div>
            ) : cheques.length === 0 ? (
                <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <FileText size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>No cheque records found in the register.</p>
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
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Chq No.</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Payee / Vendor</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Cheque Date</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Amount</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Issue Date</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Status</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Notes</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Added By</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cheques.map((chq) => {
                                const style = getStatusStyle(chq.status);
                                const StatusIcon = style.icon;

                                return (
                                    <tr key={chq.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s', background: selectedIds.includes(chq.id) ? 'rgba(99,102,241,0.05)' : '' }} className="table-row-hover">
                                        <td style={{ padding: '14px 18px' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(chq.id)}
                                                onChange={() => toggleSelectOne(chq.id)}
                                                style={{ accentColor: 'var(--color-accent)', width: '15px', height: '15px', cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: '700' }}>
                                            #{chq.cheque_no}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: '600' }}>
                                            {chq.vendor_name || '—'}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                                            {chq.cheque_date ? new Date(chq.cheque_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--color-accent)', fontWeight: '750' }}>
                                            {chq.amount ? `₹${parseFloat(chq.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                            {chq.issue_date ? new Date(chq.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ 
                                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                color: style.color, backgroundColor: style.bg, border: `1px solid ${style.border}`,
                                                padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600'
                                            }}>
                                                <StatusIcon size={12} />
                                                {style.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '160px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                            {chq.notes || '—'}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                                            {chq.creator?.name || 'System'}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => openEdit(chq)} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }}>
                                                    <Pencil size={13} />
                                                </button>
                                                {user?.role === 'admin' && (
                                                    <button onClick={() => handleDelete(chq)} className="btn btn-danger btn-sm" style={{ padding: '6px 10px' }}>
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
                    <form className="modal-content" onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={18} color="var(--color-accent)" />
                                {editTarget ? 'Edit Cheque Record' : 'Record Issued Cheque'}
                            </h3>
                            <button type="button" className="modal-close-btn" onClick={() => setModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Cheque Number</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="e.g. 100452"
                                        value={form.cheque_no} 
                                        onChange={(e) => setForm({ ...form, cheque_no: e.target.value })} 
                                        required 
                                        disabled={submitting} 
                                    />
                                    {errors.cheque_no && <span className="error-text">{errors.cheque_no[0]}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Amount (₹)</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        min="0"
                                        placeholder="0.00"
                                        className="form-control" 
                                        value={form.amount} 
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })} 
                                        disabled={submitting} 
                                    />
                                    {errors.amount && <span className="error-text">{errors.amount[0]}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Vendor / Payee Name</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Company or individual payee"
                                    value={form.vendor_name} 
                                    onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} 
                                    disabled={submitting} 
                                />
                                {errors.vendor_name && <span className="error-text">{errors.vendor_name[0]}</span>}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Cheque Date <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(Post-dated)</span></label>
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        value={form.cheque_date} 
                                        onChange={(e) => setForm({ ...form, cheque_date: e.target.value })} 
                                        disabled={submitting} 
                                    />
                                    {errors.cheque_date && <span className="error-text">{errors.cheque_date[0]}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Issue Date</label>
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        value={form.issue_date} 
                                        onChange={(e) => setForm({ ...form, issue_date: e.target.value })} 
                                        disabled={submitting} 
                                    />
                                    {errors.issue_date && <span className="error-text">{errors.issue_date[0]}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select 
                                    className="form-control" 
                                    value={form.status} 
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    disabled={submitting}
                                >
                                    <option value="issued">Issued (Transit / Uncleared)</option>
                                    <option value="cleared">Cleared (Funds debited from bank)</option>
                                    <option value="bounced">Bounced (Insufficient funds/returns)</option>
                                    <option value="cancelled">Cancelled / Void</option>
                                </select>
                                {errors.status && <span className="error-text">{errors.status[0]}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Remarks / Description (Optional)</label>
                                <textarea 
                                    className="form-control" 
                                    placeholder="Enter details of invoice paid, bounced notes, etc."
                                    value={form.notes} 
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                                    disabled={submitting} 
                                    rows={2}
                                />
                                {errors.notes && <span className="error-text">{errors.notes[0]}</span>}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Save size={15} />
                                {submitting ? 'Saving...' : 'Save Cheque Record'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChequeRegister;
