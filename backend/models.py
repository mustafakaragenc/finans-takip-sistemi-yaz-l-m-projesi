"""
Veritabanı Modelleri (SQLAlchemy ORM)
"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# ============ Kullanıcı Modeli ============
class User(db.Model):
    __tablename__ = 'Users'
    
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    role = db.Column(db.String(20), nullable=False, default='Individual')  # Individual, FamilyLeader, Admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # İlişkiler
    transactions = db.relationship('Transaction', back_populates='user', cascade='all, delete-orphan')
    budget_limits = db.relationship('BudgetLimit', back_populates='user', cascade='all, delete-orphan')
    family_groups = db.relationship('FamilyGroup', back_populates='leader')

# ============ Kategori Modeli ============
class Category(db.Model):
    __tablename__ = 'Categories'
    
    category_id = db.Column(db.Integer, primary_key=True)
    category_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    is_system_default = db.Column(db.Boolean, default=False)
    created_by = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    transactions = db.relationship('Transaction', back_populates='category')
    budget_limits = db.relationship('BudgetLimit', back_populates='category')

# ============ İşlem Modeli ============
class Transaction(db.Model):
    __tablename__ = 'Transactions'
    
    transaction_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('Categories.category_id'), nullable=False)
    amount = db.Column(db.Numeric(15, 2), nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)  # Income, Expense
    description = db.Column(db.String(255))
    transaction_date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = db.relationship('User', back_populates='transactions')
    category = db.relationship('Category', back_populates='transactions')

# ============ Bütçe Limiti Modeli ============
class BudgetLimit(db.Model):
    __tablename__ = 'BudgetLimits'
    
    budget_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('Categories.category_id'), nullable=False)
    monthly_limit = db.Column(db.Numeric(15, 2), nullable=False)
    month_year = db.Column(db.String(7), nullable=False)  # YYYY-MM
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', back_populates='budget_limits')
    category = db.relationship('Category', back_populates='budget_limits')

# ============ Aile Grubu Modeli ============
class FamilyGroup(db.Model):
    __tablename__ = 'FamilyGroups'
    
    group_id = db.Column(db.Integer, primary_key=True)
    group_name = db.Column(db.String(100), nullable=False)
    leader_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable=False)
    description = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    leader = db.relationship('User', back_populates='family_groups')
    members = db.relationship('FamilyMember', back_populates='group', cascade='all, delete-orphan')

# ============ Aile Üyesi Modeli ============
class FamilyMember(db.Model):
    __tablename__ = 'FamilyMembers'
    
    member_id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('FamilyGroups.group_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    group = db.relationship('FamilyGroup', back_populates='members')

# ============ Sistem Logu Modeli ============
class SystemLog(db.Model):
    __tablename__ = 'SystemLogs'
    
    log_id = db.Column(db.Integer, primary_key=True)
    action_type = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable=True)
    details = db.Column(db.String(2000))
    ip_address = db.Column(db.String(45))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
