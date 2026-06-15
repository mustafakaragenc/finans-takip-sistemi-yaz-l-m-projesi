/**
 * Admin Paneli
 * Sistem yönetimi, loglar, kullanıcılar
 */
import React, { useState, useEffect } from 'react';
import { adminService } from '../services/apiService';

export default function AdminPanel() {
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('logs');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const userRole = localStorage.getItem('user_role');

    useEffect(() => {
        fetchAdminData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            setError('');

            if (userRole !== 'Admin') {
                setError('Bu sayfaya erişim yetkiniz yok');
                return;
            }

            if (activeTab === 'logs') {
                const response = await adminService.getLogs(100);
                setLogs(response.data || []);
            } else if (activeTab === 'users') {
                const response = await adminService.getAllUsers();
                setUsers(response.data || []);
            }
        } catch (err) {
            setError('Veri yüklenemedi: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleBackup = async () => {
        try {
            setError('');
            await adminService.triggerBackup();
            setSuccess('Yedekleme başlatıldı!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Yedekleme başarısız');
        }
    };

    if (userRole !== 'Admin') {
        return (
            <div className="alert alert-error">
                <strong>Yetkisiz Erişim</strong><br/>
                Bu panele sadece Sistem Yöneticileri erişebilir.
            </div>
        );
    }

    const getActionColor = (action) => {
        if (!action) return '#3b82f6';
        if (action.includes('SUCCESS') || action.includes('CREATED')) return '#10b981';
        if (action.includes('FAILED') || action.includes('ERROR')) return '#ef4444';
        if (action.includes('DELETE')) return '#f59e0b';
        return '#3b82f6';
    };

    return (
        <div>
            <h1>Admin Paneli</h1>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Sekme Navigasyonu */}
            <div className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                    <button 
                        className={activeTab === 'logs' ? 'btn-primary' : 'btn-secondary'}
                        onClick={() => {
                            setActiveTab('logs');
                            fetchAdminData();
                        }}
                    >
                        Sistem Logları
                    </button>
                    <button 
                        className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}
                        onClick={() => {
                            setActiveTab('users');
                            fetchAdminData();
                        }}
                    >
                        Kullanıcılar
                    </button>
                    <button 
                        className="btn-success"
                        onClick={handleBackup}
                        style={{ marginLeft: 'auto' }}
                    >
                        Yedekleme Başlat
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <h3>Veriler yükleniyor...</h3>
                </div>
            ) : (
                <>
                    {/* Sistem Logları */}
                    {activeTab === 'logs' && (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Son {logs.length} Log Kaydı</h3>
                            </div>

                            {logs.length > 0 ? (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Tarih/Saat</th>
                                            <th>Kullanıcı ID</th>
                                            <th>İşlem</th>
                                            <th>Detay</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log, idx) => (
                                            <tr key={idx}>
                                                <td>{new Date(log.created_at).toLocaleString('tr-TR')}</td>
                                                <td>
                                                    <span className="badge badge-info">
                                                        ID: {log.user_id || 'Sistem'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        backgroundColor: getActionColor(log.action_type),
                                                        color: 'white',
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '4px',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        {log.action_type}
                                                    </span>
                                                </td>
                                                <td>{log.details || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-state">
                                    <p>Henüz log kaydı yok.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Kullanıcı Yönetimi */}
                    {activeTab === 'users' && (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Sistem Kullanıcıları ({users.length})</h3>
                            </div>

                            {users.length > 0 ? (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Kullanıcı Adı</th>
                                            <th>E-posta</th>
                                            <th>Ad Soyadı</th>
                                            <th>Rol</th>
                                            <th>Şifre (Parola)</th>
                                            <th>Net Bakiye</th>
                                            <th>Oluşturulma Tarihi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.user_id}>
                                                <td>
                                                    <span className="badge badge-info">{user.user_id}</span>
                                                </td>
                                                <td>
                                                    <strong>{user.username}</strong>
                                                </td>
                                                <td>{user.email}</td>
                                                <td>{user.first_name} {user.last_name}</td>
                                                <td>
                                                    <span style={{
                                                        backgroundColor: user.role === 'Admin' ? '#ef4444' : user.role === 'FamilyLeader' ? '#f59e0b' : '#3b82f6',
                                                        color: 'white',
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '20px',
                                                        fontWeight: '600',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        {user.role === 'FamilyLeader' ? 'Aile Yetkilisi' : user.role === 'Admin' ? 'Admin' : 'Bireysel'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong style={{ fontFamily: 'monospace', color: '#4b5563' }}>
                                                        {user.password_plain || 'Şifreli'}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <span style={{ fontWeight: 'bold', color: (user.balance || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                                                        ₺{(user.balance || 0).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td>{new Date(user.created_at).toLocaleDateString('tr-TR')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-state">
                                    <p>Henüz kullanıcı yok.</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* İstatistikler */}
            <div className="grid mt-3">
                <div className="stat-box">
                    <div className="stat-value">{users.length}</div>
                    <div className="stat-label">Toplam Kullanıcı</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value">{logs.length}</div>
                    <div className="stat-label">Son Log Kayıtları</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value">Aktif</div>
                    <div className="stat-label">Sistem Durumu: Aktif</div>
                </div>
            </div>

            {/* Sistem Bilgileri */}
            <div className="card mt-3">
                <h3>ℹ️ Admin Paneli Bilgileri</h3>
                <ul style={{ marginLeft: '1.5rem' }}>
                    <li><strong>Sistem Logları:</strong> Tüm önemli sistem işlemlerini izleyin</li>
                    <li><strong>Kullanıcı Yönetimi:</strong> Sistemdeki tüm kullanıcıları görün</li>
                    <li><strong>Yedekleme:</strong> Veri tabanını yedekleyin</li>
                    <li><strong>Güvenlik:</strong> Sistem güvenliğini ve integriteyi kontrol edin</li>
                </ul>
            </div>
        </div>
    );
}
