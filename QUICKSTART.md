# Finans Takip - Docker Compose (İsteğe Bağlı)

## Docker ile Hızlı Başlangıç

Eğer Docker kurulu ise:

```bash
docker-compose up
```

Bu komut:
- ✓ SQL Server container başlatır
- ✓ Backend API (Flask) başlatır
- ✓ Frontend (React) başlatır

---

## Klasik Başlangıç (Önerilen)

### 1. SQL Server Kurulumu
- SQL Server Express kurulumunu tamamla
- Management Studio ile veritabanı oluştur
- `database/schema.sql` çalıştır

### 2. Backend Kurulumu
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
→ API: http://localhost:5000

### 3. Frontend Kurulumu
```bash
cd frontend
npm install
npm start
```
→ UI: http://localhost:3000

---

## Sorun Giderme

### "Database connection failed"
- SQL Server çalışıyor mu? (Services'te kontrol et)
- `.env` dosyasında bağlantı dizesi doğru mu?

### "Module not found"
```bash
pip install -r requirements.txt  # Backend
npm install                       # Frontend
```

### "Port already in use"
```bash
# Port 5000 kullanılıyorsa
python app.py --port 5001

# Port 3000 kullanılıyorsa
npm start -- --port 3001
```

### JWT Token geçersiz
- Token süresi dolmuş mu?
- Secret key doğru mu?

---

## Proje Yapısı

```
Finans Takip/
├── backend/          Python + Flask
├── frontend/         React
├── database/         SQL Server schema
└── docs/             Dokümantasyon
```

---

## Sorular?

- **Teknik:** TECHNICAL.md oku
- **API:** API_REFERENCE.md oku
- **Kurulum:** SETUP.md oku

Başarılar! 🚀
