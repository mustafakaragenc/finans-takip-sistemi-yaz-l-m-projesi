# Kişisel Finans Takip Sistemi

Kişisel Finans Takip Sistemi, ailelerin ortak bütçe yönetimi ve bireysel harcama takipleri yapabilmesi için geliştirilmiş modern ve güvenli bir web uygulamasıdır. Flask + SQL Server backend ve React frontend olarak tasarlanmıştır.

## Özellikler
* **3 rol:** Admin, FamilyLeader, Individual
* **Kimlik doğrulama:** JWT tabanlı kimlik doğrulama ve bcrypt ile güvenli şifreleme
* **Finansal İşlemler:** Bireysel harcama/gelir ekleme, güncelleme, silme ve listeleme (CRUD)
* **Kategori Yönetimi:** Bireysel veya sistem genelinde harcama kategorileri tanımlama
* **Bütçe Limitleri:** Kategori bazlı aylık bütçe limitleri tanımlama ve bütçe aşımında otomatik bildirim sistemi (%80 ve üzeri harcamada alarm)
* **Aile Grupları:** Aile liderinin (FamilyLeader) diğer üyeleri davet edip ortak bütçe yönetmesi
* **Admin Paneli:** Tüm kullanıcıları görüntüleme, sistem loglarını inceleme ve yedekleme (backup) başlatma
* **Veri Bütünlüğü:** Foreign Key kısıtlamaları ve işlem güvenliği

## Kurulum

### 1) SQL Server (Veritabanı)
SQL Server Management Studio (SSMS) veya yerel bir SQL Server örneği kullanarak `FinancialTracking` adında bir veritabanı oluştur.
`database/schema.sql` dosyasını bu veritabanında çalıştırarak tabloları oluştur.

Docker kullanmak istersen:
```bash
docker-compose up -d
```

### 2) Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```
`.env` dosyası içinde `DATABASE_URL`, `SECRET_KEY`, `JWT_SECRET_KEY` ve `BACKUP_PATH` değerlerini güncelle.

Çalıştırma:
```bash
python app.py
```
Port: **5000** (Varsayılan)

#### Veritabanı Erişim ve Temel Terminal Sorguları
Yerel SQL Server'a komut satırından bağlanmak için (sqlcmd kuruluysa):
```bash
sqlcmd -S localhost -d FinancialTracking -U sa -P sifreniz
```

Docker içindeki SQL Server'a bağlanmak için:
```bash
docker exec -it <container_name> /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P sifreniz -d FinancialTracking
```

Bağlandıktan sonra çalıştırabileceğin temel terminal sorguları:
```sql
-- Kayıt ekleme (Yeni Harcama Ekleme)
INSERT INTO Transactions (user_id, category_id, amount, transaction_type, description, transaction_date) 
VALUES (1, 2, 1500.00, 'Expense', 'Aylık Market Alışverişi', GETDATE());

-- Kayıt güncelleme (Kullanıcı Rolü Güncelleme)
UPDATE Users SET role = 'FamilyLeader' WHERE user_id = 1;

-- Kayıt silme (Belirli Bütçe Limitini Silme)
DELETE FROM BudgetLimits WHERE budget_id = 1;

-- Kayıt listeleme (Kullanıcının Son Harcamalarını Listeleme)
SELECT TOP 10 transaction_id, amount, transaction_type, description FROM Transactions WHERE user_id = 1 ORDER BY transaction_date DESC;
```

### 3) Frontend
```bash
cd frontend
npm install
copy .env.example .env
```
`.env` dosyası oluştur ve `REACT_APP_API_URL=http://localhost:5000/api` değerini gir.

Çalıştırma:
```bash
npm start
```
Tarayıcı: **http://localhost:3000**

## Varsayılan Admin
Uygulama ilk ayağa kalktığında veritabanında rolü `Admin` olan ilk yetkili kullanıcı otomatik oluşturulabilir veya `.env` üzerinden tanımlanan admin parametreleriyle sisteme giriş sağlanabilir.

## Bütçe & Aile Kuralları
* **Bütçe Alarmları:** Belirlenen kategori bütçesinin %80'i ve üzeri aşıldığında sistem otomatik bildirim/alarm üretir.
* **Aile Yönetimi:** Yalnızca `FamilyLeader` rolündeki kullanıcı aile grubu oluşturabilir ve diğer üyeleri (`Individual`) grubuna davet edebilir.
* **Loglama:** Yapılan tüm kritik işlemler (giriş, harcama kaydı, bütçe aşımı vb.) Admin'in inceleyebilmesi için otomatik olarak `SystemLogs` tablosuna kaydedilir.
