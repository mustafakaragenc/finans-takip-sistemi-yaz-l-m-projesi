/**
 * Ana Uygulama Bileşeni
 * Routing, Auth, Navigation
 */
import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
        navigate('/');
    };

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        navigate('/dashboard');
    };

    const userRole = localStorage.getItem('user_role');

    const location = useLocation();
    const username = localStorage.getItem('username') || 'Mustafa Karagenç';
    const userEmail = username.includes(' ') 
        ? `${username.split(' ')[0].toLowerCase()}@gmail.com` 
        : `${username.toLowerCase()}@gmail.com`;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {isLoggedIn && (
                <nav>
                    <div>
                        <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>FİNANS ASİSTANI</h1>
                        
                        <div className="nav-menu-links">
                            <button 
                                onClick={() => navigate('/dashboard')} 
                                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                            >
                                Gösterge Paneli
                            </button>
                            <button 
                                onClick={() => navigate('/transactions')} 
                                className={`nav-link ${location.pathname === '/transactions' ? 'active' : ''}`}
                            >
                                İşlemler
                            </button>
                            <button 
                                onClick={() => navigate('/budget')} 
                                className={`nav-link ${location.pathname === '/budget' ? 'active' : ''}`}
                            >
                                Bütçe Limitleri
                            </button>
                            <button 
                                onClick={() => navigate('/family')} 
                                className={`nav-link ${location.pathname === '/family' ? 'active' : ''}`}
                            >
                                Aile Yönetimi
                            </button>
                            {userRole === 'Admin' && (
                                <button 
                                    onClick={() => navigate('/admin')} 
                                    className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                                >
                                    Admin Paneli
                                </button>
                            )}
                        </div>

                        <div className="nav-user-profile">
                            <div className="nav-user-info">
                                <div className="nav-user-meta">
                                    <span className="nav-user-name">{username}</span>
                                    <span className="nav-user-email">{userEmail}</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="nav-logout-btn">Çıkış Yap</button>
                        </div>
                    </div>
                </nav>
            )}

            <div style={{ flex: 1 }}>
                <Routes>
                    {/* Landing Page */}
                    <Route 
                        path="/" 
                        element={<AuthPage onLoginSuccess={handleLoginSuccess} isLoggedIn={isLoggedIn} />} 
                    />
                    
                    {/* Protected routes wrapped in container */}
                    <Route 
                        path="/dashboard" 
                        element={isLoggedIn ? <div className="page"><Dashboard /></div> : <Navigate to="/" />} 
                    />
                    <Route 
                        path="/transactions" 
                        element={isLoggedIn ? <div className="page"><TransactionList /></div> : <Navigate to="/" />} 
                    />
                    <Route 
                        path="/budget" 
                        element={isLoggedIn ? <div className="page"><BudgetManagement /></div> : <Navigate to="/" />} 
                    />
                    <Route 
                        path="/family" 
                        element={isLoggedIn ? <div className="page"><FamilyGroups /></div> : <Navigate to="/" />} 
                    />
                    {userRole === 'Admin' && (
                        <Route 
                            path="/admin" 
                            element={isLoggedIn ? <div className="page"><AdminPanel /></div> : <Navigate to="/" />} 
                        />
                    )}
                    
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/"} />} />
                </Routes>
            </div>
        </div>
    );
}
