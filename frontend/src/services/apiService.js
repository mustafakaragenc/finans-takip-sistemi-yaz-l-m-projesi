/**
 * API İletişim Servisi
 * Tüm backend API çağrılarını merkezi olarak yönetir
 */
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Axios instance oluştur
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - JWT token ekle
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ============ Kimlik Doğrulama ============
export const authService = {
    register: (username, email, password, firstName, lastName, role = 'Individual') =>
        apiClient.post('/auth/register', { username, email, password, first_name: firstName, last_name: lastName, role }),
    
    login: (username, password) =>
        apiClient.post('/auth/login', { username, password }),
    
    getProfile: () =>
        apiClient.get('/auth/profile')
};

// ============ İşlemler (Transactions) ============
export const transactionService = {
    create: (categoryId, amount, type, description, date) =>
        apiClient.post('/transactions', {
            category_id: categoryId,
            amount,
            transaction_type: type,
            description,
            transaction_date: date
        }),
    
    getAll: () =>
        apiClient.get('/transactions'),
    
    update: (id, amount, description) =>
        apiClient.put(`/transactions/${id}`, { amount, description }),
    
    delete: (id) =>
        apiClient.delete(`/transactions/${id}`)
};

// ============ Bütçe ============
export const budgetService = {
    setLimit: (categoryId, limit, monthYear) =>
        apiClient.post('/budget/limits', { category_id: categoryId, monthly_limit: limit, month_year: monthYear }),
    
    getLimits: () =>
        apiClient.get('/budget/limits'),
    
    getMonthlyReport: (year, month) =>
        apiClient.get(`/budget/report/${year}/${month}`)
};

// ============ Aile Yönetimi ============
export const familyService = {
    createGroup: (groupName, description) =>
        apiClient.post('/family/groups', { group_name: groupName, description }),
    
    inviteMember: (groupId, userId) =>
        apiClient.post('/family/invite', { group_id: groupId, invited_user_id: userId }),
    
    getGroupMembers: (groupId) =>
        apiClient.get(`/family/groups/${groupId}/members`),

    getGroups: () =>
        apiClient.get('/family/groups'),

    getEligibleUsers: () =>
        apiClient.get('/family/eligible-users')
};

// ============ Admin ============
export const adminService = {
    getLogs: (limit = 100) =>
        apiClient.get(`/admin/logs?limit=${limit}`),
    
    triggerBackup: () =>
        apiClient.post('/admin/backup'),
    
    getAllUsers: () =>
        apiClient.get('/admin/users')
};

export default apiClient;
