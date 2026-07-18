import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from './Contexts/AuthContext';
import Layout from './Components/Layout';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import ActivityLog from './Pages/ActivityLog';
import DayBook from './Pages/DayBook';
import Tasks from './Pages/Tasks';
import Staff from './Pages/Staff';
import Profile from './Pages/Profile';
import MasterData from './Pages/MasterData';
import '../css/app.css';

const AppContent = () => {
    const { user, loading } = useAuth();
    const [currentTab, setCurrentTab] = useState('dashboard');

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                background: 'radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), var(--bg-main)'
            }}>
                <div style={{
                    width: '48px', height: '48px',
                    background: 'linear-gradient(135deg, var(--color-accent), #4f46e5)',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
                }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                </div>
                <div className="spinner"></div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Loading Balancely CRM...</p>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    const renderPage = () => {
        switch (currentTab) {
            case 'dashboard':  return <Dashboard setCurrentTab={setCurrentTab} />;
            case 'activities': return <ActivityLog />;
            case 'daybook':    return <DayBook />;
            case 'tasks':      return <Tasks />;
            case 'staff':      return <Staff />;
            case 'profile':    return <Profile />;
            case 'masterdata': return <MasterData />;
            default:           return <Dashboard setCurrentTab={setCurrentTab} />;
        }
    };

    return (
        <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
            {renderPage()}
        </Layout>
    );
};

const App = () => (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
);

const root = createRoot(document.getElementById('app'));
root.render(<App />);
