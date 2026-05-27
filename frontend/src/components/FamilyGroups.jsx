/**
 * Aile Grubu Yönetimi
 * FamilyLeader rollü kullanıcılar ortak bütçeler oluşturabilir
 */
import React, { useState } from 'react';
import { familyService } from '../services/apiService';

export default function FamilyGroups() {
    const [groups, setGroups] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const userRole = localStorage.getItem('user_role');

    const [formData, setFormData] = useState({
        groupName: '',
        description: '',
        invitedUserId: ''
    });

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
            setFormData({ groupName: '', description: '', invitedUserId: '' });
            setShowForm(false);
        } catch (err) {
            setError('❌ Grup oluşturulamadı: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleInviteMember = async (groupId) => {
        if (!formData.invitedUserId) {
            setError('❌ Davet edilecek kullanıcı ID\'si girin');
            return;
        }

        try {
            await familyService.inviteMember(groupId, parseInt(formData.invitedUserId));
            setSuccess('✅ Davet gönderildi!');
            setFormData({ ...formData, invitedUserId: '' });
        } catch (err) {
            setError('❌ Davet gönderilemedi');
        }
    };

    return (
        <div>
            <h1>👨‍👩‍👧‍👦 Aile Grubu Yönetimi</h1>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Grup Oluştur Formu */}
            {userRole === 'FamilyLeader' || userRole === 'Admin' ? (
                <>
                    {showForm && (
                        <form className="card" onSubmit={handleCreateGroup}>
                            <h3>➕ Yeni Grup Oluştur</h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Grup Adı</label>
                                    <input 
                                        type="text"
                                        value={formData.groupName}
                                        onChange={(e) => setFormData({...formData, groupName: e.target.value})}
                                        placeholder="Örn: Aile Bütçesi"
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
                    )}

                    {!showForm && (
                        <button 
                            className="btn-primary"
                            onClick={() => setShowForm(true)}
                            style={{ marginBottom: '1rem' }}
                        >
                            ➕ Yeni Grup Oluştur
                        </button>
                    )}
                </>
            ) : null}

            {/* Gruplar Listesi */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">📋 Aile Grupları ({groups.length})</h3>
                </div>

                {groups.length > 0 ? (
                    <div className="grid">
                        {groups.map(group => (
                            <div key={group.group_id} className="card">
                                <div className="card-header">
                                    <h3 className="card-title">👥 {group.group_name}</h3>
                                </div>

                                <p style={{ marginBottom: '1rem', color: '#666' }}>
                                    {group.description}
                                </p>

                                {(userRole === 'FamilyLeader' || userRole === 'Admin') && (
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Üye ID</label>
                                            <input 
                                                type="number"
                                                value={formData.invitedUserId}
                                                onChange={(e) => setFormData({...formData, invitedUserId: e.target.value})}
                                                placeholder="Davet edilecek kullanıcı ID"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <button 
                                                type="button"
                                                className="btn-primary"
                                                onClick={() => handleInviteMember(group.group_id)}
                                                style={{ marginTop: '1.5rem' }}
                                            >
                                                📨 Davet Gönder
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>Henüz bir aile grubu oluşturulmamış.</p>
                    </div>
                )}
            </div>

            {/* Bilgi */}
            <div className="card mt-3">
                <h3>ℹ️ Aile Grubu Nedir?</h3>
                <ul style={{ marginLeft: '1.5rem' }}>
                    <li><strong>Aile Yöneticisi:</strong> Ortak bütçe grupları oluşturabilir</li>
                    <li><strong>Grup Üyeleri:</strong> Ortak harcama havuzuna katkı sağlayabilir</li>
                    <li><strong>Ortak Bütçe:</strong> Tüm üyelerin harcamaları tek bir havuzda izlenir</li>
                    <li><strong>Yönetim:</strong> Aile Yöneticisi tüm grup işlemlerini kontrol eder</li>
                </ul>
            </div>

            {userRole !== 'FamilyLeader' && userRole !== 'Admin' && (
                <div className="alert alert-warning mt-3">
                    <strong>💡 Bilgi:</strong> Aile grupları oluşturmak için Aile Yöneticisi rolüne sahip olmanız gerekir.
                </div>
            )}
        </div>
    );
}
