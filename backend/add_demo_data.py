from app import app
from models import db, User, Transaction, BudgetLimit
import datetime

with app.app_context():
    user1 = User.query.filter_by(username='user1').first()
    if user1:
        # Demo işlemler ekle
        t1 = Transaction(
            user_id=user1.user_id,
            category_id=1,
            amount=500,
            transaction_type='Income',
            description='Maaş',
            transaction_date=datetime.datetime.now()
        )
        t2 = Transaction(
            user_id=user1.user_id,
            category_id=2,
            amount=50,
            transaction_type='Expense',
            description='Yemek',
            transaction_date=datetime.datetime.now()
        )
        t3 = Transaction(
            user_id=user1.user_id,
            category_id=3,
            amount=100,
            transaction_type='Expense',
            description='Ulaşım',
            transaction_date=datetime.datetime.now()
        )
        db.session.add(t1)
        db.session.add(t2)
        db.session.add(t3)
        
        # Budget limit
        b1 = BudgetLimit(
            user_id=user1.user_id,
            category_id=2,
            monthly_limit=200,
            month_year='2026-05'
        )
        db.session.add(b1)
        db.session.commit()
        print('Demo veri eklendi')
