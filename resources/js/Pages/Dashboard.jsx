import React, { useState, useEffect } from 'react';
import { useAuth, apiFetch } from '../Contexts/AuthContext';
import { 
    TrendingUp, 
    TrendingDown, 
    Wallet, 
    BookOpen, 
    CheckCircle, 
    Plus, 
    X,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

const Dashboard = ({ setCurrentTab }) => {
    const { user, showToast } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentActivities, setRecentActivities] = useState([]);
    
    // Modal states
    const [activeModal, setActiveModal] = useState(null); // 'activity', 'transaction', 'task'
    const [categories, setCategories] = useState([]);
    const [activityForm, setActivityForm] = useState({ type: 'internal_note', details: '', reference_number: '' });
    const [transactionForm, setTransactionForm] = useState({ type: 'inflow', amount: '', category_id: '', category: '', description: '', transaction_date: new Date().toISOString().split('T')[0] });
    const [taskForm, setTaskForm] = useState({ title: '', description: '', due_date: new Date().toISOString().split('T')[0] });
    const [submitting, setSubmitting] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const statsRes = await fetch('/api/dashboard/stats');
            const recentActRes = await fetch('/api/activities?limit=5');
            
            if (statsRes.ok && recentActRes.ok) {
                const statsData = await statsRes.json();
                const recentActData = await recentActRes.json();
                setStats(statsData);
                setRecentActivities(recentActData.slice(0, 5));
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        apiFetch('/api/categories').then(r => r.json()).then(data => setCategories(Array.isArray(data) ? data : []));
    }, []);

    const handleActivitySubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await apiFetch('/api/activities', {
                method: 'POST',
                body: JSON.stringify(activityForm)
            });
            if (res.ok) {
                showToast('Activity logged successfully!', 'success');
                setActivityForm({ type: 'internal_note', details: '', reference_number: '' });
                setActiveModal(null);
                fetchDashboardData();
            } else {
                showToast('Failed to log activity.', 'error');
            }
        } catch (error) {
            showToast('Network error.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await apiFetch('/api/transactions', {
                method: 'POST',
                body: JSON.stringify(transactionForm)
            });
            if (res.ok) {
                showToast('Transaction recorded!', 'success');
                setTransactionForm({ type: 'inflow', amount: '', category_id: '', category: '', description: '', transaction_date: new Date().toISOString().split('T')[0] });
                setActiveModal(null);
                fetchDashboardData();
            } else {
                showToast('Failed to record transaction.', 'error');
            }
        } catch (error) {
            showToast('Network error.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await apiFetch('/api/tasks', {
                method: 'POST',
                body: JSON.stringify(taskForm)
            });
            if (res.ok) {
                showToast('New reminder task assigned!', 'success');
                setTaskForm({ title: '', description: '', due_date: new Date().toISOString().split('T')[0] });
                setActiveModal(null);
                fetchDashboardData();
            } else {
                showToast('Failed to create task.', 'error');
            }
        } catch (error) {
            showToast('Network error.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner spinner-lg"></div>
            </div>
        );
    }

    // SVG Chart configuration
    const chartData = stats?.chart_data || [];
    const maxVal = Math.max(...chartData.map(d => Math.max(d.inflow, d.outflow)), 1000);
    const heightScale = 140 / maxVal;

    return (
        <>
            {/* Quick Stats Grid */}
            <div className="stats-grid">
                <div className="card stat-card inflow">
                    <div className="stat-header">
                        <span>Today's Cash Inflow</span>
                        <div className="stat-icon"><TrendingUp size={16} /></div>
                    </div>
                    <div className="stat-value">₹{stats?.today_inflow?.toFixed(2)}</div>
                    <div className="stat-footer">Daily sales and receivables</div>
                </div>

                <div className="card stat-card outflow">
                    <div className="stat-header">
                        <span>Today's Cash Outflow</span>
                        <div className="stat-icon"><TrendingDown size={16} /></div>
                    </div>
                    <div className="stat-value">₹{stats?.today_outflow?.toFixed(2)}</div>
                    <div className="stat-footer">Supplier payments & general expenses</div>
                </div>

                <div className="card stat-card net">
                    <div className="stat-header">
                        <span>Today's Net Cash</span>
                        <div className="stat-icon"><Wallet size={16} /></div>
                    </div>
                    <div className="stat-value" style={{ color: stats?.net_change >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {stats?.net_change >= 0 ? '+' : ''}₹{stats?.net_change?.toFixed(2)}
                    </div>
                    <div className="stat-footer">Total current cash balance flow</div>
                </div>

                <div className="card stat-card">
                    <div className="stat-header">
                        <span>Today's Logged Activities</span>
                        <div className="stat-icon"><BookOpen size={16} color="var(--color-accent)" /></div>
                    </div>
                    <div className="stat-value">{stats?.activities_count_today}</div>
                    <div className="stat-footer">Recorded actions by staff</div>
                </div>

                <div className="card stat-card">
                    <div className="stat-header">
                        <span>Active Reminders</span>
                        <div className="stat-icon"><CheckCircle size={16} color="var(--color-warning)" /></div>
                    </div>
                    <div className="stat-value">{stats?.pending_tasks_count}</div>
                    <div className="stat-footer">Tasks awaiting completion</div>
                </div>
            </div>

            {/* Main Section */}
            <div className="dashboard-layout">
                {/* 7-Day Financial Trend Chart */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="card-header">
                        <h3 className="card-title">7-Day Financial Transactions Chart</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-success)', borderRadius: '2px' }}></span> Inflows
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-danger)', borderRadius: '2px' }}></span> Outflows
                            </span>
                        </span>
                    </div>

                    <div className="chart-container">
                        <svg className="chart-svg" viewBox="0 0 700 180">
                            {/* Y-Axis lines and numbers */}
                            <line x1="40" y1="20" x2="680" y2="20" stroke="var(--border-subtle)" strokeDasharray="4" />
                            <line x1="40" y1="90" x2="680" y2="90" stroke="var(--border-subtle)" strokeDasharray="4" />
                            <line x1="40" y1="160" x2="680" y2="160" stroke="var(--border-subtle)" />
                            
                            <text x="30" y="25" fill="var(--color-text-muted)" fontSize="10" textAnchor="end">₹{maxVal}</text>
                            <text x="30" y="95" fill="var(--color-text-muted)" fontSize="10" textAnchor="end">₹{(maxVal / 2).toFixed(0)}</text>
                            <text x="30" y="165" fill="var(--color-text-muted)" fontSize="10" textAnchor="end">₹0</text>

                            {/* Rendering Bars */}
                            {chartData.map((d, index) => {
                                const xBase = 60 + index * 90;
                                const barWidth = 24;
                                
                                const inflowHeight = d.inflow * heightScale;
                                const outflowHeight = d.outflow * heightScale;
                                
                                return (
                                    <g key={d.date}>
                                        {/* Inflow bar */}
                                        <rect 
                                            x={xBase} 
                                            y={160 - inflowHeight} 
                                            width={barWidth} 
                                            height={inflowHeight} 
                                            fill="var(--color-success)" 
                                            rx="3"
                                            opacity="0.85"
                                        />
                                        
                                        {/* Outflow bar */}
                                        <rect 
                                            x={xBase + barWidth + 6} 
                                            y={160 - outflowHeight} 
                                            width={barWidth} 
                                            height={outflowHeight} 
                                            fill="var(--color-danger)" 
                                            rx="3"
                                            opacity="0.85"
                                        />

                                        {/* X Axis Labels */}
                                        <text 
                                            x={xBase + barWidth + 3} 
                                            y="178" 
                                            fill="var(--color-text-secondary)" 
                                            fontSize="9" 
                                            textAnchor="middle"
                                        >
                                            {d.label.split(',')[0]}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: '20px' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button className="btn btn-primary" onClick={() => setActiveModal('activity')}>
                            <Plus size={18} />
                            <span>Log Daily Activity</span>
                        </button>
                        <button className="btn btn-success" onClick={() => setActiveModal('transaction')}>
                            <Plus size={18} />
                            <span>Record Transaction</span>
                        </button>
                        <button className="btn btn-secondary" onClick={() => setActiveModal('task')} style={{ justifyContent: 'center' }}>
                            <Plus size={18} />
                            <span>Add Task Reminder</span>
                        </button>
                    </div>

                    <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>Account Staff Guide</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                            Record details of custom customer inquiries, delays in inventory shipments, drawer balance reconciliation, or client callbacks daily. All logged actions populate the audit trails for inventory and billing.
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Activities Section */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Recent Activity History</h3>
                    <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => setCurrentTab('activities')}
                    >
                        View All logs
                    </button>
                </div>
                
                <div className="activity-timeline">
                    {recentActivities.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            No activities logged today yet. Use "Log Daily Activity" to start.
                        </div>
                    ) : (
                        recentActivities.map((act) => (
                            <div key={act.id} className={`activity-card ${act.type}`}>
                                <div className="activity-type-icon">
                                    <BookOpen size={16} />
                                </div>
                                <div className="activity-content">
                                    <div className="activity-meta">
                                        <span className="activity-author">{act.user?.name}</span>
                                        <span>•</span>
                                        <span>{new Date(act.logged_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span>•</span>
                                        <span style={{ textTransform: 'capitalize' }}>
                                            {act.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="activity-desc">{act.details}</p>
                                    {act.reference_number && (
                                        <div className="activity-ref">
                                            <span>Ref: {act.reference_number}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- Modals --- */}
            {activeModal === 'activity' && (
                <div className="modal-overlay">
                    <form className="modal-content" onSubmit={handleActivitySubmit}>
                        <div className="modal-header">
                            <h3 className="modal-title">Log Daily Activity</h3>
                            <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}><X size={20} /></button>
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
                                    placeholder="Enter details of what occurred..."
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
                                    placeholder="Invoice #, PO #, Drawer ID, etc."
                                    value={activityForm.reference_number}
                                    onChange={(e) => setActivityForm({ ...activityForm, reference_number: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Log Activity'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeModal === 'transaction' && (
                <div className="modal-overlay">
                    <form className="modal-content" onSubmit={handleTransactionSubmit}>
                        <div className="modal-header">
                            <h3 className="modal-title">Record Day Book Transaction</h3>
                            <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Transaction Type</label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flexGrow: 1, padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
                                        <input 
                                            type="radio" 
                                            name="tx_type" 
                                            value="inflow"
                                            checked={transactionForm.type === 'inflow'}
                                            onChange={() => setTransactionForm({ ...transactionForm, type: 'inflow', category_id: '', category: '' })}
                                        />
                                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Inflow (Income)</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flexGrow: 1, padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
                                        <input 
                                            type="radio" 
                                            name="tx_type" 
                                            value="outflow"
                                            checked={transactionForm.type === 'outflow'}
                                            onChange={() => setTransactionForm({ ...transactionForm, type: 'outflow', category_id: '', category: '' })}
                                        />
                                        <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>Outflow (Expense)</span>
                                    </label>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Amount (₹)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    min="0.01"
                                    className="form-control"
                                    placeholder="0.00"
                                    value={transactionForm.amount}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select 
                                    className="form-control"
                                    value={transactionForm.category_id}
                                    onChange={(e) => {
                                        const cat = categories.find(c => String(c.id) === e.target.value);
                                        setTransactionForm({ ...transactionForm, category_id: e.target.value, category: cat ? cat.name : '' });
                                    }}
                                    required
                                >
                                    <option value="">-- Select Category --</option>
                                    {categories.filter(c => c.type === transactionForm.type).map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description / Remarks</label>
                                <input 
                                    type="text"
                                    className="form-control"
                                    placeholder="Details of client, items sold, or supplier bill ID..."
                                    value={transactionForm.description}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Transaction Date</label>
                                <input 
                                    type="date"
                                    className="form-control"
                                    value={transactionForm.transaction_date}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, transaction_date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                            <button type="submit" className="btn btn-success" disabled={submitting}>
                                {submitting ? 'Recording...' : 'Record Transaction'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeModal === 'task' && (
                <div className="modal-overlay">
                    <form className="modal-content" onSubmit={handleTaskSubmit}>
                        <div className="modal-header">
                            <h3 className="modal-title">Add Task / Reminder</h3>
                            <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Task Title</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    placeholder="e.g., Follow up check collection with Roy Interiors"
                                    value={taskForm.title}
                                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Task Details (Optional)</label>
                                <textarea 
                                    className="form-control"
                                    placeholder="Enter specific instructions or phone numbers..."
                                    value={taskForm.description}
                                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Due Date</label>
                                <input 
                                    type="date"
                                    className="form-control"
                                    value={taskForm.due_date}
                                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create Task'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default Dashboard;
