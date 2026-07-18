import React, { useState, useEffect } from 'react';
import { useAuth, apiFetch } from '../Contexts/AuthContext';
import { CheckSquare, Plus, X, Calendar, Trash2, Check } from 'lucide-react';

const Tasks = () => {
    const { showToast } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [form, setForm] = useState({ title: '', description: '', due_date: new Date().toISOString().split('T')[0] });

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/tasks');
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTasks(); }, []);

    const handleToggle = async (task) => {
        try {
            const res = await apiFetch(`/api/tasks/${task.id}/toggle`, {
                method: 'PUT'
            });
            if (res.ok) {
                const newStatus = task.status === 'completed' ? 'pending' : 'completed';
                showToast(`Task marked as ${newStatus}!`, 'success');
                fetchTasks();
            }
        } catch (error) {
            showToast('Failed to update task.', 'error');
        }
    };

    const handleDelete = async (taskId) => {
        try {
            const res = await apiFetch(`/api/tasks/${taskId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast('Task deleted.', 'success');
                fetchTasks();
            }
        } catch (error) {
            showToast('Failed to delete task.', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await apiFetch('/api/tasks', {
                method: 'POST',
                body: JSON.stringify(form)
            });
            if (res.ok) {
                showToast('Task reminder added!', 'success');
                setForm({ title: '', description: '', due_date: new Date().toISOString().split('T')[0] });
                setModalOpen(false);
                fetchTasks();
            } else {
                showToast('Failed to create task.', 'error');
            }
        } catch (error) {
            showToast('Network error.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const isOverdue = (dueDate, status) => {
        if (status === 'completed') return false;
        return new Date(dueDate) < new Date(new Date().toDateString());
    };

    const filteredTasks = statusFilter
        ? tasks.filter(t => t.status === statusFilter)
        : tasks;

    const pendingCount = tasks.filter(t => t.status === 'pending').length;
    const overdueCount = tasks.filter(t => isOverdue(t.due_date, t.status)).length;

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Track pending follow-ups, collections, supplier confirmations, and other daily reminders.
                </p>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                    <Plus size={18} />
                    <span>Add Task</span>
                </button>
            </div>

            {/* Task Stats */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div className="card" style={{ flex: 1, minWidth: '160px', padding: '16px 20px' }}>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginBottom: '6px' }}>Pending Tasks</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{pendingCount}</div>
                </div>
                <div className="card" style={{ flex: 1, minWidth: '160px', padding: '16px 20px' }}>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginBottom: '6px' }}>Overdue</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: overdueCount > 0 ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>{overdueCount}</div>
                </div>
                <div className="card" style={{ flex: 1, minWidth: '160px', padding: '16px 20px' }}>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginBottom: '6px' }}>Completed</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-success)' }}>
                        {tasks.filter(t => t.status === 'completed').length}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {['', 'pending', 'completed'].map(status => (
                    <button
                        key={status}
                        className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setStatusFilter(status)}
                    >
                        {status === '' ? 'All Tasks' : status === 'pending' ? '⏳ Pending' : '✓ Completed'}
                    </button>
                ))}
            </div>

            {/* Task List */}
            <div className="card">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <div className="spinner"></div>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        {statusFilter === 'completed' ? 'No completed tasks yet.' : 'No tasks here. Add your first reminder!'}
                    </div>
                ) : (
                    <div className="task-list">
                        {filteredTasks.map((task) => {
                            const overdue = isOverdue(task.due_date, task.status);
                            return (
                                <div key={task.id} className={`task-item ${task.status}`}>
                                    <div className="task-checkbox-container">
                                        <div
                                            className={`task-checkbox ${task.status === 'completed' ? 'checked' : ''}`}
                                            onClick={() => handleToggle(task)}
                                            title={task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                                        >
                                            {task.status === 'completed' && <Check size={12} />}
                                        </div>
                                    </div>
                                    <div className="task-details">
                                        <div className="task-title">{task.title}</div>
                                        {task.description && (
                                            <p className="task-description">{task.description}</p>
                                        )}
                                        <div className="task-meta">
                                            <span className={`task-due ${overdue ? 'overdue' : ''}`}>
                                                <Calendar size={12} />
                                                {overdue ? 'Overdue · ' : ''}
                                                {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <span style={{ color: 'var(--color-text-muted)' }}>·</span>
                                            <span style={{ color: 'var(--color-text-muted)' }}>{task.user?.name}</span>
                                            {task.status === 'completed' && task.completed_at && (
                                                <>
                                                    <span style={{ color: 'var(--color-text-muted)' }}>·</span>
                                                    <span style={{ color: 'var(--color-success)', fontSize: '0.75rem' }}>
                                                        Completed {new Date(task.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="task-actions">
                                        <button
                                            className="task-delete-btn"
                                            onClick={() => handleDelete(task.id)}
                                            title="Delete task"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Task Modal */}
            {modalOpen && (
                <div className="modal-overlay">
                    <form className="modal-content" onSubmit={handleSubmit}>
                        <div className="modal-header">
                            <h3 className="modal-title">Add Task / Reminder</h3>
                            <button type="button" className="modal-close-btn" onClick={() => setModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Task Title</label>
                                <input type="text" className="form-control" placeholder="e.g., Collect balance payment from Roy Interiors" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Task Details (Optional)</label>
                                <textarea className="form-control" placeholder="Additional instructions, phone numbers, or reference notes..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Due Date</label>
                                <input type="date" className="form-control" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
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

export default Tasks;
