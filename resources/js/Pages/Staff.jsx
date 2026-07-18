import React, { useState, useEffect } from 'react';
import { useAuth, apiFetch } from '../Contexts/AuthContext';
import { Users, Plus, X, Shield, User, Briefcase } from 'lucide-react';

const Staff = () => {
    const { user: currentUser, showToast } = useAuth();
    const [staff, setStaff] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff', designation_id: '' });
    const [errors, setErrors] = useState({});

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/staff');
            if (res.ok) {
                const data = await res.json();
                setStaff(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDesignations = async () => {
        try {
            const res = await apiFetch('/api/designations');
            if (res.ok) {
                const data = await res.json();
                setDesignations(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchStaff(); fetchDesignations(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});
        try {
            const res = await apiFetch('/api/staff', {
                method: 'POST',
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (res.ok) {
                showToast(`${form.name} registered as ${form.role}!`, 'success');
                setForm({ name: '', email: '', password: '', role: 'staff', designation_id: '' });
                setModalOpen(false);
                fetchStaff();
            } else {
                setErrors(data.errors || {});
                showToast('Failed to register staff.', 'error');
            }
        } catch (error) {
            showToast('Network error.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'US';

    const adminCount = staff.filter(s => s.role === 'admin').length;
    const staffCount = staff.filter(s => s.role === 'staff').length;

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    View and manage all registered accounts staff members and administrators.
                </p>
                {currentUser?.role === 'admin' && (
                    <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                        <Plus size={18} />
                        <span>Register Staff</span>
                    </button>
                )}
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div className="card" style={{ flex: 1, minWidth: '160px', padding: '16px 20px' }}>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginBottom: '6px' }}>Total Staff</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{staff.length}</div>
                </div>
                <div className="card" style={{ flex: 1, minWidth: '160px', padding: '16px 20px' }}>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginBottom: '6px' }}>Administrators</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-accent)' }}>{adminCount}</div>
                </div>
                <div className="card" style={{ flex: 1, minWidth: '160px', padding: '16px 20px' }}>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginBottom: '6px' }}>Account Staff</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-success)' }}>{staffCount}</div>
                </div>
            </div>

            {/* Staff Directory Grid */}
            {loading ? (
                <div className="loading-overlay"><div className="spinner spinner-lg"></div></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {staff.map((member) => (
                        <div key={member.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                    width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
                                    background: member.role === 'admin'
                                        ? 'linear-gradient(135deg, var(--color-accent), #4f46e5)'
                                        : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '1.1rem',
                                    boxShadow: member.role === 'admin' ? '0 0 15px var(--color-accent-glow)' : 'none'
                                }}>
                                    {getInitials(member.name)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {member.name}
                                        {member.id === currentUser?.id && (
                                            <span style={{ fontSize: '0.65rem', background: 'rgba(99,102,241,0.15)', color: 'var(--color-accent)', padding: '2px 6px', borderRadius: '4px' }}>You</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{member.email}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                <span className={`badge ${member.role === 'admin' ? 'badge-type' : 'badge-inflow'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {member.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                                    {member.role === 'admin' ? 'Administrator' : 'Accounts Staff'}
                                </span>
                                {member.designation && (
                                    <span className="badge badge-outflow" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Briefcase size={11} />{member.designation.name}
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{member.activities_count || 0}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Activities</div>
                                </div>
                                <div style={{ width: '1px', background: 'var(--border-subtle)' }}></div>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{member.transactions_count || 0}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Transactions</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Register Staff Modal */}
            {modalOpen && (
                <div className="modal-overlay">
                    <form className="modal-content" onSubmit={handleSubmit}>
                        <div className="modal-header">
                            <h3 className="modal-title">Register New Staff Member</h3>
                            <button type="button" className="modal-close-btn" onClick={() => setModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input type="text" className="form-control" placeholder="e.g., Priya Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                                {errors.name && <span className="error-text">{errors.name[0]}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input type="email" className="form-control" placeholder="priya@shop.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                                {errors.email && <span className="error-text">{errors.email[0]}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Initial Password</label>
                                <input type="password" className="form-control" placeholder="Min. 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
                                {errors.password && <span className="error-text">{errors.password[0]}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select className="form-control" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                                    <option value="staff">Accounts Staff</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Designation <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(Optional)</span></label>
                                <select className="form-control" value={form.designation_id} onChange={(e) => setForm({ ...form, designation_id: e.target.value })}>
                                    <option value="">-- Select Designation --</option>
                                    {designations.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Registering...' : 'Register Staff'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default Staff;
