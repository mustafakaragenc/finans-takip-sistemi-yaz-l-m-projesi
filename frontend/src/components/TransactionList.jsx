import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/apiService';

export default function TransactionList() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        categoryId: '1',
        amount: '',
        type: 'Expense',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await transactionService.getAll();
            setTransactions(response.data || []);
        } catch (error) {
            console.error('Hata:', error);
            setError('❌ İşlemler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (editingId) {
                await transactionService.update(editingId, parseFloat(formData.amount), formData.description);
                setSuccess('✅ Güncellendi!');
            } else {
                await transactionService.create(
                    parseInt(formData.categoryId),
                    parseFloat(formData.amount),
                    formData.type,
                    formData.description,
                    formData.date
                );
                setSuccess('✅ Eklendi!');
            }
            resetForm();
            fetchTransactions();
        } catch (err) {
            setError('❌ Hata: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Silmek istediğinize emin misiniz?')) {
            try {
                await transactionService.delete(id);
                setSuccess('✅ Silindi!');
                fetchTransactions();
            } catch (err) {
                setError('❌ Silme hatası');
            }
        }
    };

    const handleEdit = (transaction) => {
        setFormData({
            categoryId: String(transaction.category_id),
            amount: transaction.amount,
            type: transaction.transaction_type,
            description: transaction.description,
            date: transaction.transaction_date.split('T')[0]
        });
        setEditingId(transaction.transaction_id);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            categoryId: '1',
            amount: '',
            type: 'Expense',
            description: '',
            date: new Date().toISOString().split('T')[0]
        });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <h3>Yükleniyor...</h3>
            </div>
        );
    }

    return (
        <div>
            <h1>💳 İşlem Yönetimi</h1>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showForm ? (
                <form className="card" onSubmit={handleSubmit}>
                    <h3>{editingId ? 'Düzenle' : 'Yeni İşlem Ekle'}</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Tür</label>
                            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                                <option value="Income">Gelir</option>
                                <option value="Expense">Gider</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Kategori ID</label>
                            <input type="number" value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Miktar (₺)</label>
                            <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Tarih</label>
                            <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Açıklama</label>
                            <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn-success">Kaydet</button>
                        <button type="button" className="btn-secondary" onClick={resetForm}>İptal</button>
                    </div>
                </form>
            ) : (
                <button className="btn-primary" onClick={() => setShowForm(true)} style={{ marginBottom: '1rem' }}>
                    ➕ Yeni İşlem Ekle
                </button>
            )}

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">İşlemler ({transactions.length})</h3>
                </div>
                {transactions.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Tarih</th>
                                <th>Tür</th>
                                <th>Kategori</th>
                                <th>Açıklama</th>
                                <th>Miktar</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.transaction_id}>
                                    <td>{new Date(t.transaction_date).toLocaleDateString('tr-TR')}</td>
                                    <td><span className={`badge ${t.transaction_type === 'Income' ? 'badge-income' : 'badge-expense'}`}>{t.transaction_type === 'Income' ? 'Gelir' : 'Gider'}</span></td>
                                    <td>{t.category_name || `Kategori ${t.category_id}`}</td>
                                    <td>{t.description}</td>
                                    <td>₺{parseFloat(t.amount).toFixed(2)}</td>
                                    <td>
                                        <button className="btn-warning btn-icon" onClick={() => handleEdit(t)}>✏️</button>
                                        <button className="btn-danger btn-icon" onClick={() => handleDelete(t.transaction_id)}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Henüz işlem yok</p>
                )}
            </div>
        </div>
    );
}
