"""
Kimlik Doğrulama API Uçnoktaları
POST /api/auth/register - Kayıt ol
POST /api/auth/login - Giriş yap
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from services import AuthService, LoggingService
from models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Yeni kullanıcı kaydı"""
    try:
        data = request.get_json()
        
        user = AuthService.create_user(
            username=data.get('username'),
            email=data.get('email'),
            password=data.get('password'),
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            role=data.get('role', 'Individual')
        )
        
        LoggingService.log_action('USER_REGISTERED', user.user_id, f'{user.username} kaydoldu')
        
        return jsonify({
            'message': 'Kullanıcı başarıyla oluşturuldu',
            'user_id': user.user_id,
            'username': user.username
        }), 201
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Kayıt işlemi başarısız'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Kullanıcı giriş yap"""
    try:
        data = request.get_json()
        user = User.query.filter_by(username=data.get('username')).first()
        
        if not user or not AuthService.verify_password(data.get('password'), user.password_hash):
            LoggingService.log_action('LOGIN_FAILED', details=f'{data.get("username")} giriş başarısız')
            return jsonify({'error': 'Geçersiz kullanıcı adı veya şifre'}), 401
        
        access_token = create_access_token(identity=str(user.user_id))
        LoggingService.log_action('LOGIN_SUCCESS', user.user_id, f'{user.username} giriş yaptı')
        
        return jsonify({
            'access_token': access_token,
            'user_id': user.user_id,
            'username': user.username,
            'role': user.role
        }), 200
    
    except Exception as e:
        return jsonify({'error': 'Giriş işlemi başarısız'}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Giriş yapan kullanıcının profili"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Kullanıcı bulunamadı'}), 404
    
    return jsonify({
        'user_id': user.user_id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': user.role
    }), 200
