/**
 * Aile Grubu Yönetimi
 * FamilyLeader rollü kullanıcılar ortak bütçeler oluşturabilir ve üye seçebilir
 */
import React, { useState, useEffect } from 'react';
import { familyService } from '../services/apiService';

export default function FamilyGroups() {
    const [groups, setGroups] = useState([]);
    const [eligibleUsers, setEligibleUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const userRole = localStorage.getItem('user_role');

    const [formData, setFormData] = useState({
        groupName: '',
        description: '',
        selectedUserId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const groupRes = await familyService.getGroups();
            setGroups(groupRes.data || []);

            if (userRole === 'FamilyLeader' || userRole === 'Admin') {
                const usersRes = await familyService.getEligibleUsers();
                setEligibleUsers(usersRes.data || []);
            }
        } catch (err) {
            console.error('Veri çekme hatası:', err);
            setError('❌ Aile bilgileri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (userRole !== 'FamilyLeader' && userRole !== 'Admin') {
            setError('❌ Sadece Aile Yöneticileri grup oluşturabilir');
            return;
        }

        try {
            await familyService.createGroup(formData.groupName, formData.description);
            setSuccess('✅ Grup başarıyla oluşturuldu!');
            setFormData({ groupName: '', description: '', selectedUserId: '' });
            setShowForm(false);
            fetchData();
        } catch (err) {
            setError('❌ Grup oluşturulamadı: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleAddMember = async (groupId, userId) => {
        if (!userId) {
            setError('❌ Lütfen eklenecek bir kullanıcı seçin');
            return;
        }

        try {
            setError('');
            setSuccess('');
            await familyService.inviteMember(groupId, parseInt(userId));
            setSuccess('✅ Üye aileye başarıyla eklendi!');
            setFormData({ ...formData, selectedUserId: '' });
            fetchData();
        } catch (err) {
            setError('❌ Üye eklenemedi: ' + (err.response?.data?.error || err.message));
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <h3>Aile bütçe verileri yükleniyor...</h3>
            </div>
        );
    }

    return (
        <div>
            <h1>👨‍👩‍👧‍👦 Aile Grubu Yönetimi</h1>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Grup Oluştur Formu */}
            {(userRole === 'FamilyLeader' || userRole === 'Admin') && (
                <>
                    {showForm ? (
                        <form className="card" onSubmit={handleCreateGroup}>
                            <h3>➕ Yeni Grup Oluştur</h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Grup Adı</label>
                                    <input 
                                        type="text"
                                        value={formData.groupName}
                                        onChange={(e) => setFormData({...formData, groupName: e.target.value})}
                                        placeholder="Örn: Karagenç Aile Bütçesi"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Açıklama</label>
                                    <input 
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        placeholder="Grup açıklaması"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="submit" className="btn-success">
                                    💾 Oluştur
                                </button>
                                <button 
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        setShowForm(false);
                                        setError('');
                                    }}
                                >
                                    ❌ İptal
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button 
                            className="btn-primary"
                            onClick={() => setShowForm(true)}
                            style={{ marginBottom: '1rem' }}
                        >
                            ➕ Yeni Aile Grubu Oluştur
                        </button>
                    )}
                </>
            )}

            {/* Gruplar Listesi */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">📋 Aile Gruplarınız ({groups.length})</h3>
                </div>

                {groups.length > 0 ? (
                    <div className="grid">
                        {groups.map(group => (
                            <div key={group.group_id} className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
                                <div className="card-header">
                                    <h3 className="card-title" style={{ color: 'var(--primary)' }}>👥 {group.group_name}</h3>
                                </div>

                                <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.95rem' }}>
                                    {group.description || 'Açıklama bulunmuyor.'}
                                </p>

                                {/* Üyeler Bölümü */}
                                <div style={{ marginBottom: '1.5rem', background: '#f9fafb', padding: '1rem', borderRadius: '6px' }}>
                                    <h4 style={{ color: 'var(--primary-light)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>👪 Aile Üyeleri:</h4>
                                    {group.members && group.members.length > 0 ? (
                                        <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                                            {group.members.map(member => (
                                                <li key={member.user_id} style={{ marginBottom: '0.25rem' }}>
                                                    <strong>{member.fullname}</strong> (@{member.username})
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p style={{ fontSize: '0.85rem', color: '#888', fontStyle: 'italic' }}>Henüz bu ailede üye bulunmuyor.</p>
                                    )}
                                </div>

                                {/* Üye Ekleme Dropdown */}
                                {(userRole === 'FamilyLeader' || userRole === 'Admin') && (
                                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                                        <label style={{ fontSize: '0.85rem' }}>Yeni Üye Ekle (Sistemdeki Bireysel Kullanıcılar)</label>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <select 
                                                value={formData.selectedUserId}
                                                onChange={(e) => setFormData({...formData, selectedUserId: e.target.value})}
                                                style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
                                            >
                                                <option value="">-- Aileye Eklenecek Üyeyi Seçin --</option>
                                                {eligibleUsers.map(u => (
                                                    <option key={u.user_id} value={u.user_id}>
                                                        {u.fullname} (@{u.username})
                                                    </option>
                                                ))}
                                            </select>
                                            <button 
                                                type="button"
                                                className="btn-success"
                                                onClick={() => handleAddMember(group.group_id, formData.selectedUserId)}
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                                disabled={!formData.selectedUserId}
                                            >
                                                ➕ Ekle
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>Henüz dahil olduğunuz bir aile grubu bulunmuyor.</p>
                    </div>
                )}
            </div>

            {/* Bilgilendirme */}
            <div className="card mt-3">
                <h3>ℹ️ Aile Grubu Yönetimi Bilgileri</h3>
                <ul style={{ marginLeft: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    <li><strong>Aile Yetkilisi (Yönetici):</strong> Yeni aile bütçesi oluşturabilir ve sistemdeki bağımsız üyeleri doğrudan seçerek ailesine ekleyebilir.</li>
                    <li><strong>Aile Üyeleri:</strong> Aile grubuna dahil olduklarında, harcamaları aile bütçesinde izlenir.</li>
                    <li><strong>Harcama Takibi:</strong> Aile yöneticisi, ailesine dahil ettiği tüm bireysel kullanıcıların harcamalarını kendi işlemleriyle birlikte tek bir ekrandan izleyebilir.</li>
                </ul>
            </div>

            {userRole !== 'FamilyLeader' && userRole !== 'Admin' && (
                <div className="alert alert-warning mt-3">
                    <strong>💡 Not:</strong> Şu anda "Bireysel Kullanıcı" rolündesiniz. Aile grubu kurabilmek için kayıt olurken "Aile Yetkilisi" rolünü seçmeniz gerekmektedir.
                </div>
            )}
        </div>
    );
}
