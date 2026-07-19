import React, { useState, useEffect } from 'react';
import { useAuth, apiFetch } from '../Contexts/AuthContext';
import { 
    Coins, Plus, Search, Calendar, Trash2, Pencil, X, Save,
    ChevronDown, TrendingUp, DollarSign
} from 'lucide-react';

const SalaryAdvance = () => {
    const { user, showToast } = useAuth();
    const [advances, setAdvances] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Filter states
    const [searchName, setSearchName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Selection state
    const [selectedIds, setSelectedIds] = useState([]);

    // Form state
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        employee_name: '',
        amount: '',
        notes: ''
    });

    const fetchAdvances = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchName) params.append('employee_name', searchName);
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            const res = await apiFetch(`/api/salary-advances?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setAdvances(data);
                setSelectedIds([]);
            }
        } catch (error) {
            console.error('Error fetching salary advances:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchAdvances();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchName, startDate, endDate]);

    const openCreate = () => {
        setEditTarget(null);
        setForm({
            date: new Date().toISOString().split('T')[0],
            employee_name: '',
            amount: '',
            notes: ''
        });
        setErrors({});
        setModalOpen(true);
    };

    const openEdit = (adv) => {
        setEditTarget(adv);
        setForm({
            date: adv.date ? adv.date.split('T')[0] : '',
            employee_name: adv.employee_name,
            amount: adv.amount,
            notes: adv.notes || ''
        });
        setErrors({});
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});
        
        const url = editTarget ? `/api/salary-advances/${editTarget.id}` : '/api/salary-advances';
        const method = editTarget ? 'PUT' : 'POST';

        try {
            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (res.ok) {
                showToast(editTarget ? 'Salary advance updated!' : 'Salary advance recorded!', 'success');
                setModalOpen(false);
                fetchAdvances();
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

    const handleDelete = async (adv) => {
        if (!window.confirm(`Are you sure you want to delete the advance of ₹${parseFloat(adv.amount).toLocaleString('en-IN')} for ${adv.employee_name}?`)) {
            return;
        }

        try {
            const res = await apiFetch(`/api/salary-advances/${adv.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast('Salary advance record deleted.', 'success');
                fetchAdvances();
            } else {
                showToast('Failed to delete advance record.', 'error');
            }
        } catch (error) {
            showToast('Network error.', 'error');
        }
    };

    const exportToExcel = () => {
        if (advances.length === 0) return;
        const escapeCSV = (val) => {
            if (val === null || val === undefined) return '';
            let result = String(val).replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0) {
                result = `"${result}"`;
            }
            return result;
        };

        const headers = ["Date", "Employee Name", "Amount (INR)", "Notes / Remarks"];
        const rows = advances.map(adv => [
            escapeCSV(adv.date ? new Date(adv.date).toLocaleDateString('en-IN') : ''),
            escapeCSV(adv.employee_name),
            escapeCSV(adv.amount),
            escapeCSV(adv.notes)
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Salary_Advances_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalAdvancesAmount = advances.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const uniqueEmployeesCount = new Set(advances.map(item => item.employee_name.toLowerCase().trim())).size;

    const allSelected = advances.length > 0 && advances.every(a => selectedIds.includes(a.id));
    const toggleSelectAll = () => setSelectedIds(allSelected ? [] : advances.map(a => a.id));
    const toggleSelectOne = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedIds.length} selected salary advance(s)? This cannot be undone.`)) return;
        let deleted = 0;
        for (const id of selectedIds) {
            const res = await apiFetch(`/api/salary-advances/${id}`, { method: 'DELETE' });
            if (res.ok) deleted++;
        }
        showToast(`${deleted} advance(s) deleted.`, 'success');
        setSelectedIds([]);
        fetchAdvances();
    };

    return (
        <div style={{ padding: '28px' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>Salary Advance</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        Track and manage short-term interest-free salary advances given to staff members.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={exportToExcel} disabled={advances.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: advances.length === 0 ? 0.45 : 1, cursor: advances.length === 0 ? 'not-allowed' : 'pointer' }}>
                        <span>Export to Excel</span>
                    </button>
                    <button className="btn btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={18} />
                        <span>Disburse Advance</span>
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Total Outstanding</span>
                        <Coins size={18} color="var(--color-accent)" />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                        ₹{totalAdvancesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
                
                <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Active Employees</span>
                        <TrendingUp size={18} color="var(--color-success)" />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                        {uniqueEmployeesCount}
                    </div>
                </div>

                <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Total Transactions</span>
                        <Calendar size={18} color="#0ea5e9" />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                        {advances.length}
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="card" style={{ padding: '18px 24px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 12px' }}>
                    <Search size={16} color="var(--color-text-muted)" />
                    <input 
                        type="text" 
                        placeholder="Search employee name..." 
                        value={searchName} 
                        onChange={(e) => setSearchName(e.target.value)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', outline: 'none', width: '100%', fontSize: '0.875rem' }} 
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>FROM</span>
                        <input 
                            type="date" 
                            className="form-control" 
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>TO</span>
                        <input 
                            type="date" 
                            className="form-control" 
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    {(searchName || startDate || endDate) && (
                        <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => { setSearchName(''); setStartDate(''); setEndDate(''); }}
                            style={{ height: '36px' }}
                        >
                            Reset Clear
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

            {/* Main Table */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                    <div className="spinner"></div>
                </div>
            ) : advances.length === 0 ? (
                <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <Coins size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>No salary advance entries found matching the filter criteria.</p>
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
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Date</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Employee Name</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Amount</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Notes / Description</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Added By</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {advances.map((adv) => (
                                <tr key={adv.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s', background: selectedIds.includes(adv.id) ? 'rgba(99,102,241,0.05)' : '' }} className="table-row-hover">
                                    <td style={{ padding: '14px 18px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(adv.id)}
                                            onChange={() => toggleSelectOne(adv.id)}
                                            style={{ accentColor: 'var(--color-accent)', width: '15px', height: '15px', cursor: 'pointer' }}
                                        />
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: '500' }}>
                                        {adv.date ? new Date(adv.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: '600' }}>
                                        {adv.employee_name}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--color-accent)', fontWeight: '700' }}>
                                        ₹{parseFloat(adv.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                        {adv.notes || '—'}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                                        {adv.creator?.name || 'System'}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button onClick={() => openEdit(adv)} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }}>
                                                <Pencil size={13} />
                                            </button>
                                            {user?.role === 'admin' && (
                                                <button onClick={() => handleDelete(adv)} className="btn btn-danger btn-sm" style={{ padding: '6px 10px' }}>
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
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
                                <Coins size={18} color="var(--color-accent)" />
                                {editTarget ? 'Edit Salary Advance Record' : 'Record Salary Advance'}
                            </h3>
                            <button type="button" className="modal-close-btn" onClick={() => setModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Disbursed Date</label>
                                <input 
                                    type="date" 
                                    className="form-control" 
                                    value={form.date} 
                                    onChange={(e) => setForm({ ...form, date: e.target.value })} 
                                    required 
                                    disabled={submitting} 
                                />
                                {errors.date && <span className="error-text">{errors.date[0]}</span>}
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Employee Name</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Enter employee's full name"
                                    value={form.employee_name} 
                                    onChange={(e) => setForm({ ...form, employee_name: e.target.value })} 
                                    required 
                                    disabled={submitting} 
                                />
                                {errors.employee_name && <span className="error-text">{errors.employee_name[0]}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Advance Amount (₹)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    min="0.01" 
                                    placeholder="0.00"
                                    className="form-control" 
                                    value={form.amount} 
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })} 
                                    required 
                                    disabled={submitting} 
                                />
                                {errors.amount && <span className="error-text">{errors.amount[0]}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Notes / Purpose (Optional)</label>
                                <textarea 
                                    className="form-control" 
                                    placeholder="Add any context, return schedule notes, etc."
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
                                {submitting ? 'Saving...' : 'Save Advance'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SalaryAdvance;
