/**
 * Bütçe Yönetimi Bileşeni
 * Aylık bütçe limitleri belirleme ve izleme
 */
import React, { useState, useEffect } from 'react';
import { budgetService, transactionService } from '../services/apiService';

export default function BudgetManagement() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [transactions, setTransactions] = useState([]);

    const [formData, setFormData] = useState({
        categoryId: 1,
        monthlyLimit: '',
        monthYear: new Date().toISOString().slice(0, 7)
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [budgetRes, transRes] = await Promise.all([
                budgetService.getLimits(),
                transactionService.getAll()
            ]);
            setBudgets(budgetRes.data || []);
            setTransactions(transRes.data || []);
        } catch (err) {
            setError('❌ Veri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await budgetService.setLimit(
                parseInt(formData.categoryId),
                parseFloat(formData.monthlyLimit),
                formData.monthYear
            );
            setSuccess('✅ Bütçe limiti ayarlandı!');
            setFormData({
                categoryId: 1,
                monthlyLimit: '',
                monthYear: new Date().toISOString().slice(0, 7)
            });
            setShowForm(false);
            fetchData();
        } catch (err) {
            setError('❌ İşlem başarısız: ' + (err.response?.data?.error || err.message));
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <h3>Bütçe verileri yükleniyor...</h3>
            </div>
        );
    }

    const expenseByCategory = transactions
        .filter(t => t.transaction_type === 'Expense')
        .reduce((acc, t) => {
            const cat = t.category_id;
            acc[cat] = (acc[cat] || 0) + parseFloat(t.amount);
            return acc;
        }, {});

    return (
        <div>
            <h1>🎯 Bütçe Yönetimi</h1>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Form */}
            {showForm && (
                <form className="card" onSubmit={handleSubmit}>
                    <h3>➕ Yeni Bütçe Limiti Ekle</h3>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Kategori ID</label>
                            <input 
                                type="number"
                                value={formData.categoryId}
                                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                                min="1"
                            />
                        </div>
                        <div className="form-group">
                            <label>Aylık Limit (₺)</label>
                            <input 
                                type="number"
                                step="0.01"
                                value={formData.monthlyLimit}
                                onChange={(e) => setFormData({...formData, monthlyLimit: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Ay</label>
                            <input 
                                type="month"
                                value={formData.monthYear}
                                onChange={(e) => setFormData({...formData, monthYear: e.target.value})}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn-success">
                            💾 Kaydet
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

            {/* Ekle Butonu */}
            {!showForm && (
                <button 
                    className="btn-primary"
                    onClick={() => setShowForm(true)}
                    style={{ marginBottom: '1rem' }}
                >
                    ➕ Yeni Bütçe Ekle
                </button>
            )}

            {/* Bütçeler Listesi */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">📋 Aktif Bütçe Limitleri ({budgets.length})</h3>
                </div>

                {budgets.length > 0 ? (
                    <div className="grid">
                        {budgets.map(budget => {
                            const spent = expenseByCategory[budget.category_id] || 0;
                            const limit = parseFloat(budget.monthly_limit);
                            const percentage = (spent / limit * 100).toFixed(1);
                            const remaining = limit - spent;
                            
                            let status = 'Normal';
                            let statusColor = '#10b981';
                            
                            if (percentage >= 100) {
                                status = 'Aştı';
                                statusColor = '#ef4444';
                            } else if (percentage >= 80) {
                                status = 'Uyarı';
                                statusColor = '#f59e0b';
                            }

                            return (
                                <div key={budget.budget_id} className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Kategori {budget.category_id}</h3>
                                        <span className="badge badge-info">{budget.month_year}</span>
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Limit: ₺{limit.toFixed(2)}</span>
                                            <span style={{ fontWeight: 'bold' }}>Harcanan: ₺{spent.toFixed(2)}</span>
                                        </div>

                                        <div style={{
                                            width: '100%',
                                            height: '30px',
                                            backgroundColor: '#e5e7eb',
                                            borderRadius: '6px',
                                            overflow: 'hidden',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <div style={{
                                                width: `${Math.min(percentage, 100)}%`,
                                                height: '100%',
                                                backgroundColor: statusColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.85rem',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                transition: 'width 0.3s ease'
                                            }}>
                                                {percentage}%
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                            <span>Kalan: ₺{remaining.toFixed(2)}</span>
                                            <span style={{ color: statusColor, fontWeight: 'bold' }}>
                                                {status === 'Normal' ? '✅ Normal' : status === 'Uyarı' ? '⚠️ Uyarı' : '❌ Aştı'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>Henüz bütçe limiti belirlenmedi. Yeni bir limit ekleyerek başlayın!</p>
                    </div>
                )}
            </div>

            {/* Öneriler */}
            <div className="card mt-3">
                <h3>💡 Bütçe Önerileri</h3>
                <p>
                    Kategorileriniz için aylık bütçe limitleri belirleyerek harcamalarınızı kontrol altında tutabilirsiniz.
                    Limit belirlediğiniz kategorilerde, harcamalarınız limitin %80'ine ulaştığında sistem sizi uyaracaktır.
                </p>
            </div>
        </div>
    );
}
