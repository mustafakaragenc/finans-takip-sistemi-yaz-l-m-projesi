# Finans Takip Sistemi - Kurulum Kılavuzu

## Backend Kurulumu (Python + Flask)

### 1. Ortamı Hazırla
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 2. Veritabanını Kur
- SQL Server'da `FinancialTracking` veritabanı oluştur
- `database/schema.sql` dosyasını SQL Server Management Studio'da çalıştır

### 3. Ortam Değişkenlerini Ayarla
- `.env.example` dosyasını `.env` olarak kopyala
- Veritabanı bağlantı dizesini güncelle
- JWT secret key'i değiştir

### 4. API'yi Başlat
```bash
python app.py
# API: http://localhost:5000
```

---

## Frontend Kurulumu (React)

### 1. Bağımlılıkları Yükle
```bash
cd frontend
npm install
```

### 2. API URL'sini Ayarla
`.env` dosyası oluştur:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Geliştirme Sunucusunu Başlat
```bash
npm start
# UI: http://localhost:3000
```

---

## Test Etme

### 1. Kullanıcı Kaydı
- Frontend'de "Kayıt Ol" formunu doldur

### 2. Giriş Yap
- Oluşturduğun hesapla giriş yap

### 3. İşlem Ekle
- Dashboard'a git
- Yeni harcama/gelir ekle

### 4. Bütçe Limiti Ayarla
- Aylık kategorilere limit belirle
- Limit aşıldığında uyarı al

---

## Rol Bazlı Test

### Individual Kullanıcı
- Kendi işlemlerini yönetir
- Kişisel raporları görür

### FamilyLeader
- Aile grubu oluştur
- Üye davet et
- Ortak bütçe yönet

### Admin
- Tüm kullanıcıları ve logları görüntüle
- Yedekleme başlat
- Sistem loglarını incele

---

## Yapı Dosyaları

```
backend/
├── app.py                 # Ana uygulamaBEĞ
├── models.py             # Veritabanı modelleri
├── services.py           # İş mantığı
├── routes/               # API uçnoktaları
│   ├── auth_routes.py
│   ├── transaction_routes.py
│   ├── budget_routes.py
│   ├── family_routes.py
│   └── admin_routes.py

frontend/
├── src/
│   ├── components/       # React bileşenleri
│   │   ├── AuthPage.jsx
│   │   ├── Dashboard.jsx
│   │   └── TransactionList.jsx
│   ├── services/         # API servisi
│   │   └── apiService.js
│   └── App.jsx          # Ana bileşen
├── package.json

database/
└── schema.sql           # SQL Server şeması
```

---

## Güvenlik Notları
- ✓ Şifreler bcrypt ile şifreli
- ✓ JWT token tabanlı kimlik doğrulama
- ✓ Rol bazlı erişim kontrolü
- ✓ Foreign Key constraints ile veri bütünlüğü
- ✓ Sistem logları yönetim denetimi için

---

**Sorun mu var?** Logları kontrol et ve hata mesajlarını oku.
