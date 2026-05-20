-- ============================================
-- Kişisel Finans Takip - SQL Server Şeması
-- ============================================

-- Kullanıcılar Tablosu
CREATE TABLE [Users] (
    [user_id] INT PRIMARY KEY IDENTITY(1,1),
    [username] VARCHAR(50) UNIQUE NOT NULL,
    [email] VARCHAR(100) UNIQUE NOT NULL,
    [password_hash] VARCHAR(255) NOT NULL,           -- bcrypt ile şifrele
    [first_name] VARCHAR(100),
    [last_name] VARCHAR(100),
    [role] VARCHAR(20) NOT NULL,                      -- 'Individual', 'FamilyLeader', 'Admin'
    [created_at] DATETIME DEFAULT GETDATE(),
    [updated_at] DATETIME DEFAULT GETDATE()
);

-- Kategoriler Tablosu
CREATE TABLE [Categories] (
    [category_id] INT PRIMARY KEY IDENTITY(1,1),
    [category_name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [is_system_default] BIT DEFAULT 0,                -- Admin tarafından oluşturulanlar
    [created_by] INT,
    [created_at] DATETIME DEFAULT GETDATE(),
    FOREIGN KEY ([created_by]) REFERENCES [Users]([user_id]) ON DELETE SET NULL
);

-- Harcama/Gelir Tablosu (İşlemler)
CREATE TABLE [Transactions] (
    [transaction_id] INT PRIMARY KEY IDENTITY(1,1),
    [user_id] INT NOT NULL,
    [category_id] INT NOT NULL,
    [amount] DECIMAL(15, 2) NOT NULL,
    [transaction_type] VARCHAR(20) NOT NULL,          -- 'Income', 'Expense'
    [description] VARCHAR(255),
    [transaction_date] DATETIME NOT NULL,
    [created_at] DATETIME DEFAULT GETDATE(),
    [updated_at] DATETIME DEFAULT GETDATE(),
    FOREIGN KEY ([user_id]) REFERENCES [Users]([user_id]) ON DELETE CASCADE,
    FOREIGN KEY ([category_id]) REFERENCES [Categories]([category_id]) ON DELETE RESTRICT
);

-- Bütçe Hedefleri Tablosu
CREATE TABLE [BudgetLimits] (
    [budget_id] INT PRIMARY KEY IDENTITY(1,1),
    [user_id] INT NOT NULL,
    [category_id] INT NOT NULL,
    [monthly_limit] DECIMAL(15, 2) NOT NULL,
    [month_year] VARCHAR(7) NOT NULL,                 -- 'YYYY-MM' formatı
    [created_at] DATETIME DEFAULT GETDATE(),
    FOREIGN KEY ([user_id]) REFERENCES [Users]([user_id]) ON DELETE CASCADE,
    FOREIGN KEY ([category_id]) REFERENCES [Categories]([category_id]) ON DELETE CASCADE,
    UNIQUE ([user_id], [category_id], [month_year])
);

-- Aile Grupları Tablosu
CREATE TABLE [FamilyGroups] (
    [group_id] INT PRIMARY KEY IDENTITY(1,1),
    [group_name] VARCHAR(100) NOT NULL,
    [leader_id] INT NOT NULL,
    [description] VARCHAR(255),
    [created_at] DATETIME DEFAULT GETDATE(),
    FOREIGN KEY ([leader_id]) REFERENCES [Users]([user_id]) ON DELETE NO ACTION
);

-- Aile Üyeleri Tablosu
CREATE TABLE [FamilyMembers] (
    [member_id] INT PRIMARY KEY IDENTITY(1,1),
    [group_id] INT NOT NULL,
    [user_id] INT NOT NULL,
    [joined_at] DATETIME DEFAULT GETDATE(),
    FOREIGN KEY ([group_id]) REFERENCES [FamilyGroups]([group_id]) ON DELETE CASCADE,
    FOREIGN KEY ([user_id]) REFERENCES [Users]([user_id]) ON DELETE CASCADE,
    UNIQUE ([group_id], [user_id])
);

-- Sistem Logları Tablosu (Admin İçin)
CREATE TABLE [SystemLogs] (
    [log_id] INT PRIMARY KEY IDENTITY(1,1),
    [action_type] VARCHAR(50) NOT NULL,                -- 'LOGIN', 'TRANSACTION_CREATE', 'BACKUP', vb
    [user_id] INT,
    [details] VARCHAR(MAX),
    [ip_address] VARCHAR(45),
    [created_at] DATETIME DEFAULT GETDATE(),
    FOREIGN KEY ([user_id]) REFERENCES [Users]([user_id]) ON DELETE SET NULL
);

-- ============================================
-- İndeksler (Performans İçin)
-- ============================================
CREATE INDEX idx_transactions_user ON [Transactions]([user_id]);
CREATE INDEX idx_transactions_date ON [Transactions]([transaction_date]);
CREATE INDEX idx_budget_limits_user ON [BudgetLimits]([user_id]);
CREATE INDEX idx_family_members_group ON [FamilyMembers]([group_id]);
CREATE INDEX idx_system_logs_date ON [SystemLogs]([created_at]);
