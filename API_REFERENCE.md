# API Referans Kılavuzu

## Temel Bilgi

- **Base URL:** `http://localhost:5000/api`
- **Content-Type:** `application/json`
- **Kimlik Doğrulama:** JWT (Bearer Token)

---

## Kimlik Doğrulama (Auth)

### 1. Kayıt Ol
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Cevap (201):**
```json
{
  "message": "Kullanıcı başarıyla oluşturuldu",
  "user_id": 1,
  "username": "john_doe"
}
```

---

### 2. Giriş Yap
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Cevap (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": 1,
  "username": "john_doe",
  "role": "Individual"
}
```

---

### 3. Profil Bilgisi
```http
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Cevap (200):**
```json
{
  "user_id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "Individual"
}
```

---

## İşlem Yönetimi (Transactions)

### 1. Yeni İşlem Ekle
```http
POST /api/transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "category_id": 1,
  "amount": 250.50,
  "transaction_type": "Expense",
  "description": "Kafe kahvesi",
  "transaction_date": "2024-03-15T10:30:00Z"
}
```

**Cevap (201):**
```json
{
  "message": "İşlem başarıyla oluşturuldu",
  "transaction_id": 42
}
```

---

### 2. İşlemler Listele
```http
GET /api/transactions
Authorization: Bearer {token}
```

**Cevap (200):**
```json
[
  {
    "transaction_id": 42,
    "category_id": 1,
    "amount": 250.50,
    "type": "Expense",
    "description": "Kafe kahvesi",
    "date": "2024-03-15T10:30:00Z"
  },
  {
    "transaction_id": 41,
    "category_id": 2,
    "amount": 5000.00,
    "type": "Income",
    "description": "Maaş",
    "date": "2024-03-01T00:00:00Z"
  }
]
```

---

### 3. İşlem Güncelle
```http
PUT /api/transactions/42
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 300.00,
  "description": "Pahalı kahvesi"
}
```

**Cevap (200):**
```json
{
  "message": "İşlem güncellendi"
}
```

---

### 4. İşlem Sil
```http
DELETE /api/transactions/42
Authorization: Bearer {token}
```

**Cevap (200):**
```json
{
  "message": "İşlem silindi"
}
```

---

## Bütçe ve Raporlama

### 1. Bütçe Limiti Ayarla
```http
POST /api/budget/limits
Authorization: Bearer {token}
Content-Type: application/json

{
  "category_id": 1,
  "monthly_limit": 1000.00,
  "month_year": "2024-03"
}
```

**Cevap (201):**
```json
{
  "message": "Bütçe limiti ayarlandı",
  "budget_id": 5
}
```

---

### 2. Bütçe Limitlerini Listele
```http
GET /api/budget/limits
Authorization: Bearer {token}
```

**Cevap (200):**
```json
[
  {
    "budget_id": 5,
    "category_id": 1,
    "monthly_limit": 1000.00,
    "month_year": "2024-03"
  }
]
```

---

### 3. Aylık Rapor
```http
GET /api/budget/report/2024/3
Authorization: Bearer {token}
```

**Cevap (200):**
```json
{
  "month": "2024-03",
  "income": 5000.00,
  "expenses": 850.50,
  "balance": 4149.50,
  "transaction_count": 6
}
```

---

## Aile Yönetimi

### 1. Grup Oluştur (FamilyLeader)
```http
POST /api/family/groups
Authorization: Bearer {token}
Content-Type: application/json

{
  "group_name": "Aile Bütçesi",
  "description": "İstanbul'daki aile harcamaları"
}
```

**Cevap (201):**
```json
{
  "message": "Grup oluşturuldu",
  "group_id": 3
}
```

---

### 2. Üye Davet Et
```http
POST /api/family/invite
Authorization: Bearer {token}
Content-Type: application/json

{
  "group_id": 3,
  "invited_user_id": 2
}
```

**Cevap (201):**
```json
{
  "message": "Üye gruba eklendi"
}
```

---

### 3. Grup Üyelerini Listele
```http
GET /api/family/groups/3/members
Authorization: Bearer {token}
```

**Cevap (200):**
```json
[
  {
    "member_id": 1,
    "user_id": 2,
    "joined_at": "2024-03-10T14:30:00Z"
  }
]
```

---

## Admin İşlemleri

### 1. Sistem Loglarını Görüntüle
```http
GET /api/admin/logs?limit=50
Authorization: Bearer {token}
```

**Cevap (200):**
```json
[
  {
    "log_id": 101,
    "action_type": "LOGIN_SUCCESS",
    "user_id": 1,
    "details": "john_doe giriş yaptı",
    "ip_address": "192.168.1.100",
    "created_at": "2024-03-15T10:30:00Z"
  }
]
```

---

### 2. Yedekleme Başlat
```http
POST /api/admin/backup
Authorization: Bearer {token}
```

**Cevap (202):**
```json
{
  "message": "Yedekleme başlatıldı",
  "note": "SQL Server yedekleme prosedürü sistem tarafından çalıştırılıyor"
}
```

---

### 3. Tüm Kullanıcıları Listele
```http
GET /api/admin/users
Authorization: Bearer {token}
```

**Cevap (200):**
```json
[
  {
    "user_id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "Individual",
    "created_at": "2024-03-01T00:00:00Z"
  },
  {
    "user_id": 2,
    "username": "admin_user",
    "email": "admin@example.com",
    "role": "Admin",
    "created_at": "2024-02-15T00:00:00Z"
  }
]
```

---

## Hata Cevapları

### 401 Unauthorized
```json
{
  "error": "Geçersiz kullanıcı adı veya şifre"
}
```

### 403 Forbidden
```json
{
  "error": "Yalnızca Adminler logları görebilir"
}
```

### 404 Not Found
```json
{
  "error": "İşlem bulunamadı"
}
```

### 400 Bad Request
```json
{
  "error": "Bütçe limiti ayarlanırken hata oluştu"
}
```

### 500 Internal Server Error
```json
{
  "error": "Sunucu hatası"
}
```

---

## cURL Örnekleri

### Hızlı Test
```bash
# Kayıt ol
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test1","email":"test@test.com","password":"Test123!","first_name":"Test","last_name":"User"}'

# Giriş yap
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test1","password":"Test123!"}'

# Token ile işlem ekle (TOKEN yerine üstteki cevaptan gelen access_token koyun)
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category_id":1,"amount":100,"transaction_type":"Expense","description":"Test","transaction_date":"2024-03-15T10:00:00Z"}'
```

---

**Dokümantasyon Güncellemesi:** Şubat 2026
