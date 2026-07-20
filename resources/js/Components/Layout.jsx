import React, { useState, useEffect } from 'react';
import { useAuth } from '../Contexts/AuthContext';
import { 
    LayoutDashboard, 
    ClipboardList, 
    Receipt, 
    CheckSquare, 
    Users, 
    LogOut, 
    Menu, 
    X, 
    Scale,
    UserCircle,
    Database,
    Coins,
    Truck,
    FileCheck,
    FileText,
    Settings
} from 'lucide-react';

const Layout = ({ currentTab, setCurrentTab, children }) => {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const menuItems = [
        { id: 'dashboard',        name: 'Dashboard',         icon: LayoutDashboard, role: 'staff' },
        { id: 'activities',       name: 'Activity Log',      icon: ClipboardList,   role: 'staff' },
        { id: 'daybook',          name: 'Day Book',          icon: Receipt,         role: 'staff' },
        { id: 'salaryadvance',    name: 'Salary Advance',    icon: Coins,           role: 'staff' },
        { id: 'cargolog',         name: 'Cargo Log',         icon: Truck,           role: 'staff' },
        { id: 'vendorstatements', name: 'Vendor Statements', icon: FileCheck,       role: 'staff' },
        { id: 'chequeregister',   name: 'Cheque Register',   icon: FileText,        role: 'staff' },
        { id: 'tasks',            name: 'Tasks & Reminders', icon: CheckSquare,     role: 'staff' },
        { id: 'profile',          name: 'My Profile',        icon: UserCircle,      role: 'staff' },
        { id: 'staff',            name: 'Staff Management',  icon: Users,           role: 'admin' },
        { id: 'masterdata',       name: 'Master Data',       icon: Database,        role: 'admin' },
        { id: 'crmsettings',      name: 'CRM Settings',      icon: Settings,        role: 'admin' },
    ];

    const getInitials = (name) => {
        return name
            ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
            : 'US';
    };

    const handleTabChange = (tabId) => {
        setCurrentTab(tabId);
        setMobileOpen(false);
    };

    const formattedDate = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    return (
        <div className="app-container">
            {/* Sidebar */}
            <div className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <Scale size={18} color="white" />
                    </div>
                    <span>Balancely CRM</span>
                    <button 
                        className="modal-close-btn" 
                        style={{ marginLeft: 'auto', display: window.innerWidth <= 768 ? 'block' : 'none' }}
                        onClick={() => setMobileOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <ul className="sidebar-menu">
                    {menuItems.map((item) => {
                        if (item.role === 'admin' && user?.role !== 'admin') return null;
                        
                        const IconComponent = item.icon;
                        const isActive = currentTab === item.id;
                        
                        return (
                            <li key={item.id} className={`menu-item ${isActive ? 'active' : ''}`}>
                                <button onClick={() => handleTabChange(item.id)}>
                                    <IconComponent size={20} />
                                    <span>{item.name}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">
                            {getInitials(user?.name)}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role">{user?.role} Portal</span>
                        </div>
                    </div>
                    
                    <button className="logout-btn" onClick={logout}>
                        <LogOut size={16} />
                        <span>Log Out</span>
                    </button>
                </div>
            </div>

            {/* Main Wrapper */}
            <div className="main-wrapper">
                <header className="topbar">
                    <button 
                        className="modal-close-btn" 
                        style={{ display: 'flex', border: '1px solid var(--border-subtle)', padding: '6px', borderRadius: '6px' }}
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        <Menu size={20} />
                    </button>
                    
                    <div className="topbar-title" style={{ marginRight: 'auto', marginLeft: '12px' }}>
                        {menuItems.find(m => m.id === currentTab)?.name || 'CRM Dashboard'}
                    </div>

                    <div className="topbar-actions">
                        {/* Live Date & Time */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: '1px',
                        }}>
                            <span style={{
                                fontSize: '0.78rem',
                                fontWeight: '700',
                                color: 'var(--color-text-primary)',
                                letterSpacing: '0.02em',
                                fontVariantNumeric: 'tabular-nums',
                                fontFamily: 'monospace'
                            }}>
                                {formattedTime}
                            </span>
                            <span style={{
                                fontSize: '0.7rem',
                                color: 'var(--color-text-muted)',
                                fontWeight: '500'
                            }}>
                                {formattedDate}
                            </span>
                        </div>
                    </div>
                </header>

                <main className="content-body">
                    {children}
                    
                    <footer style={{ 
                        marginTop: 'auto', 
                        paddingTop: '24px', 
                        borderTop: '1px solid var(--border-subtle)', 
                        textAlign: 'center', 
                        fontSize: '0.8rem', 
                        color: 'var(--color-text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                    }}>
                        <span>
                            &copy; {new Date().getFullYear()} <strong>Balancely CRM</strong>. All Rights Reserved.
                        </span>
                        <span>
                            Designed & Developed by{' '}
                            <a 
                                href="https://technobyteinnovations.in/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: '600' }}
                            >
                                TechnoByte Innovations
                            </a>
                        </span>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default Layout;
