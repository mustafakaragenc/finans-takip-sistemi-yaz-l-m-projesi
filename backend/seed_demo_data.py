"""
Demo Kullanıcıları Oluşturmak İçin Script
Backend başlatmadan önce çalıştır
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import app, db
from models import User
from services import AuthService

# App context içinde çalış
with app.app_context():
    # Tüm tabloları oluştur
    db.create_all()
    
    # Demo Kullanıcıları
    demo_users = [
        {
            'username': 'admin',
            'email': 'admin@finans.com',
            'password': 'admin123',
            'first_name': 'Yönetici',
            'last_name': 'Sistem',
            'role': 'Admin'
        },
        {
            'username': 'family_leader',
            'email': 'leader@finans.com',
            'password': 'Leader123!',
            'first_name': 'Aile',
            'last_name': 'Yöneticisi',
            'role': 'FamilyLeader'
        },
        {
            'username': 'user1',
            'email': 'user1@finans.com',
            'password': 'User123!',
            'first_name': 'Ahmet',
            'last_name': 'Yılmaz',
            'role': 'Individual'
        },
        {
            'username': 'user2',
            'email': 'user2@finans.com',
            'password': 'User123!',
            'first_name': 'Ayşe',
            'last_name': 'Kara',
            'role': 'Individual'
        }
    ]
    
    # Var olan kullanıcıları kontrol et
    for user_data in demo_users:
        existing = User.query.filter_by(username=user_data['username']).first()
        if not existing:
            user = User(
                username=user_data['username'],
                email=user_data['email'],
                password_hash=AuthService.hash_password(user_data['password']),
                password_plain=user_data['password'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                role=user_data['role']
            )
            db.session.add(user)
            print(f"✓ {user_data['username']} oluşturuldu")
        else:
            print(f"⊗ {user_data['username']} zaten var")
    
    db.session.commit()
    print("\n✅ Demo kullanıcıları hazır!")
    print("\n📋 TEST KREDİLERİ:\n")
    for user in demo_users:
        print(f"  👤 {user['username']}")
        print(f"     Şifre: {user['password']}")
        print(f"     Rol: {user['role']}\n")
