import React, { useState, useEffect } from 'react';
import { useAuth, apiFetch } from '../Contexts/AuthContext';
import { 
    Truck, Plus, Search, Calendar, Trash2, Pencil, X, Save,
    Phone, FileText, User, Hash, Check, Clock, ShieldCheck
} from 'lucide-react';

const CargoLog = () => {
    const { user, showToast } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Filter states
    const [cargoName, setCargoName] = useState('');
    const [partyName, setPartyName] = useState('');
    const [billNo, setBillNo] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Selection state
    const [selectedIds, setSelectedIds] = useState([]);

    // Form state
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        cargo_name: '',
        party_name: '',
        part_count: '',
        amount: '',
        phone_no: '',
        bill_no: '',
        payment_status: 'pending',
        notes: ''
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (cargoName) params.append('cargo_name', cargoName);
            if (partyName) params.append('party_name', partyName);
            if (billNo) params.append('bill_no', billNo);
            if (paymentStatusFilter) params.append('payment_status', paymentStatusFilter);
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            const res = await apiFetch(`/api/cargo-logs?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
                setSelectedIds([]);
            }
        } catch (error) {
            console.error('Error fetching cargo logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchLogs();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [cargoName, partyName, billNo, paymentStatusFilter, startDate, endDate]);

    const openCreate = () => {
        setEditTarget(null);
        setForm({
            date: new Date().toISOString().split('T')[0],
            cargo_name: '',
            party_name: '',
            part_count: '',
            amount: '',
            phone_no: '',
            bill_no: '',
            payment_status: 'pending',
            notes: ''
        });
        setErrors({});
        setModalOpen(true);
    };

    const openEdit = (log) => {
        setEditTarget(log);
        setForm({
            date: log.date ? log.date.split('T')[0] : '',
            cargo_name: log.cargo_name,
            party_name: log.party_name || '',
            part_count: log.part_count || '',
            amount: log.amount || '',
            phone_no: log.phone_no || '',
            bill_no: log.bill_no || '',
            payment_status: log.payment_status || 'pending',
            notes: log.notes || ''
        });
        setErrors({});
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        const url = editTarget ? `/api/cargo-logs/${editTarget.id}` : '/api/cargo-logs';
        const method = editTarget ? 'PUT' : 'POST';

        try {
            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (res.ok) {
                showToast(editTarget ? 'Cargo log updated!' : 'Cargo log recorded!', 'success');
                setModalOpen(false);
                fetchLogs();
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

    const handleMarkPaid = async (log) => {
        try {
            const res = await apiFetch(`/api/cargo-logs/${log.id}/pay`, {
                method: 'PUT'
            });
            if (res.ok) {
                showToast('Cargo log marked as Paid!', 'success');
                fetchLogs();
            } else {
                showToast('Failed to update status.', 'error');
            }
        } catch (error) {
            showToast('Network error.', 'error');
        }
    };

    const handleDelete = async (log) => {
        if (!window.confirm(`Are you sure you want to delete this cargo log from ${log.cargo_name} for ₹${parseFloat(log.amount || 0).toLocaleString('en-IN')}?`)) {
            return;
        }

        try {
            const res = await apiFetch(`/api/cargo-logs/${log.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast('Cargo log entry deleted successfully.', 'success');
                fetchLogs();
            } else {
                const data = await res.json();
                showToast(data.message || 'Failed to delete cargo log.', 'error');
            }
        } catch (error) {
            showToast('Network error.', 'error');
        }
    };

    const exportToExcel = () => {
        if (logs.length === 0) return;
        const escapeCSV = (val) => {
            if (val === null || val === undefined) return '';
            let result = String(val).replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0) {
                result = `"${result}"`;
            }
            return result;
        };

        const headers = ["Date", "Cargo Name", "Party Name", "Rolls/Boxes", "Amount (INR)", "Phone No", "Bill No", "Payment Status"];
        const rows = logs.map(log => [
            escapeCSV(log.date ? new Date(log.date).toLocaleDateString('en-IN') : ''),
            escapeCSV(log.cargo_name),
            escapeCSV(log.party_name),
            escapeCSV(log.part_count),
            escapeCSV(log.amount),
            escapeCSV(log.phone_no),
            escapeCSV(log.bill_no),
            escapeCSV(log.payment_status ? log.payment_status.charAt(0).toUpperCase() + log.payment_status.slice(1) : '')
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Cargo_Logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Computations
    const totalFreightCost = logs.reduce((sum, log) => sum + parseFloat(log.amount || 0), 0);
    const paidFreightCost = logs.filter(l => l.payment_status === 'paid').reduce((sum, log) => sum + parseFloat(log.amount || 0), 0);
    const pendingFreightCost = logs.filter(l => l.payment_status !== 'paid').reduce((sum, log) => sum + parseFloat(log.amount || 0), 0);
    const uniqueCargosCount = new Set(logs.map(log => log.cargo_name.toLowerCase().trim())).size;

    const allSelected = logs.length > 0 && logs.every(l => selectedIds.includes(l.id));
    const toggleSelectAll = () => setSelectedIds(allSelected ? [] : logs.map(l => l.id));
    const toggleSelectOne = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedIds.length} selected cargo log(s)? This cannot be undone.`)) return;
        let deleted = 0;
        for (const id of selectedIds) {
            const res = await apiFetch(`/api/cargo-logs/${id}`, { method: 'DELETE' });
            if (res.ok) deleted++;
        }
        showToast(`${deleted} cargo log(s) deleted.`, 'success');
        setSelectedIds([]);
        fetchLogs();
    };

    return (
        <div style={{ padding: '28px' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>Cargo Log</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        Log and monitor inward/outward transport deliveries, billing details, and freight charges.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={exportToExcel} disabled={logs.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: logs.length === 0 ? 0.45 : 1, cursor: logs.length === 0 ? 'not-allowed' : 'pointer' }}>
                        <span>Export to Excel</span>
                    </button>
                    <button className="btn btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={18} />
                        <span>Log Cargo Update</span>
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Total Freight Cost</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                        ₹{totalFreightCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>

                <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Total Paid</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-success)' }}>
                        ₹{paidFreightCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>

                <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Pending Dues</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-danger)' }}>
                        ₹{pendingFreightCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
                
                <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Cargo Partners</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-accent)' }}>
                        {uniqueCargosCount}
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="card" style={{ padding: '18px 24px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '160px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 12px' }}>
                    <Search size={16} color="var(--color-text-muted)" />
                    <input 
                        type="text" 
                        placeholder="Cargo name..." 
                        value={cargoName} 
                        onChange={(e) => setCargoName(e.target.value)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', outline: 'none', width: '100%', fontSize: '0.875rem' }} 
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '160px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 12px' }}>
                    <User size={16} color="var(--color-text-muted)" />
                    <input 
                        type="text" 
                        placeholder="Party/Receiver..." 
                        value={partyName} 
                        onChange={(e) => setPartyName(e.target.value)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', outline: 'none', width: '100%', fontSize: '0.875rem' }} 
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '130px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 12px' }}>
                    <FileText size={16} color="var(--color-text-muted)" />
                    <input 
                        type="text" 
                        placeholder="Bill No / Inv..." 
                        value={billNo} 
                        onChange={(e) => setBillNo(e.target.value)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', outline: 'none', width: '100%', fontSize: '0.875rem' }} 
                    />
                </div>

                <div className="form-group" style={{ margin: 0, minWidth: '140px' }}>
                    <select 
                        className="form-control" 
                        value={paymentStatusFilter} 
                        onChange={(e) => setPaymentStatusFilter(e.target.value)} 
                        style={{ padding: '8px 12px', height: 'auto', fontSize: '0.875rem' }}
                    >
                        <option value="">All Payments</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
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
                    {(cargoName || partyName || billNo || paymentStatusFilter || startDate || endDate) && (
                        <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => { setCargoName(''); setPartyName(''); setBillNo(''); setPaymentStatusFilter(''); setStartDate(''); setEndDate(''); }}
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

            {/* Main Table */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                    <div className="spinner"></div>
                </div>
            ) : logs.length === 0 ? (
                <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <Truck size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>No cargo logs found matching the filters.</p>
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
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Cargo Name</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Party Name</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Rolls/Boxes</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Amount</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Phone No</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Bill / Ref No</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Payment</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Added By</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s', background: selectedIds.includes(log.id) ? 'rgba(99,102,241,0.05)' : '' }} className="table-row-hover">
                                    <td style={{ padding: '14px 18px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(log.id)}
                                            onChange={() => toggleSelectOne(log.id)}
                                            style={{ accentColor: 'var(--color-accent)', width: '15px', height: '15px', cursor: 'pointer' }}
                                        />
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: '500' }}>
                                        {log.date ? new Date(log.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: '600' }}>
                                        {log.cargo_name}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: '550' }}>
                                        {log.party_name || '—'}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                        {log.part_count || '—'}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--color-accent)', fontWeight: '700' }}>
                                        {log.amount ? `₹${parseFloat(log.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                        {log.phone_no ? (
                                            <a href={`tel:${log.phone_no}`} style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                                                <Phone size={12} color="var(--color-text-muted)" /> {log.phone_no}
                                            </a>
                                        ) : '—'}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: '500' }}>
                                        {log.bill_no ? (
                                            <span style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                                {log.bill_no}
                                            </span>
                                        ) : '—'}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        {log.payment_status === 'paid' ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                <Check size={12} /> Paid
                                            </span>
                                        ) : (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(244, 63, 94, 0.12)', color: 'var(--color-danger)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                <Clock size={12} /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                                        {log.creator?.name || 'System'}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                            {log.payment_status !== 'paid' && (
                                                <button onClick={() => handleMarkPaid(log)} className="btn btn-success btn-sm" style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '3px' }} title="Mark as Paid">
                                                    <Check size={12} /> <span style={{ fontSize: '0.72rem', fontWeight: '700' }}>Paid</span>
                                                </button>
                                            )}
                                            <button onClick={() => openEdit(log)} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }}>
                                                <Pencil size={13} />
                                            </button>
                                            {user?.role === 'admin' && (
                                                <button onClick={() => handleDelete(log)} className="btn btn-danger btn-sm" style={{ padding: '6px 10px' }}>
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
                    <form className="modal-content" onSubmit={handleSubmit} style={{ maxWidth: '520px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Truck size={18} color="var(--color-accent)" />
                                {editTarget ? 'Edit Cargo Log Update' : 'Log New Cargo Shipment'}
                            </h3>
                            <button type="button" className="modal-close-btn" onClick={() => setModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Date</label>
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
                                    <label className="form-label">Cargo Co. / Transport</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="e.g., S.S Transport"
                                        value={form.cargo_name} 
                                        onChange={(e) => setForm({ ...form, cargo_name: e.target.value })} 
                                        required 
                                        disabled={submitting} 
                                    />
                                    {errors.cargo_name && <span className="error-text">{errors.cargo_name[0]}</span>}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Party / Handled By</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Receiver or contact person"
                                        value={form.party_name} 
                                        onChange={(e) => setForm({ ...form, party_name: e.target.value })} 
                                        disabled={submitting} 
                                    />
                                    {errors.party_name && <span className="error-text">{errors.party_name[0]}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Package Counts</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="e.g., 4 rolls, 1 box"
                                        value={form.part_count} 
                                        onChange={(e) => setForm({ ...form, part_count: e.target.value })} 
                                        disabled={submitting} 
                                    />
                                    {errors.part_count && <span className="error-text">{errors.part_count[0]}</span>}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Amount / Freight Charge (₹)</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        min="0"
                                        placeholder="0.00 (optional)"
                                        className="form-control" 
                                        value={form.amount} 
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })} 
                                        disabled={submitting} 
                                    />
                                    {errors.amount && <span className="error-text">{errors.amount[0]}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone No</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Cargo/driver contact"
                                        value={form.phone_no} 
                                        onChange={(e) => setForm({ ...form, phone_no: e.target.value })} 
                                        disabled={submitting} 
                                    />
                                    {errors.phone_no && <span className="error-text">{errors.phone_no[0]}</span>}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Bill / Waybill / Invoice No</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Enter reference bill number"
                                        value={form.bill_no} 
                                        onChange={(e) => setForm({ ...form, bill_no: e.target.value })} 
                                        disabled={submitting} 
                                    />
                                    {errors.bill_no && <span className="error-text">{errors.bill_no[0]}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Payment Status</label>
                                    <select 
                                        className="form-control" 
                                        value={form.payment_status} 
                                        onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
                                        disabled={submitting}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                    {errors.payment_status && <span className="error-text">{errors.payment_status[0]}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Additional notes (Optional)</label>
                                <textarea 
                                    className="form-control" 
                                    placeholder="Enter driver details, vehicle number, delivery status, etc."
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
                                {submitting ? 'Saving...' : 'Save Cargo Entry'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CargoLog;
