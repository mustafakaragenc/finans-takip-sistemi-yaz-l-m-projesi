/**
 * Ana Uygulama Bileşeni
 * Routing, Auth, Navigation
 */
import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import BudgetManagement from './components/BudgetManagement';
import FamilyGroups from './components/FamilyGroups';
import AdminPanel from './components/AdminPanel';

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        navigate('/login');
    };

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        navigate('/dashboard');
    };

    const userRole = localStorage.getItem('user_role');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {isLoggedIn && (
                <nav>
                    <div>
                        <h1 style={{ whiteSpace: 'nowrap' }}>Finans Takip</h1>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button onClick={() => navigate('/dashboard')} className="btn-primary">📊 Dashboard</button>
                            <button onClick={() => navigate('/transactions')} className="btn-primary">💳 İşlemler</button>
                            <button onClick={() => navigate('/budget')} className="btn-primary">🎯 Bütçe</button>
                            <button onClick={() => navigate('/family')} className="btn-primary">👨‍👩‍👧‍👦 Aile</button>
                            {userRole === 'Admin' && <button onClick={() => navigate('/admin')} className="btn-primary">⚙️ Admin</button>}
                            <button onClick={handleLogout} style={{ marginLeft: 'auto' }}>🚪 Çıkış</button>
                        </div>
                    </div>
                </nav>
            )}

            <div className="page" style={{ flex: 1 }}>
                <Routes>
                    <Route path="/login" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} />
                    
                    {isLoggedIn ? (
                        <>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/transactions" element={<TransactionList />} />
                            <Route path="/budget" element={<BudgetManagement />} />
                            <Route path="/family" element={<FamilyGroups />} />
                            {userRole === 'Admin' && <Route path="/admin" element={<AdminPanel />} />}
                            <Route path="*" element={<Navigate to="/dashboard" />} />
                        </>
                    ) : (
                        <>
                            <Route path="*" element={<Navigate to="/login" />} />
                        </>
                    )}
                </Routes>
            </div>
        </div>
    );
}
