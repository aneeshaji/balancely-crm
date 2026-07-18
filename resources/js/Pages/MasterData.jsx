import React, { useState, useEffect } from 'react';
import { useAuth, apiFetch } from '../Contexts/AuthContext';
import {
    Tag, Briefcase, Plus, Pencil, Trash2, X, Save, Check,
    TrendingUp, TrendingDown, ChevronDown
} from 'lucide-react';

// ------------ Category Tab ------------ //
const CategoriesTab = ({ showToast }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState({ name: '', type: 'inflow' });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [filterType, setFilterType] = useState('all');

    const fetchCategories = async () => {
        setLoading(true);
        const res = await apiFetch('/api/categories');
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    useEffect(() => { fetchCategories(); }, []);

    const openCreate = () => { setEditTarget(null); setForm({ name: '', type: 'inflow' }); setErrors({}); setModalOpen(true); };
    const openEdit = (cat) => { setEditTarget(cat); setForm({ name: cat.name, type: cat.type }); setErrors({}); setModalOpen(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});
        const url = editTarget ? `/api/categories/${editTarget.id}` : '/api/categories';
        const method = editTarget ? 'PUT' : 'POST';
        const res = await apiFetch(url, { method, body: JSON.stringify(form) });
        const data = await res.json();
        setSubmitting(false);
        if (res.ok) {
            showToast(editTarget ? 'Category updated!' : 'Category created!', 'success');
            setModalOpen(false);
            fetchCategories();
        } else {
            setErrors(data.errors || {});
        }
    };

    const handleDelete = async (cat) => {
        if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
        const res = await apiFetch(`/api/categories/${cat.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
            showToast('Category deleted!', 'success');
            fetchCategories();
        } else {
            showToast(data.message || 'Delete failed', 'error');
        }
    };

    const filtered = filterType === 'all' ? categories : categories.filter(c => c.type === filterType);

    return (
        <div>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                    {['all', 'inflow', 'outflow'].map(t => (
                        <button key={t} onClick={() => setFilterType(t)}
                            className={`btn btn-sm ${filterType === t ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ textTransform: 'capitalize' }}>
                            {t === 'inflow' && <TrendingUp size={13} />}
                            {t === 'outflow' && <TrendingDown size={13} />}
                            {t === 'all' ? 'All' : t}
                        </button>
                    ))}
                </div>
                <button className="btn btn-primary btn-sm" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={15} /> Add Category
                </button>
            </div>

            {/* Category List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>Loading...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                    <Tag size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                    <p>No categories found</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                    {filtered.map(cat => (
                        <div key={cat.id} className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                                    background: cat.type === 'inflow' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {cat.type === 'inflow' ? <TrendingUp size={16} color="var(--color-success)" /> : <TrendingDown size={16} color="var(--color-danger)" />}
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '0.875rem' }}>{cat.name}</p>
                                    <span className={`badge ${cat.type === 'inflow' ? 'badge-inflow' : 'badge-outflow'}`} style={{ marginTop: '2px' }}>
                                        {cat.type}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => openEdit(cat)} className="btn btn-sm btn-secondary" style={{ padding: '5px 8px' }}>
                                    <Pencil size={13} />
                                </button>
                                <button onClick={() => handleDelete(cat)} className="btn btn-sm btn-danger" style={{ padding: '5px 8px' }}>
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '440px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Tag size={16} color="var(--color-accent)" />
                                {editTarget ? 'Edit Category' : 'New Category'}
                            </h3>
                            <button className="modal-close-btn" onClick={() => setModalOpen(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px' }}>
                            <div className="form-group">
                                <label className="form-label">Category Name</label>
                                <input type="text" className="form-control" placeholder="e.g., Customer Sale" value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })} required disabled={submitting} />
                                {errors.name && <span className="error-text">{errors.name[0]}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Type</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {['inflow', 'outflow'].map(t => (
                                        <label key={t} style={{
                                            flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                                            padding: '10px 14px', cursor: 'pointer', borderRadius: '8px',
                                            background: 'var(--bg-input)',
                                            border: `1px solid ${form.type === t ? (t === 'inflow' ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--border-subtle)'}`,
                                            transition: 'all 0.2s'
                                        }}>
                                            <input type="radio" name="cat_type" value={t} checked={form.type === t}
                                                onChange={() => setForm({ ...form, type: t })} />
                                            {t === 'inflow' ? <TrendingUp size={14} color="var(--color-success)" /> : <TrendingDown size={14} color="var(--color-danger)" />}
                                            <span style={{ color: t === 'inflow' ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: '600', textTransform: 'capitalize', fontSize: '0.875rem' }}>{t}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.type && <span className="error-text">{errors.type[0]}</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <Save size={14} />{submitting ? 'Saving...' : 'Save Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ------------ Designations Tab ------------ //
const DesignationsTab = ({ showToast }) => {
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const fetchDesignations = async () => {
        setLoading(true);
        const res = await apiFetch('/api/designations');
        const data = await res.json();
        setDesignations(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    useEffect(() => { fetchDesignations(); }, []);

    const openCreate = () => { setEditTarget(null); setForm({ name: '', description: '' }); setErrors({}); setModalOpen(true); };
    const openEdit = (d) => { setEditTarget(d); setForm({ name: d.name, description: d.description || '' }); setErrors({}); setModalOpen(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});
        const url = editTarget ? `/api/designations/${editTarget.id}` : '/api/designations';
        const method = editTarget ? 'PUT' : 'POST';
        const res = await apiFetch(url, { method, body: JSON.stringify(form) });
        const data = await res.json();
        setSubmitting(false);
        if (res.ok) {
            showToast(editTarget ? 'Designation updated!' : 'Designation created!', 'success');
            setModalOpen(false);
            fetchDesignations();
        } else {
            setErrors(data.errors || {});
        }
    };

    const handleDelete = async (d) => {
        if (!window.confirm(`Delete designation "${d.name}"?`)) return;
        const res = await apiFetch(`/api/designations/${d.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
            showToast('Designation deleted!', 'success');
            fetchDesignations();
        } else {
            showToast(data.message || 'Delete failed', 'error');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button className="btn btn-primary btn-sm" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={15} /> Add Designation
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>Loading...</div>
            ) : designations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                    <Briefcase size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                    <p>No designations found. Add your first staff designation.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {designations.map((d, idx) => (
                        <div key={d.id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '8px',
                                    background: 'rgba(99,102,241,0.12)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-accent)'
                                }}>
                                    {String(idx + 1).padStart(2, '0')}
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '0.875rem' }}>{d.name}</p>
                                    {d.description && (
                                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{d.description}</p>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => openEdit(d)} className="btn btn-sm btn-secondary" style={{ padding: '5px 8px' }}>
                                    <Pencil size={13} />
                                </button>
                                <button onClick={() => handleDelete(d)} className="btn btn-sm btn-danger" style={{ padding: '5px 8px' }}>
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '440px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Briefcase size={16} color="var(--color-accent)" />
                                {editTarget ? 'Edit Designation' : 'New Designation'}
                            </h3>
                            <button className="modal-close-btn" onClick={() => setModalOpen(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px' }}>
                            <div className="form-group">
                                <label className="form-label">Designation Name</label>
                                <input type="text" className="form-control" placeholder="e.g., Accountant" value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })} required disabled={submitting} />
                                {errors.name && <span className="error-text">{errors.name[0]}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(Optional)</span></label>
                                <input type="text" className="form-control" placeholder="Brief role description" value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })} disabled={submitting} />
                                {errors.description && <span className="error-text">{errors.description[0]}</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <Save size={14} />{submitting ? 'Saving...' : 'Save Designation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ------------ Master Data Page ------------ //
const MasterData = () => {
    const { showToast } = useAuth();
    const [activeTab, setActiveTab] = useState('categories');

    const tabs = [
        { id: 'categories', label: 'Transaction Categories', icon: Tag },
        { id: 'designations', label: 'Staff Designations', icon: Briefcase },
    ];

    return (
        <div style={{ padding: '28px' }}>
            {/* Page Header */}
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>Master Data</h2>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    Manage reference data used throughout the CRM — categories and staff designations.
                </p>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--bg-card)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        style={{
                            padding: '10px 20px',
                            background: activeTab === id ? 'var(--color-accent)' : 'transparent',
                            color: activeTab === id ? 'white' : 'var(--color-text-secondary)',
                            border: 'none', borderRadius: '8px', cursor: 'pointer',
                            fontWeight: activeTab === id ? '600' : '500',
                            fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px',
                            transition: 'all 0.2s',
                        }}
                    >
                        <Icon size={15} />{label}
                    </button>
                ))}
            </div>

            {/* Active Tab Content */}
            {activeTab === 'categories' && <CategoriesTab showToast={showToast} />}
            {activeTab === 'designations' && <DesignationsTab showToast={showToast} />}
        </div>
    );
};

export default MasterData;
