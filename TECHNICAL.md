# Kişisel Finans Takip Sistemi - Teknik Dokümantasyon

## Mimarı

### Backend Katmanlı Mimari
```
Routes (API Uçnoktaları)
    ↓
Services (İş Mantığı)
    ↓
Models (ORM / Veritabanı)
    ↓
SQL Server (Kalıcı Veri)
```

**Fayda:** Her katmanın tek sorumluluğu vardır (SoC - Separation of Concerns)

---

## Veritabanı Tasarımı

### Tablolar

#### **Users**
- `user_id` (PK)
- `username, email` (UNIQUE)
- `password_hash` (bcrypt)
- `role` (Individual, FamilyLeader, Admin)

#### **Transactions**
- `transaction_id` (PK)
- `user_id` (FK → Users)
- `category_id` (FK → Categories)
- `amount` (DECIMAL 15,2)
- `transaction_type` (Income/Expense)
- `transaction_date` (tarih takibi için)

#### **BudgetLimits**
- `budget_id` (PK)
- `user_id` (FK)
- `category_id` (FK)
- `monthly_limit` (aylık limit)
- `month_year` (YYYY-MM - ayı takip)

#### **FamilyGroups & FamilyMembers**
- Aile yöneticisi (`leader_id`)
- Üyeler (m2m ilişki)

#### **SystemLogs**
- Admin denetimi için tüm kritik işlemler loglanır

---

## API Uçnoktaları

### Kimlik Doğrulama
- `POST /api/auth/register` - Kayıt ol
- `POST /api/auth/login` - Giriş yap (JWT döner)
- `GET /api/auth/profile` - Profil bilgisi (JWT gerekli)

### İşlemler
- `POST /api/transactions` - Yeni işlem
- `GET /api/transactions` - Tüm işlemler
- `PUT /api/transactions/:id` - Güncelle
- `DELETE /api/transactions/:id` - Sil

### Bütçe & Raporlama
- `POST /api/budget/limits` - Limit belirle
- `GET /api/budget/limits` - Limitler listele
- `GET /api/budget/report/2024/3` - Mart 2024 raporu

### Aile Yönetimi (FamilyLeader)
- `POST /api/family/groups` - Grup oluştur
- `POST /api/family/invite` - Üye davet et
- `GET /api/family/groups/:id/members` - Üyeleri listele

### Admin
- `GET /api/admin/logs` - Sistem logları
- `POST /api/admin/backup` - Yedekleme başlat
- `GET /api/admin/users` - Tüm kullanıcılar

---

## Güvenlik İçeriği

### Şifre Güvenliği
```python
# Bcrypt salt rounds = 12 (yavaş, güvenli)
password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))
```

### JWT Token
- 24 saatlik expiry (yapılandırılabilir)
- Secret key production'da zaman zaman değiştirilmeli

### Rol Bazlı Erişim
```python
if user.role != 'Admin':
    return 403 Forbidden
```

### SQL Injection Koruması
- SQLAlchemy ORM parametrized queries kullanır
- Direkt SQL yazılmamıştır

---

## Test Stratejisi

### Birim Testleri (Unit Tests)
- `services.py` içindeki fonksiyonlar izole test edilir
- Mock veritabanı veya test veritabanı kullanılır

### İntegrasyon Testleri
- API uçnoktaları test edilir
- Gerçek veritabanı bağlantısı (test tabloları)

### Rol Testleri
- Individual → kendi verilerine erişebilir
- FamilyLeader → grup yönetebilir
- Admin → tüm sisteme erişebilir

---

## Performans Notları

### Veri Tabanı İndeksleri
```sql
CREATE INDEX idx_transactions_user ON Transactions(user_id);
CREATE INDEX idx_transactions_date ON Transactions(transaction_date);
```
→ Sorguları hızlandırır

### Pagination (İleri Aşama)
```python
@app.route('/transactions?page=1&limit=20')
# Büyük veri setlerini yönetir
```

---

## Bakım ve İşletme

### Veritabanı Yedeklemesi
```sql
BACKUP DATABASE [FinancialTracking] 
TO DISK='\\backup\\path\\backup.bak'
```

### Log Arşivleme
- Aylık olarak eski logları taşı
- Disk alanı tasarrufu

### Kullanıcı Şifre Sıfırlama
- Admin panelinden kullanıcı şifresini sıfırlama özelliği eklenebilir

---

## Genişletme Noktaları

1. **E-posta Bildirimleri** - Bütçe uyarıları e-posta ile gönder
2. **Mobil Uygulaması** - Aynı API'yi kullan
3. **İstatistikler** - Harcama trendleri (ML modeli)
4. **Dış API İntegrasyonu** - Banka bağlantısı
5. **Çok Dil Desteği** - i18n yapılandırması

---

**Son Güncelleme:** Şubat 2026
**Yazılım Mühendisliği Ders Projesi**
