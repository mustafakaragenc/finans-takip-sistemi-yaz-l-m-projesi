/**
 * Kimlik Doğrulama ve Tanıtım (Landing) Bileşeni
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/apiService';

export default function AuthPage({ onLoginSuccess, isLoggedIn }) {
    const [showAuthModal, setShowAuthModal] = useState(null); // null, 'login', 'register'
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
            if (showAuthModal === 'login') {
                const response = await authService.login(formData.username, formData.password);
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('user_id', response.data.user_id);
                localStorage.setItem('user_role', response.data.role);
                localStorage.setItem('username', response.data.username);
                onLoginSuccess?.();
                navigate('/dashboard');
            } else if (showAuthModal === 'register') {
                await authService.register(
                    formData.username,
                    formData.email,
                    formData.password,
                    formData.firstName,
                    formData.lastName,
                    formData.role
                );
                setError('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
                setShowAuthModal('login');
                setFormData({ username: '', email: '', password: '', firstName: '', lastName: '', role: 'Individual' });
            }
        } catch (err) {
            setError('Hata: ' + (err.response?.data?.error || 'Bir hata oluştu'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="landing-page-container">
            {/* 🟢 Üst Navigasyon Çubuğu */}
            {!isLoggedIn && (
                <header className="landing-topbar">
                    <div className="landing-topbar-inner">
                        <div className="landing-topbar-logo" onClick={() => setShowAuthModal(null)}>
                            FİNANS ASİSTANI
                        </div>
                        <div className="landing-topbar-nav">
                            <button className="nav-logout-btn" onClick={() => { setError(''); setShowAuthModal('login'); }}>Giriş Yap</button>
                        </div>
                    </div>
                </header>
            )}

            {/* Degrade Yeşil Kahraman Banner */}
            <section className="landing-hero-banner">
                <div className="landing-hero-inner">
                    <h1 className="hero-main-title">
                        Paranın gücü, akıllı teknolojiyle buluşuyor.
                    </h1>
                    <p className="hero-main-subtitle">
                        Bireysel ve aile bütçenizi kolayca takip edin, harcamalarınızı planlayarak finansal özgürlüğünüzü artırın.
                    </p>
                    <p className="hero-main-description">
                        Finans Asistanı, ailelerin ortak bütçe yönetimi ve bireysel harcama takipleri yapabilmesi için geliştirilmiş modern ve güvenli bir web uygulamasıdır.
                    </p>
                    <div className="hero-btn-group">
                        <button className="hero-btn-primary" onClick={() => { setError(''); setShowAuthModal('register'); }}>
                            Hemen Başlayın
                        </button>
                        <button className="hero-btn-secondary" onClick={() => { setError(''); setShowAuthModal('login'); }}>
                            Giriş Yapın
                        </button>
                    </div>
                </div>
            </section>

            {/* Özellikler Bölümü */}
            <section className="landing-features-section">
                <span className="features-badge-pill">ÖZELLİKLER</span>
                <h2 className="features-section-title">Neden Finans Asistanı?</h2>
                <p className="features-section-subtitle">
                    Bütçenizi dijitalleştirmek ve tasarrufunuzu artırmak için ihtiyacınız olan her şey tek bir platformda.
                </p>
                
                <div className="features-grid-3">
                    <div className="feature-card-clean">
                        <h3>Harcamaları Takip Et</h3>
                        <p>
                            Tüm kişisel ve aile harcamalarınızı kategori, miktar ve tarih bilgileriyle kaydedin. Bütçenizin güncel durumunu anlık olarak görüntüleyin.
                        </p>
                    </div>
                    
                    <div className="feature-card-clean">
                        <h3>Bütçeyi Planla</h3>
                        <p>
                            Kategori bazlı aylık bütçe limitleri tanımlayın ve bütçe sınırlarına ulaştığınızda sistemin ürettiği alarmlarla harcamalarınızı kontrol altında tutun.
                        </p>
                    </div>

                    <div className="feature-card-clean">
                        <h3>Giderleri Analiz Et</h3>
                        <p>
                            Yapılan harcamaları ve elde edilen gelirleri aile veya birey bazında grafikleştirin. Karar vermenizi kolaylaştıracak analizlere verilerle ulaşın.
                        </p>
                    </div>
                </div>
            </section>

            {/* 🔐 Giriş/Kayıt Modal Penceresi */}
            {showAuthModal && (
                <div className="auth-modal-overlay" onClick={() => setShowAuthModal(null)}>
                    <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowAuthModal(null)}>
                            ✕
                        </button>
                        
                        <h2>{showAuthModal === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Kullanıcı Adı</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    placeholder="Kullanıcı adınızı girin"
                                />
                            </div>
                            
                            {showAuthModal === 'register' && (
                                <>
                                    <div className="form-group">
                                        <label>E-posta</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            required
                                            onChange={handleChange}
                                            placeholder="user@example.com"
                                        />
                                    </div>
                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0' }}>
                                        <div className="form-group">
                                            <label>Ad</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                placeholder="Adınız"
                                                style={{ marginBottom: '1rem' }}
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
                                                style={{ marginBottom: '1rem' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Kullanıcı Rolü</label>
                                        <select 
                                            name="role" 
                                            value={formData.role || 'Individual'} 
                                            onChange={handleChange}
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
                                    placeholder={showAuthModal === 'login' ? "Şifrenizi girin" : "Güçlü bir şifre girin"}
                                />
                            </div>
                            
                            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>
                                {loading ? 'Yükleniyor...' : (showAuthModal === 'login' ? 'Giriş Yap' : 'Kayıt Ol')}
                            </button>
                        </form>

                        {error && (
                            <div className={`alert ${error.includes('başarılı') ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '1.5rem', marginBottom: '0' }}>
                                {error}
                            </div>
                        )}

                        <div className="auth-toggle">
                            {showAuthModal === 'login' ? 'Hesabınız yok mu? ' : 'Zaten hesabınız var mı? '}
                            <button 
                                type="button"
                                onClick={() => {
                                    setError('');
                                    setShowAuthModal(showAuthModal === 'login' ? 'register' : 'login');
                                }}
                            >
                                {showAuthModal === 'login' ? 'Kayıt Ol' : 'Giriş Yap'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
