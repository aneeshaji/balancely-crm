import React, { useState, useEffect } from 'react';
import { useAuth, apiFetch } from '../Contexts/AuthContext';
import { Receipt, Search, Filter, Calendar, Plus, X, TrendingUp, TrendingDown } from 'lucide-react';

const DayBook = () => {
    const { showToast } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [typeFilter, setTypeFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

    const [form, setForm] = useState({
        type: 'inflow',
        amount: '',
        category_id: '',
        category: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0]
    });

    const fetchCategories = async () => {
        try {
            const res = await apiFetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(Array.isArray(data) ? data : []);
            }
        } catch (error) { console.error(error); }
    };

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (typeFilter) params.append('type', typeFilter);
            if (categoryFilter) params.append('category', categoryFilter);
            if (dateFilter) params.append('date', dateFilter);
            if (searchFilter) params.append('search', searchFilter);

            const res = await fetch(`/api/transactions?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [typeFilter, categoryFilter, dateFilter, searchFilter]);

    useEffect(() => { fetchCategories(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await apiFetch('/api/transactions', {
                method: 'POST',
                body: JSON.stringify(form)
            });
            if (res.ok) {
                showToast('Transaction recorded in Day Book!', 'success');
                setForm({ type: 'inflow', amount: '', category_id: '', category: '', description: '', transaction_date: new Date().toISOString().split('T')[0] });
                setModalOpen(false);
                fetchTransactions();
            } else {
                showToast('Failed to record transaction.', 'error');
            }
        } catch (error) {
            showToast('Network error.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Totals
    const totalInflow = transactions.filter(t => t.type === 'inflow').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalOutflow = transactions.filter(t => t.type === 'outflow').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const netBalance = totalInflow - totalOutflow;

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Day-to-day cash journal tracking all store inflows (customer sales, deposits) and outflows (supplier payments, expenses, wages).
                </p>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                    <Plus size={18} />
                    <span>Record Transaction</span>
                </button>
            </div>

            {/* Summary Tally */}
            <div className="stats-grid">
                <div className="card stat-card inflow">
                    <div className="stat-header">
                        <span>Total Inflow (Filtered)</span>
                        <div className="stat-icon"><TrendingUp size={16} /></div>
                    </div>
                    <div className="stat-value">₹{totalInflow.toFixed(2)}</div>
                    <div className="stat-footer">Across {transactions.filter(t => t.type === 'inflow').length} transactions</div>
                </div>
                <div className="card stat-card outflow">
                    <div className="stat-header">
                        <span>Total Outflow (Filtered)</span>
                        <div className="stat-icon"><TrendingDown size={16} /></div>
                    </div>
                    <div className="stat-value">₹{totalOutflow.toFixed(2)}</div>
                    <div className="stat-footer">Across {transactions.filter(t => t.type === 'outflow').length} transactions</div>
                </div>
                <div className="card stat-card net">
                    <div className="stat-header">
                        <span>Net Balance (Filtered)</span>
                        <div className="stat-icon" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--color-accent)' }}>
                            <Receipt size={16} />
                        </div>
                    </div>
                    <div className="stat-value" style={{ color: netBalance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {netBalance >= 0 ? '+' : ''}₹{netBalance.toFixed(2)}
                    </div>
                    <div className="stat-footer">Inflow minus outflow total</div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="filter-item">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Search size={14} /> Search</label>
                    <input type="text" className="form-control" placeholder="Search description, category..." value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} style={{ padding: '8px 12px' }} />
                </div>
                <div className="filter-item">
                    <label className="form-label"><Filter size={14} style={{ display: 'inline', marginRight: '6px' }} />Type</label>
                    <select className="form-control" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: '8px 12px' }}>
                        <option value="">All Types</option>
                        <option value="inflow">Inflow Only</option>
                        <option value="outflow">Outflow Only</option>
                    </select>
                </div>
                <div className="filter-item">
                    <label className="form-label"><Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />Date</label>
                    <input type="date" className="form-control" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ padding: '8px 12px' }} />
                </div>
                <div style={{ alignSelf: 'flex-end' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setTypeFilter(''); setCategoryFilter(''); setDateFilter(''); setSearchFilter(''); }} style={{ height: '38px' }}>Reset</button>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="card">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <div className="spinner"></div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No transactions found. Record the first Day Book entry.
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Recorded By</th>
                                    <th style={{ textAlign: 'right' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                            {new Date(tx.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td>
                                            <span className={`badge ${tx.type === 'inflow' ? 'badge-inflow' : 'badge-outflow'}`}>
                                                {tx.type === 'inflow' ? '↑ Inflow' : '↓ Outflow'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge badge-type">{tx.category}</span>
                                        </td>
                                        <td style={{ maxWidth: '260px', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{tx.description}</td>
                                        <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{tx.user?.name}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 700, color: tx.type === 'inflow' ? 'var(--color-success)' : 'var(--color-danger)', whiteSpace: 'nowrap' }}>
                                            {tx.type === 'inflow' ? '+' : '-'}₹{parseFloat(tx.amount).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ borderTop: '2px solid var(--border-subtle)' }}>
                                    <td colSpan={5} style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Net Balance</td>
                                    <td style={{ textAlign: 'right', padding: '14px 18px', fontWeight: 700, fontSize: '1.05rem', color: netBalance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                        {netBalance >= 0 ? '+' : ''}₹{netBalance.toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Transaction Modal */}
            {modalOpen && (
                <div className="modal-overlay">
                    <form className="modal-content" onSubmit={handleSubmit}>
                        <div className="modal-header">
                            <h3 className="modal-title">Record Transaction</h3>
                            <button type="button" className="modal-close-btn" onClick={() => setModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Transaction Type</label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {['inflow', 'outflow'].map(t => (
                                        <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexGrow: 1, padding: '10px', background: 'var(--bg-input)', border: `1px solid ${form.type === t ? (t === 'inflow' ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--border-subtle)'}`, borderRadius: '8px', transition: 'all 0.2s' }}>
                                            <input type="radio" name="tx_type" value={t} checked={form.type === t} onChange={() => setForm({ ...form, type: t, category_id: '', category: '' })} />
                                            <span style={{ color: t === 'inflow' ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>{t === 'inflow' ? '↑ Inflow' : '↓ Outflow'}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Amount (₹)</label>
                                    <input type="number" step="0.01" min="0.01" className="form-control" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <input type="date" className="form-control" value={form.transaction_date} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select className="form-control" value={form.category_id}
                                    onChange={e => {
                                        const cat = categories.find(c => String(c.id) === e.target.value);
                                        setForm({ ...form, category_id: e.target.value, category: cat ? cat.name : '' });
                                    }}
                                    required>
                                    <option value="">-- Select Category --</option>
                                    {categories.filter(c => c.type === form.type).map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description / Remarks</label>
                                <input type="text" className="form-control" placeholder="Client name, invoice # or supplier bill details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button type="submit" className={`btn ${form.type === 'inflow' ? 'btn-success' : 'btn-danger'}`} disabled={submitting}>
                                {submitting ? 'Recording...' : `Record ${form.type === 'inflow' ? 'Inflow' : 'Outflow'}`}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default DayBook;
