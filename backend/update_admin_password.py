"""
Admin şifresini 'admin123' olarak güncelleyen / oluşturan script.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import app, db
from models import User
from services import AuthService

with app.app_context():
    admin_user = User.query.filter_by(username='admin').first()
    if admin_user:
        admin_user.password_hash = AuthService.hash_password('admin123')
        db.session.commit()
        print("Admin sifresi veritabaninda 'admin123' olarak basariyla guncellendi!")
    else:
        admin_user = User(
            username='admin',
            email='admin@finans.com',
            password_hash=AuthService.hash_password('admin123'),
            first_name='Yönetici',
            last_name='Sistem',
            role='Admin'
        )
        db.session.add(admin_user)
        db.session.commit()
        print("Admin kullanicisi 'admin123' sifresiyle veritabaninda olusturuldu!")
