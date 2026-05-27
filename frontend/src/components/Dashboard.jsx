import React, { useState, useEffect } from 'react';
import { budgetService, transactionService } from '../services/apiService';

export default function Dashboard() {
    const [monthlyReport, setMonthlyReport] = useState(null);
    const [budgetLimits, setBudgetLimits] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            
            const [reportRes, budgetRes, transRes] = await Promise.all([
                budgetService.getMonthlyReport(year, month),
                budgetService.getLimits(),
                transactionService.getAll()
            ]);

            setMonthlyReport(reportRes.data);
            setBudgetLimits(budgetRes.data || []);
            setTransactions(transRes.data || []);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <h3>Veri yükleniyor...</h3>
            </div>
        );
    }

    const expenseByCategory = transactions
        .filter(t => t.transaction_type === 'Expense')
        .reduce((acc, t) => {
            const cat = t.category_id || 'Diğer';
            acc[cat] = (acc[cat] || 0) + parseFloat(t.amount);
            return acc;
        }, {});

    return (
        <div>
            <h1>📊 Finans Dashboard</h1>

            <div className="card-stats">
                <div className="stat-box">
                    <div className="stat-value" style={{ color: '#10b981' }}>
                        ₺{(monthlyReport?.income || 0).toFixed(2)}
                    </div>
                    <div className="stat-label">Bu Ay Gelir</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value" style={{ color: '#ef4444' }}>
                        ₺{(monthlyReport?.expenses || 0).toFixed(2)}
                    </div>
                    <div className="stat-label">Bu Ay Gider</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value">
                        ₺{(monthlyReport?.balance || 0).toFixed(2)}
                    </div>
                    <div className="stat-label">Net Bakiye</div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">🎯 Bütçe Limitleri</h3>
                </div>
                {budgetLimits.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Kategori</th>
                                <th>Limit</th>
                                <th>Harcanan</th>
                                <th>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgetLimits.map(budget => {
                                const spent = expenseByCategory[budget.category_id] || 0;
                                const percentage = (spent / budget.monthly_limit * 100).toFixed(1);
                                return (
                                    <tr key={budget.budget_id}>
                                        <td>{budget.category_name || `Kategori ${budget.category_id}`}</td>
                                        <td>₺{parseFloat(budget.monthly_limit).toFixed(2)}</td>
                                        <td>₺{spent.toFixed(2)}</td>
                                        <td><span className="badge badge-info">{percentage}%</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <p>Henüz bütçe limiti yok</p>
                )}
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">💳 Son İşlemler</h3>
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
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.slice(0, 5).map(t => (
                                <tr key={t.transaction_id}>
                                    <td>{new Date(t.transaction_date).toLocaleDateString('tr-TR')}</td>
                                    <td><span className={`badge ${t.transaction_type === 'Income' ? 'badge-income' : 'badge-expense'}`}>
                                        {t.transaction_type === 'Income' ? 'Gelir' : 'Gider'}
                                    </span></td>
                                    <td>{t.category_name || `Kategori ${t.category_id}`}</td>
                                    <td>{t.description}</td>
                                    <td>₺{parseFloat(t.amount).toFixed(2)}</td>
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
