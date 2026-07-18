import React, { useState } from 'react';
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
    Home,
    UserCircle,
    Database
} from 'lucide-react';

const Layout = ({ currentTab, setCurrentTab, children }) => {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems = [
        { id: 'dashboard',   name: 'Dashboard',        icon: LayoutDashboard, role: 'staff' },
        { id: 'activities',  name: 'Activity Log',      icon: ClipboardList,   role: 'staff' },
        { id: 'daybook',     name: 'Day Book',          icon: Receipt,         role: 'staff' },
        { id: 'tasks',       name: 'Tasks & Reminders', icon: CheckSquare,     role: 'staff' },
        { id: 'profile',     name: 'My Profile',        icon: UserCircle,      role: 'staff' },
        { id: 'staff',       name: 'Staff Management',  icon: Users,           role: 'admin' },
        { id: 'masterdata',  name: 'Master Data',       icon: Database,        role: 'admin' },
    ];

    const getInitials = (name) => {
        return name
            ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
            : 'US';
    };

    const handleTabChange = (tabId) => {
        setCurrentTab(tabId);
        setMobileOpen(false); // Close sidebar on mobile
    };

    return (
        <div className="app-container">
            {/* Mobile Header (Topbar for small screens) */}
            <div className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <Home size={18} color="white" />
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
                        // Check if user has permission
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
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </header>

                <main className="content-body">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
