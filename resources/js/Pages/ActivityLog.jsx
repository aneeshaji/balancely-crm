import React, { useState, useEffect } from 'react';
import { useAuth, apiFetch } from '../Contexts/AuthContext';
import { BookOpen, Search, Filter, Calendar, Plus, X } from 'lucide-react';

const ActivityLog = () => {
    const { showToast } = useAuth();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [staffList, setStaffList] = useState([]);

    // Filter states
    const [typeFilter, setTypeFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [activityForm, setActivityForm] = useState({ type: 'internal_note', details: '', reference_number: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (typeFilter) params.append('type', typeFilter);
            if (userFilter) params.append('user_id', userFilter);
            if (dateFilter) params.append('date', dateFilter);
            if (searchFilter) params.append('search', searchFilter);

            const res = await fetch(`/api/activities?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setActivities(data);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const res = await fetch('/api/staff');
            if (res.ok) {
                const data = await res.json();
                setStaffList(data);
            }
        } catch (e) {
            // Silence if user is not admin (endpoint is gated)
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [typeFilter, userFilter, dateFilter, searchFilter]);

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleCreateLog = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await apiFetch('/api/activities', {
                method: 'POST',
                body: JSON.stringify(activityForm)
            });
            if (res.ok) {
                showToast('Activity successfully logged!', 'success');
                setActivityForm({ type: 'internal_note', details: '', reference_number: '' });
                setModalOpen(false);
                fetchActivities();
            } else {
                showToast('Failed to log activity.', 'error');
            }
        } catch (error) {
            showToast('Network error.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const clearFilters = () => {
        setTypeFilter('');
        setUserFilter('');
        setDateFilter('');
        setSearchFilter('');
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    View and search daily operational notes, supplier followups, and drawer counts logged by shop accountants.
                </p>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                    <Plus size={18} />
                    <span>Log New Activity</span>
                </button>
            </div>

            {/* Filters Bar */}
            <div className="filters-bar">
                <div className="filter-item">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Search size={14} /> Search Details
                    </label>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search logs, reference IDs..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        style={{ padding: '8px 12px' }}
                    />
                </div>

                <div className="filter-item">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Filter size={14} /> Category
                    </label>
                    <select 
                        className="form-control"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        style={{ padding: '8px 12px' }}
                    >
                        <option value="">All Categories</option>
                        <option value="supplier_followup">Supplier Follow-up</option>
                        <option value="customer_inquiry">Customer Inquiry</option>
                        <option value="reconciliation">Bank Statement Reconciliation</option>
                        <option value="cash_reconciliation">Cash Drawer Verification</option>
                        <option value="expense_payment">Expense / Invoices</option>
                        <option value="internal_note">Internal / Handover Notes</option>
                    </select>
                </div>

                {staffList.length > 0 && (
                    <div className="filter-item">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            Accountant
                        </label>
                        <select 
                            className="form-control"
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                            style={{ padding: '8px 12px' }}
                        >
                            <option value="">All Staff</option>
                            {staffList.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="filter-item">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} /> Date
                    </label>
                    <input 
                        type="date" 
                        className="form-control"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        style={{ padding: '8px 12px' }}
                    />
                </div>

                <div style={{ alignSelf: 'flex-end' }}>
                    <button className="btn btn-secondary btn-sm" onClick={clearFilters} style={{ height: '38px' }}>
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* List / Timeline */}
            <div className="card">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <div className="spinner"></div>
                    </div>
                ) : activities.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No activity logs found matching the selected filters.
                    </div>
                ) : (
                    <div className="activity-timeline">
                        {activities.map((act) => (
                            <div key={act.id} className={`activity-card ${act.type}`}>
                                <div className="activity-type-icon">
                                    <BookOpen size={16} />
                                </div>
                                <div className="activity-content">
                                    <div className="activity-meta">
                                        <span className="activity-author">{act.user?.name}</span>
                                        <span>•</span>
                                        <span>
                                            {new Date(act.logged_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })} at {new Date(act.logged_at).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        <span>•</span>
                                        <span style={{ textTransform: 'capitalize' }}>
                                            {act.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="activity-desc">{act.details}</p>
                                    {act.reference_number && (
                                        <div className="activity-ref">
                                            <span>Reference: {act.reference_number}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Log Activity Modal */}
            {modalOpen && (
                <div className="modal-overlay">
                    <form className="modal-content" onSubmit={handleCreateLog}>
                        <div className="modal-header">
                            <h3 className="modal-title">Log Daily Activity</h3>
                            <button type="button" className="modal-close-btn" onClick={() => setModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Activity Category</label>
                                <select 
                                    className="form-control"
                                    value={activityForm.type}
                                    onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                                >
                                    <option value="internal_note">Internal Note / Hand-over</option>
                                    <option value="supplier_followup">Supplier Delivery Follow-up</option>
                                    <option value="customer_inquiry">Customer Order / Balance Inquiry</option>
                                    <option value="cash_reconciliation">Cash Drawer Count / Verification</option>
                                    <option value="reconciliation">Bank Statement Reconciliation</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Detailed Notes</label>
                                <textarea 
                                    className="form-control"
                                    placeholder="Provide details..."
                                    value={activityForm.details}
                                    onChange={(e) => setActivityForm({ ...activityForm, details: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Reference ID (Optional)</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    placeholder="Invoice #, PO #, Drawer #, etc."
                                    value={activityForm.reference_number}
                                    onChange={(e) => setActivityForm({ ...activityForm, reference_number: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Log Activity'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default ActivityLog;
