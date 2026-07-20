import React, { useState, useEffect } from 'react';
import { useAuth, apiFetch } from '../Contexts/AuthContext';
import { User, Mail, Lock, Shield, Eye, EyeOff, Save, KeyRound, Briefcase } from 'lucide-react';

const Profile = () => {
    const { user, setUser, showToast } = useAuth();
    const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwErrors, setPwErrors] = useState({});
    const [activeTab, setActiveTab] = useState('info');
    const [profileErrors, setProfileErrors] = useState({});
    const [profile, setProfile] = useState({ name: '', email: '', designation: null });
    const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });

    useEffect(() => {
        // Pre-fill immediately from cached auth user
        if (user) {
            setProfile(prev => ({ ...prev, name: user.name, email: user.email, role: user.role }));
            setProfileForm({ name: user.name, email: user.email });
        }
        // Fetch full profile (includes designation) from API
        apiFetch('/api/profile')
            .then(r => {
                if (!r.ok) throw new Error('Profile fetch failed: ' + r.status);
                return r.json();
            })
            .then(data => {
                setProfile(data);
                setProfileForm({ name: data.name, email: data.email });
            })
            .catch(err => console.error(err));
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileErrors({});
        try {
            const res = await apiFetch('/api/profile', {
                method: 'PUT',
                body: JSON.stringify(profileForm),
            });
            const data = await res.json();
            if (res.ok) {
                setProfile(data.user);
                setUser(prev => ({ ...prev, name: data.user.name, email: data.user.email }));
                showToast('Profile updated successfully!', 'success');
            } else {
                setProfileErrors(data.errors || {});
                showToast(data.message || 'Update failed', 'error');
            }
        } catch {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPwLoading(true);
        setPwErrors({});
        try {
            const res = await apiFetch('/api/profile/password', {
                method: 'PUT',
                body: JSON.stringify(pwForm),
            });
            const data = await res.json();
            if (res.ok) {
                setPwForm({ current_password: '', password: '', password_confirmation: '' });
                showToast('Password changed successfully!', 'success');
            } else {
                setPwErrors(data.errors || {});
                showToast(data.message || 'Password change failed', 'error');
            }
        } catch {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setPwLoading(false);
        }
    };

    const getInitials = (name) =>
        name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'US';

    return (
        <div style={{ padding: '28px', maxWidth: '760px', margin: '0 auto' }}>
            {/* Profile Header Card */}
            <div className="card" style={{ marginBottom: '24px', padding: '28px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '20px',
                    background: 'linear-gradient(135deg, var(--color-accent), #4f46e5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.75rem', fontWeight: '700', color: 'white',
                    flexShrink: 0, boxShadow: '0 8px 24px rgba(99,102,241,0.35)'
                }}>
                    {getInitials(profile.name)}
                </div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                        {profile.name || '—'}
                    </h2>
                    <p style={{ margin: '4px 0 8px', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                        {profile.email}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span className="badge badge-type" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Shield size={12} /> {profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''}
                        </span>
                        {profile.designation && (
                            <span className="badge badge-inflow" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Briefcase size={12} /> {profile.designation.name}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--bg-card)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                {[
                    { id: 'info', label: 'Profile Info', icon: User },
                    { id: 'password', label: 'Change Password', icon: KeyRound },
                ].map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        style={{
                            flex: 1, padding: '10px 16px',
                            background: activeTab === id ? 'var(--color-accent)' : 'transparent',
                            color: activeTab === id ? 'white' : 'var(--color-text-secondary)',
                            border: 'none', borderRadius: '8px', cursor: 'pointer',
                            fontWeight: activeTab === id ? '600' : '500',
                            fontSize: '0.875rem', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '8px', transition: 'all 0.2s',
                        }}
                    >
                        <Icon size={15} />{label}
                    </button>
                ))}
            </div>

            {/* Profile Info Form */}
            {activeTab === 'info' && (
                <div className="card" style={{ padding: '28px' }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={16} color="var(--color-accent)" /> Personal Information
                    </h3>
                    <form onSubmit={handleProfileSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <User size={13} /> Full Name
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Your full name"
                                    value={profileForm.name}
                                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                    required
                                    disabled={profileLoading}
                                />
                                {profileErrors.name && <span className="error-text">{profileErrors.name[0]}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Mail size={13} /> Email Address
                                </label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="your@email.com"
                                    value={profileForm.email}
                                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                                    required
                                    disabled={profileLoading}
                                />
                                {profileErrors.email && <span className="error-text">{profileErrors.email[0]}</span>}
                            </div>
                        </div>

                        <div style={{ marginTop: '8px', padding: '14px 16px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access Role</p>
                                <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: '600', textTransform: 'capitalize' }}>
                                    {profile.role || '—'}
                                </p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Designation</p>
                                <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: '600' }}>
                                    {profile.designation?.name || '—'}
                                </p>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '10px 0 0' }}>
                            Role and Designation can only be updated by an Administrator.
                        </p>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn btn-primary" disabled={profileLoading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Save size={15} />
                                {profileLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Change Password Form */}
            {activeTab === 'password' && (
                <div className="card" style={{ padding: '28px' }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Lock size={16} color="var(--color-accent)" /> Change Password
                    </h3>
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label className="form-label">Current Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showCurrent ? 'text' : 'password'}
                                    className="form-control"
                                    placeholder="Enter your current password"
                                    value={pwForm.current_password}
                                    onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })}
                                    required
                                    disabled={pwLoading}
                                />
                                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '0' }}>
                                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {pwErrors.current_password && <span className="error-text">{pwErrors.current_password[0]}</span>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showNew ? 'text' : 'password'}
                                        className="form-control"
                                        placeholder="Min. 8 characters"
                                        value={pwForm.password}
                                        onChange={e => setPwForm({ ...pwForm, password: e.target.value })}
                                        required
                                        disabled={pwLoading}
                                    />
                                    <button type="button" onClick={() => setShowNew(!showNew)}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '0' }}>
                                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {pwErrors.password && <span className="error-text">{pwErrors.password[0]}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Repeat new password"
                                    value={pwForm.password_confirmation}
                                    onChange={e => setPwForm({ ...pwForm, password_confirmation: e.target.value })}
                                    required
                                    disabled={pwLoading}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '8px', padding: '12px 14px', background: 'rgba(99,102,241,0.06)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            Password must be at least 8 characters long.
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn btn-primary" disabled={pwLoading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <KeyRound size={15} />
                                {pwLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Profile;
