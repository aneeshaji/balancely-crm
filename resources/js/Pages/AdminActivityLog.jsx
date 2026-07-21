import React, { useState, useEffect } from 'react';
import { useAuth, apiFetch } from '../Contexts/AuthContext';
import { 
    History, Search, Calendar, Trash2, X, Eye, 
    User, AlertTriangle, ShieldCheck, Database, Server, Info, ArrowLeft, ArrowRight
} from 'lucide-react';

const AdminActivityLog = () => {
    const { showToast } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [staffList, setStaffList] = useState([]);

    // Filter states
    const [groupFilter, setGroupFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');
    const [page, setPage] = useState(1);

    // Pagination metadata
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
        from: 0,
        to: 0
    });

    // Modals
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    
    const [purgeModalOpen, setPurgeModalOpen] = useState(false);
    const [purgeRetention, setPurgeRetention] = useState('30');
    const [purging, setPurging] = useState(false);

    // Stats calculations
    const [stats, setStats] = useState({
        total: 0,
        authCount: 0,
        crudCount: 0,
        errorCount: 0
    });

    const fetchLogs = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', pageNumber);
            if (groupFilter) params.append('event_group', groupFilter);
            if (userFilter) params.append('user_id', userFilter);
            if (dateFilter) params.append('date', dateFilter);
            if (searchFilter) params.append('search', searchFilter);

            const res = await apiFetch(`/api/audit-logs?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data.data || []);
                setPagination({
                    currentPage: data.current_page || 1,
                    lastPage: data.last_page || 1,
                    total: data.total || 0,
                    from: data.from || 0,
                    to: data.to || 0
                });
            }
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            showToast('Failed to fetch audit logs.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const res = await apiFetch('/api/staff');
            if (res.ok) {
                const data = await res.json();
                setStaffList(data || []);
            }
        } catch (error) {
            console.error('Error fetching staff list:', error);
        }
    };

    const fetchStats = async () => {
        try {
            // Load all stats in a single fetch using query parameter options
            // Note: Since index is paginated, we do separate lightweight counts or get them from total
            // For now, we will perform counts on the fetched page or provide estimated stats.
            // Let's call index with group filter to compute counts for stats cards, or calculate based on database.
            // A cleaner way is to load count summaries directly. To keep it simple and clean, let's fetch count data.
            const fetchCount = async (group) => {
                const res = await apiFetch(`/api/audit-logs?event_group=${group}&per_page=1`);
                if (res.ok) {
                    const data = await res.json();
                    return data.total || 0;
                }
                return 0;
            };

            const [auth, crud, error, total] = await Promise.all([
                fetchCount('auth'),
                fetchCount('crud'),
                fetchCount('error'),
                apiFetch('/api/audit-logs?per_page=1').then(r => r.ok ? r.json() : {}).then(d => d.total || 0)
            ]);

            setStats({
                total,
                authCount: auth,
                crudCount: crud,
                errorCount: error
            });
        } catch (e) {
            console.error("Failed to load statistics summary", e);
        }
    };

    useEffect(() => {
        fetchStaff();
        fetchStats();
    }, []);

    useEffect(() => {
        setPage(1);
        fetchLogs(1);
    }, [groupFilter, userFilter, dateFilter]);

    // Handle search query with debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            setPage(1);
            fetchLogs(1);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchFilter]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.lastPage) {
            setPage(newPage);
            fetchLogs(newPage);
        }
    };

    const handlePurgeLogs = async (e) => {
        e.preventDefault();
        setPurging(true);
        try {
            const res = await apiFetch('/api/audit-logs', {
                method: 'DELETE',
                body: JSON.stringify({ retention: purgeRetention })
            });
            const data = await res.json();
            if (res.ok) {
                showToast(data.message, 'success');
                setPurgeModalOpen(false);
                fetchLogs(1);
                fetchStats();
            } else {
                showToast(data.message || 'Failed to clear audit logs.', 'error');
            }
        } catch (error) {
            showToast('Network error while clearing logs.', 'error');
        } finally {
            setPurging(false);
        }
    };

    const getEventBadgeClass = (eventType) => {
        if (eventType.startsWith('auth.login_failed') || eventType === 'system.error') {
            return 'badge-outflow'; // Red
        }
        if (eventType.startsWith('auth.')) {
            return 'badge-inflow'; // Green
        }
        if (eventType.endsWith('.created')) {
            return 'badge-inflow';
        }
        if (eventType.endsWith('.updated')) {
            return 'badge-type'; // Accent/Indigo
        }
        if (eventType.endsWith('.deleted')) {
            return 'badge-outflow';
        }
        return 'badge-outflow'; // Gray or secondary fallback
    };

    const clearFilters = () => {
        setGroupFilter('');
        setUserFilter('');
        setDateFilter('');
        setSearchFilter('');
    };

    return (
        <div style={{ padding: '28px' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>System Audit & Error Logs</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        Track and audit all backend events, user login actions, database CRUD operations, and system/database errors.
                    </p>
                </div>
                <div>
                    <button className="btn btn-secondary" onClick={() => setPurgeModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        <Trash2 size={16} />
                        <span>Purge Audit Logs</span>
                    </button>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-accent)', borderRadius: '10px' }}>
                        <History size={24} />
                    </div>
                    <div>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', fontWeight: '600', textTransform: 'uppercase' }}>Total Audit Entries</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                            {stats.total.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '10px' }}>
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', fontWeight: '600', textTransform: 'uppercase' }}>Auth Logs</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#22c55e' }}>
                            {stats.authCount.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-accent)', borderRadius: '10px' }}>
                        <Database size={24} />
                    </div>
                    <div>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', fontWeight: '600', textTransform: 'uppercase' }}>CRUD Operations</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                            {stats.crudCount.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '10px' }}>
                        <Server size={24} />
                    </div>
                    <div>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', fontWeight: '600', textTransform: 'uppercase' }}>System Errors</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ef4444' }}>
                            {stats.errorCount.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="card" style={{ padding: '18px 24px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 2, minWidth: '220px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 12px' }}>
                    <Search size={16} color="var(--color-text-muted)" />
                    <input 
                        type="text" 
                        placeholder="Search logs description, event types, payloads, IP address..." 
                        value={searchFilter} 
                        onChange={(e) => setSearchFilter(e.target.value)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', outline: 'none', width: '100%', fontSize: '0.875rem' }} 
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 3, justifyContent: 'flex-end' }}>
                    <select
                        className="form-control"
                        value={groupFilter}
                        onChange={(e) => setGroupFilter(e.target.value)}
                        style={{ padding: '8px 12px', width: '160px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '0.875rem' }}
                    >
                        <option value="">All Categories</option>
                        <option value="auth">Auth Events</option>
                        <option value="crud">CRUD Actions</option>
                        <option value="error">System Errors</option>
                    </select>

                    <select
                        className="form-control"
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        style={{ padding: '8px 12px', width: '180px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '0.875rem' }}
                    >
                        <option value="">All Staff</option>
                        {staffList.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                        ))}
                    </select>

                    <input 
                        type="date" 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        style={{ padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '0.875rem' }}
                    />

                    {(groupFilter || userFilter || dateFilter || searchFilter) && (
                        <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={clearFilters}
                            style={{ height: '36px' }}
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Audit Log Table */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                    <div className="spinner"></div>
                </div>
            ) : logs.length === 0 ? (
                <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <History size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>No audit log entries found.</p>
                </div>
            ) : (
                <>
                    <div className="card" style={{ overflowX: 'auto', padding: 0, marginBottom: '16px' }}>
                        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Timestamp</th>
                                    <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>User (Staff)</th>
                                    <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Event Type</th>
                                    <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Description</th>
                                    <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>IP Address</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="table-row-hover">
                                        <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: '500', whiteSpace: 'nowrap' }}>
                                            {new Date(log.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: '600' }}>
                                            {log.user ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <User size={14} color="var(--color-text-muted)" />
                                                    <span>{log.user.name}</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>System / Guest</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.875rem' }}>
                                            <span className={`badge ${getEventBadgeClass(log.event_type)}`} style={{ textTransform: 'none', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                {log.event_type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {log.description}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.825rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                                            {log.ip_address || '—'}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <button 
                                                className="btn btn-secondary btn-sm" 
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
                                                onClick={() => {
                                                    setSelectedLog(log);
                                                    setDetailsModalOpen(true);
                                                }}
                                            >
                                                <Eye size={12} />
                                                <span>Details</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            Showing <strong>{pagination.from}</strong> to <strong>{pagination.to}</strong> of <strong>{pagination.total}</strong> entries
                        </span>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                                className="btn btn-secondary btn-sm" 
                                disabled={page <= 1}
                                onClick={() => handlePageChange(page - 1)}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: page <= 1 ? 0.5 : 1 }}
                            >
                                <ArrowLeft size={14} /> Previous
                            </button>
                            <span style={{ alignSelf: 'center', fontSize: '0.875rem', fontWeight: '600', padding: '0 8px' }}>
                                Page {page} of {pagination.lastPage}
                            </span>
                            <button 
                                className="btn btn-secondary btn-sm" 
                                disabled={page >= pagination.lastPage}
                                onClick={() => handlePageChange(page + 1)}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: page >= pagination.lastPage ? 0.5 : 1 }}
                            >
                                Next <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Log Details Modal */}
            {detailsModalOpen && selectedLog && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '650px', width: '90%' }}>
                        <div className="modal-header">
                            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Info size={20} color="var(--color-accent)" />
                                <span>Audit Log Details</span>
                            </h3>
                            <button type="button" className="modal-close-btn" onClick={() => {
                                setDetailsModalOpen(false);
                                setSelectedLog(null);
                            }}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-main)', padding: '12px', borderRadius: '8px', fontSize: '0.875rem' }}>
                                <div>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block' }}>Timestamp</span>
                                    <strong>{new Date(selectedLog.created_at).toLocaleString('en-IN')}</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block' }}>User (Staff)</span>
                                    <strong>{selectedLog.user ? selectedLog.user.name : 'System / Guest'}</strong>
                                </div>
                                <div style={{ marginTop: '4px' }}>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block' }}>Event Type</span>
                                    <span className={`badge ${getEventBadgeClass(selectedLog.event_type)}`} style={{ textTransform: 'none', fontFamily: 'monospace' }}>
                                        {selectedLog.event_type}
                                    </span>
                                </div>
                                <div style={{ marginTop: '4px' }}>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block' }}>IP / Browser Agent</span>
                                    <strong style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{selectedLog.ip_address || '—'}</strong>
                                </div>
                            </div>

                            <div>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Action Description</span>
                                <p style={{ margin: 0, padding: '10px', background: 'var(--bg-main)', borderLeft: '3px solid var(--color-accent)', borderRadius: '0 6px 6px 0', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                                    {selectedLog.description}
                                </p>
                            </div>

                            {selectedLog.user_agent && (
                                <div>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>User Agent</span>
                                    <div style={{ padding: '8px 12px', background: 'var(--bg-main)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', overflowX: 'auto' }}>
                                        {selectedLog.user_agent}
                                    </div>
                                </div>
                            )}

                            {selectedLog.payload && (
                                <div>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '6px' }}>Payload / Data Payload</span>
                                    
                                    {selectedLog.event_type === 'system.error' ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.05)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                                                <strong>File:</strong> {selectedLog.payload.file} <strong>Line:</strong> {selectedLog.payload.line}
                                            </div>
                                            <pre style={{ 
                                                background: '#1e1e1e', 
                                                color: '#ff6b6b', 
                                                padding: '14px', 
                                                borderRadius: '8px', 
                                                maxHeight: '220px', 
                                                overflowY: 'auto', 
                                                fontSize: '0.78rem', 
                                                fontFamily: 'monospace',
                                                margin: 0,
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-all'
                                            }}>
                                                {selectedLog.payload.trace}
                                            </pre>
                                        </div>
                                    ) : selectedLog.event_type.endsWith('.updated') && selectedLog.payload.changes ? (
                                        <div className="card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border-subtle)' }}>
                                            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                <thead>
                                                    <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-subtle)' }}>
                                                        <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Field</th>
                                                        <th style={{ padding: '8px 12px', textAlign: 'left', color: '#ef4444' }}>Old Value</th>
                                                        <th style={{ padding: '8px 12px', textAlign: 'left', color: '#22c55e' }}>New Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(selectedLog.payload.changes).map(([field, values]) => (
                                                        <tr key={field} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                            <td style={{ padding: '8px 12px', fontWeight: '600' }}>{field}</td>
                                                            <td style={{ padding: '8px 12px', color: '#ef4444', fontStyle: values.old === null ? 'italic' : 'normal', fontFamily: 'monospace' }}>
                                                                {values.old === null ? 'NULL' : String(values.old)}
                                                            </td>
                                                            <td style={{ padding: '8px 12px', color: '#22c55e', fontStyle: values.new === null ? 'italic' : 'normal', fontFamily: 'monospace' }}>
                                                                {values.new === null ? 'NULL' : String(values.new)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <pre style={{ 
                                            background: 'var(--bg-main)', 
                                            padding: '14px', 
                                            borderRadius: '8px', 
                                            maxHeight: '220px', 
                                            overflowY: 'auto', 
                                            fontSize: '0.78rem', 
                                            fontFamily: 'monospace',
                                            margin: 0
                                        }}>
                                            {JSON.stringify(selectedLog.payload, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => {
                                setDetailsModalOpen(false);
                                setSelectedLog(null);
                            }}>Close Details</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Purge Audit Logs Modal */}
            {purgeModalOpen && (
                <div className="modal-overlay">
                    <form className="modal-content" style={{ maxWidth: '450px' }} onSubmit={handlePurgeLogs}>
                        <div className="modal-header">
                            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)' }}>
                                <AlertTriangle size={20} />
                                <span>Confirm Log Purge</span>
                            </h3>
                            <button type="button" className="modal-close-btn" onClick={() => setPurgeModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <p style={{ margin: '0 0 16px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                You are about to clear records from the audit trail database. This action is irreversible.
                            </p>
                            
                            <div className="form-group">
                                <label className="form-label">Purge Option / Retention Policy</label>
                                <select 
                                    className="form-control"
                                    value={purgeRetention}
                                    onChange={(e) => setPurgeRetention(e.target.value)}
                                >
                                    <option value="30">Delete logs older than 30 days</option>
                                    <option value="90">Delete logs older than 90 days</option>
                                    <option value="7">Delete logs older than 7 days</option>
                                    <option value="all">Purge ALL logs (Truncate Table)</option>
                                </select>
                            </div>

                            {purgeRetention === 'all' && (
                                <div style={{ padding: '10px 12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', color: '#ef4444', fontSize: '0.8rem', marginTop: '12px', display: 'flex', gap: '8px' }}>
                                    <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                                    <span><strong>Warning:</strong> Selecting "Purge ALL" will completely empty the audit trail database. Useful diagnostic metrics will be lost.</span>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setPurgeModalOpen(false)}>Cancel</button>
                            <button type="submit" className="btn btn-danger" disabled={purging}>
                                {purging ? 'Purging...' : 'Execute Purge'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminActivityLog;
