import React, { useState, useEffect } from 'react';
import { useAuth, apiFetch } from '../Contexts/AuthContext';
import {
    Settings, Building2, User, Palette, Shield, Save,
    Globe, Phone, Mail, MapPin, RefreshCw, Check
} from 'lucide-react';

const CrmSettings = () => {
    const { user, showToast } = useAuth();
    const [activeSection, setActiveSection] = useState('company');
    const [saving, setSaving] = useState(false);

    // Company Info state
    const [companyForm, setCompanyForm] = useState({
        company_name: 'Balancely CRM',
        company_phone: '',
        company_email: '',
        company_address: '',
        company_gst: '',
        currency_symbol: '₹',
        country: 'India',
    });

    // App settings state
    const [appForm, setAppForm] = useState({
        date_format: 'DD/MM/YYYY',
        timezone: 'Asia/Kolkata',
    });

    const sections = [
        { id: 'company',  label: 'Company Info',     icon: Building2 },
        { id: 'app',      label: 'App Preferences',  icon: Settings },
        { id: 'security', label: 'Security',          icon: Shield },
    ];

    const handleSaveCompany = async (e) => {
        e.preventDefault();
        setSaving(true);
        // Simulate save — wire to backend if needed
        await new Promise(r => setTimeout(r, 700));
        showToast('Company settings saved successfully!', 'success');
        setSaving(false);
    };

    const handleSaveApp = async (e) => {
        e.preventDefault();
        setSaving(true);
        await new Promise(r => setTimeout(r, 700));
        showToast('App preferences saved successfully!', 'success');
        setSaving(false);
    };

    return (
        <div style={{ padding: '28px', maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Settings size={22} color="var(--color-accent)" />
                    CRM Settings
                </h2>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    Configure company info, application preferences, and system security options.
                </p>
            </div>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                {/* Sidebar Tabs */}
                <div className="card" style={{ minWidth: '200px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {sections.map(s => {
                        const Icon = s.icon;
                        const active = activeSection === s.id;
                        return (
                            <button
                                key={s.id}
                                onClick={() => setActiveSection(s.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '10px 14px', borderRadius: '8px', border: 'none',
                                    background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                                    color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                    fontWeight: active ? '700' : '500',
                                    fontSize: '0.875rem', cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    textAlign: 'left', width: '100%'
                                }}
                            >
                                <Icon size={16} />
                                {s.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Panel */}
                <div style={{ flex: 1 }}>
                    {/* Company Info */}
                    {activeSection === 'company' && (
                        <div className="card" style={{ padding: '28px' }}>
                            <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: '700', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Building2 size={17} color="var(--color-accent)" /> Company Information
                            </h3>
                            <form onSubmit={handleSaveCompany}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="form-label">Company / Business Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={companyForm.company_name}
                                            onChange={e => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                                            placeholder="e.g., My Interior Studio"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={companyForm.company_phone}
                                            onChange={e => setCompanyForm({ ...companyForm, company_phone: e.target.value })}
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={companyForm.company_email}
                                            onChange={e => setCompanyForm({ ...companyForm, company_email: e.target.value })}
                                            placeholder="admin@company.com"
                                        />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="form-label">Business Address</label>
                                        <textarea
                                            className="form-control"
                                            rows={2}
                                            value={companyForm.company_address}
                                            onChange={e => setCompanyForm({ ...companyForm, company_address: e.target.value })}
                                            placeholder="Street, City, State, PIN"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">GST Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={companyForm.company_gst}
                                            onChange={e => setCompanyForm({ ...companyForm, company_gst: e.target.value })}
                                            placeholder="22AAAAA0000A1Z5"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Currency Symbol</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={companyForm.currency_symbol}
                                            onChange={e => setCompanyForm({ ...companyForm, currency_symbol: e.target.value })}
                                            placeholder="₹"
                                        />
                                    </div>
                                </div>
                                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {saving ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
                                        {saving ? 'Saving...' : 'Save Company Info'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* App Preferences */}
                    {activeSection === 'app' && (
                        <div className="card" style={{ padding: '28px' }}>
                            <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: '700', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Settings size={17} color="var(--color-accent)" /> App Preferences
                            </h3>
                            <form onSubmit={handleSaveApp}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Date Format</label>
                                        <select
                                            className="form-control"
                                            value={appForm.date_format}
                                            onChange={e => setAppForm({ ...appForm, date_format: e.target.value })}
                                        >
                                            <option value="DD/MM/YYYY">DD/MM/YYYY (India)</option>
                                            <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Timezone</label>
                                        <select
                                            className="form-control"
                                            value={appForm.timezone}
                                            onChange={e => setAppForm({ ...appForm, timezone: e.target.value })}
                                        >
                                            <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                                            <option value="UTC">UTC</option>
                                            <option value="America/New_York">America/New_York (EST)</option>
                                            <option value="Europe/London">Europe/London (GMT)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Info Banner */}
                                <div style={{
                                    marginTop: '20px', padding: '14px 18px',
                                    background: 'rgba(99,102,241,0.07)',
                                    border: '1px solid rgba(99,102,241,0.15)',
                                    borderRadius: '10px',
                                    fontSize: '0.825rem', color: 'var(--color-text-secondary)',
                                    display: 'flex', alignItems: 'flex-start', gap: '10px'
                                }}>
                                    <Globe size={15} style={{ marginTop: '1px', flexShrink: 0, color: 'var(--color-accent)' }} />
                                    <span>These preferences affect how dates and times are displayed across the CRM. Currently configured for <strong>India (IST, ₹ Rupee)</strong>.</span>
                                </div>

                                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {saving ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
                                        {saving ? 'Saving...' : 'Save Preferences'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Security */}
                    {activeSection === 'security' && (
                        <div className="card" style={{ padding: '28px' }}>
                            <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: '700', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Shield size={17} color="var(--color-accent)" /> Security & Access
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Permission summary */}
                                <div style={{ padding: '16px 20px', background: 'var(--bg-card-hover)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                                    <p style={{ margin: '0 0 10px', fontSize: '0.825rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                                        Current Access Rules
                                    </p>
                                    {[
                                        { label: 'View all listings', roles: 'Admin & Staff' },
                                        { label: 'Create records', roles: 'Admin & Staff' },
                                        { label: 'Edit records', roles: 'Admin & Staff' },
                                        { label: 'Delete records', roles: 'Admin only' },
                                        { label: 'Export to Excel', roles: 'Admin & Staff' },
                                        { label: 'Staff Management', roles: 'Admin only' },
                                        { label: 'Master Data Management', roles: 'Admin only' },
                                        { label: 'CRM Settings', roles: 'Admin only' },
                                    ].map((rule, i) => (
                                        <div key={i} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '8px 0', borderBottom: '1px solid var(--border-subtle)',
                                            fontSize: '0.875rem'
                                        }}>
                                            <span style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Check size={13} color="var(--color-success)" />
                                                {rule.label}
                                            </span>
                                            <span style={{
                                                background: rule.roles.includes('only') ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)',
                                                color: rule.roles.includes('only') ? 'var(--color-accent)' : 'var(--color-success)',
                                                border: `1px solid ${rule.roles.includes('only') ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)'}`,
                                                borderRadius: '10px', padding: '3px 10px',
                                                fontSize: '0.72rem', fontWeight: '700'
                                            }}>
                                                {rule.roles}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{
                                    padding: '14px 18px',
                                    background: 'rgba(244,63,94,0.06)',
                                    border: '1px solid rgba(244,63,94,0.15)',
                                    borderRadius: '10px',
                                    fontSize: '0.825rem', color: 'var(--color-text-secondary)',
                                    display: 'flex', alignItems: 'flex-start', gap: '10px'
                                }}>
                                    <Shield size={15} style={{ marginTop: '1px', flexShrink: 0, color: 'var(--color-danger)' }} />
                                    <span>To add or remove users, or change roles, go to <strong>Staff Management</strong>. Role-based access control is enforced both in the frontend and on the server.</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CrmSettings;
