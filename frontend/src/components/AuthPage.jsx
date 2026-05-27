/**
 * Kimlik Doğrulama Bileşeni
 * Kullanıcı giriş/kayıt işlemlerini gerçekleştirir
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/apiService';

export default function AuthPage({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'Individual'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const response = await authService.login(formData.username, formData.password);
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('user_id', response.data.user_id);
                localStorage.setItem('user_role', response.data.role);
                localStorage.setItem('username', response.data.username);
                onLoginSuccess?.();
                navigate('/dashboard');
            } else {
                await authService.register(
                    formData.username,
                    formData.email,
                    formData.password,
                    formData.firstName,
                    formData.lastName,
                    formData.role
                );
                setError('✅ Kayıt başarılı! Lütfen giriş yapın.');
                setIsLogin(true);
                setFormData({ username: '', email: '', password: '', firstName: '', lastName: '', role: 'Individual' });
            }
        } catch (err) {
            setError('❌ ' + (err.response?.data?.error || 'Bir hata oluştu'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>{isLogin ? '🔐 Giriş Yap' : '📝 Kayıt Ol'}</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Kullanıcı Adı</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="Örn: admin"
                        />
                    </div>
                    
                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label>E-posta</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Örn: user@example.com"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ad</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Adınız"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Soyadı</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Soyadınız"
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '0.5rem' }}>
                                <label>Kullanıcı Rolü</label>
                                <select 
                                    name="role" 
                                    value={formData.role || 'Individual'} 
                                    onChange={handleChange}
                                    style={{ padding: '0.75rem', borderRadius: '6px', border: '2px solid #e5e7eb' }}
                                >
                                    <option value="Individual">Bireysel Kullanıcı</option>
                                    <option value="FamilyLeader">Aile Yetkilisi (Yönetici)</option>
                                </select>
                            </div>
                        </>
                    )}
                    
                    <div className="form-group">
                        <label>Şifre</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder={isLogin ? "Şifrenizi girin" : "Güçlü bir şifre girin"}
                        />
                    </div>
                    
                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
                        {loading ? '⏳ Yükleniyor...' : (isLogin ? '🔐 Giriş Yap' : '📝 Kayıt Ol')}
                    </button>
                </form>

                {error && (
                    <div className={`alert ${error.includes('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '1rem' }}>
                        {error}
                    </div>
                )}

                <div className="auth-toggle">
                    {isLogin ? 'Hesabınız yok mu? ' : 'Zaten hesabınız var mı? '}
                    <button onClick={() => {
                        setIsLogin(!isLogin);
                        setError('');
                        setFormData({ username: '', email: '', password: '', firstName: '', lastName: '', role: 'Individual' });
                    }}>
                        {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
                    </button>
                </div>

            </div>
        </div>
    );
}
