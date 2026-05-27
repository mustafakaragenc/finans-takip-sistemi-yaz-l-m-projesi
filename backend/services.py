"""
İş Mantığı Katmanı (Service Layer)
Sorumlulukların ayrılması prensibine uygun operasyonlar
"""
import bcrypt
from datetime import datetime, timedelta
from models import db, User, Transaction, BudgetLimit, Category, SystemLog

# ============ Kimlik Doğrulama Servisi ============
class AuthService:
    @staticmethod
    def hash_password(password):
        """Şifreyi bcrypt ile şifrele"""
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    @staticmethod
    def verify_password(password, password_hash):
        """Şifreyi doğrula"""
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    
    @staticmethod
    def create_user(username, email, password, first_name, last_name, role='Individual'):
        """Yeni kullanıcı oluştur"""
        if User.query.filter_by(username=username).first():
            raise ValueError('Kullanıcı adı zaten kullanılmaktadır')
        
        if User.query.filter_by(email=email).first():
            raise ValueError('E-posta adresi zaten kullanılmaktadır')
        
        user = User(
            username=username,
            email=email,
            password_hash=AuthService.hash_password(password),
            first_name=first_name,
            last_name=last_name,
            role=role
        )
        db.session.add(user)
        db.session.commit()
        return user

# ============ İşlem (Transaction) Servisi ============
class TransactionService:
    @staticmethod
    def create_transaction(user_id, category_id, amount, transaction_type, description, transaction_date):
        """Yeni işlem ekle"""
        transaction = Transaction(
            user_id=user_id,
            category_id=category_id,
            amount=amount,
            transaction_type=transaction_type,
            description=description,
            transaction_date=transaction_date
        )
        db.session.add(transaction)
        db.session.commit()
        
        # Bütçe alarmı kontrolü
        TransactionService.check_budget_alert(user_id, category_id, transaction_date)
        return transaction
    
    @staticmethod
    def check_budget_alert(user_id, category_id, transaction_date):
        """Bütçe limitinin %80'ine ulaşılmış mı kontrol et"""
        month_year = transaction_date.strftime('%Y-%m')
        budget = BudgetLimit.query.filter_by(
            user_id=user_id,
            category_id=category_id,
            month_year=month_year
        ).first()
        
        if budget:
            total_spent = db.session.query(db.func.sum(Transaction.amount)).filter_by(
                user_id=user_id,
                category_id=category_id
            ).scalar() or 0
            
            if float(total_spent) >= float(budget.monthly_limit) * 0.8:
                return {'alert': True, 'percentage': (float(total_spent) / float(budget.monthly_limit)) * 100}
        return {'alert': False}
    
    @staticmethod
    def get_monthly_report(user_id, year, month):
        """Aylık rapor hazırla"""
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        
        transactions = Transaction.query.filter(
            Transaction.user_id == user_id,
            Transaction.transaction_date >= start_date,
            Transaction.transaction_date < end_date
        ).all()
        
        income = sum(float(t.amount) for t in transactions if t.transaction_type == 'Income')
        expenses = sum(float(t.amount) for t in transactions if t.transaction_type == 'Expense')
        
        return {
            'month': f'{year}-{month:02d}',
            'income': income,
            'expenses': expenses,
            'balance': income - expenses,
            'transaction_count': len(transactions)
        }

# ============ Loglama Servisi (Admin) ============
class LoggingService:
    @staticmethod
    def log_action(action_type, user_id=None, details=None, ip_address=None):
        """Sistem işlemini kayıt et"""
        log = SystemLog(
            action_type=action_type,
            user_id=user_id,
            details=details,
            ip_address=ip_address
        )
        db.session.add(log)
        db.session.commit()
        return log
    
    @staticmethod
    def get_logs(limit=100):
        """Son logları getir"""
        return SystemLog.query.order_by(SystemLog.created_at.desc()).limit(limit).all()
