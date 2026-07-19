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
import SalaryAdvance from './Pages/SalaryAdvance';
import CargoLog from './Pages/CargoLog';
import VendorStatements from './Pages/VendorStatements';
import ChequeRegister from './Pages/ChequeRegister';
import CrmSettings from './Pages/CrmSettings';
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
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m16 16 3-8 3 8c-.87.65-2.24 1-3.5 1s-2.63-.35-3.5-1Z"/>
                        <path d="m2 16 3-8 3 8c-.87.65-2.24 1-3.5 1s-2.63-.35-3.5-1Z"/>
                        <path d="M7 21h10"/>
                        <path d="M12 3v18"/>
                        <path d="M3 7h18"/>
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
            case 'daybook':          return <DayBook />;
            case 'salaryadvance':    return <SalaryAdvance />;
            case 'cargolog':         return <CargoLog />;
            case 'vendorstatements': return <VendorStatements />;
            case 'chequeregister':   return <ChequeRegister />;
            case 'tasks':            return <Tasks />;
            case 'staff':            return <Staff />;
            case 'profile':          return <Profile />;
            case 'masterdata':       return <MasterData />;
            case 'crmsettings':      return <CrmSettings />;
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
