import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

// Helper: Get CSRF token from blade-injected global
const getCsrf = () => window._CSRF_TOKEN || '';

// Helper: JSON fetch with CSRF header automatically injected
export const apiFetch = (url, options = {}) => {
    const isWriteMethod = options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase());
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(isWriteMethod ? { 'X-CSRF-TOKEN': getCsrf() } : {}),
            ...(options.headers || {}),
        }
    });
};


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

    const showToast = (message, type = 'success') => {
        setToast({ message, type, visible: true });
        setTimeout(() => {
            setToast((prev) => ({ ...prev, visible: false }));
        }, 4000);
    };

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/me');
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await apiFetch('/api/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                setUser(data.user);
                showToast('Welcome back, ' + data.user.name + '!', 'success');
                return { success: true };
            } else {
                return { success: false, errors: data.errors || { email: [data.message] } };
            }
        } catch (error) {
            console.error('Login request failed:', error);
            return { success: false, errors: { email: ['Network connection error. Please try again.'] } };
        }
    };

    const logout = async () => {
        try {
            const response = await apiFetch('/api/logout', { method: 'POST' });
            if (response.ok) {
                setUser(null);
                showToast('Logged out successfully', 'success');
            } else {
                showToast('Logout request failed', 'error');
            }
        } catch (error) {
            console.error('Logout error:', error);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, logout, toast, showToast }}>
            {children}
            {toast.visible && (
                <div className={`toast-container`}>
                    <div className={`toast ${toast.type}`}>
                        <div className="toast-icon">
                            {toast.type === 'success' && '✓'}
                            {toast.type === 'error' && '✗'}
                            {toast.type === 'warning' && '⚠'}
                        </div>
                        <div className="toast-message">{toast.message}</div>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
