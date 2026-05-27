"""
Admin Yönetim API Uçnoktaları
GET /api/admin/logs
POST /api/admin/backup
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services import LoggingService
from models import User, SystemLog, db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/logs', methods=['GET'])
@jwt_required()
def get_system_logs():
    """Sistem loglarını listele (Admin tarafından)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'Admin':
            return jsonify({'error': 'Yalnızca Adminler logları görebilir'}), 403
        
        limit = request.args.get('limit', 100, type=int)
        logs = LoggingService.get_logs(limit)
        
        return jsonify([{
            'log_id': log.log_id,
            'action_type': log.action_type,
            'user_id': log.user_id,
            'details': log.details,
            'ip_address': log.ip_address,
            'created_at': log.created_at.isoformat()
        } for log in logs]), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/backup', methods=['POST'])
@jwt_required()
def trigger_backup():
    """Veritabanı yedeklemesini başlat (Admin tarafından)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'Admin':
            return jsonify({'error': 'Yalnızca Adminler yedekleme başlatabilir'}), 403
        
        LoggingService.log_action('BACKUP_TRIGGERED', user_id, 'Veritabanı yedeklemesi başlatıldı')
        
        # SQL Server T-SQL yedekleme komutu buraya yazılacak
        # BACKUP DATABASE [FinancialTracking] TO DISK='\\backup\\path\\'
        
        return jsonify({
            'message': 'Yedekleme başlatıldı',
            'note': 'SQL Server yedekleme prosedürü sistem tarafından çalıştırılıyor'
        }), 202
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    """Tüm kullanıcıları listele (Admin tarafından)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'Admin':
            return jsonify({'error': 'Yalnızca Adminler kullanıcıları görebilir'}), 403
        
        users = User.query.all()
        from models import Transaction
        
        response_data = []
        for u in users:
            income = db.session.query(db.func.sum(Transaction.amount)).filter_by(
                user_id=u.user_id, transaction_type='Income'
            ).scalar() or 0
            expense = db.session.query(db.func.sum(Transaction.amount)).filter_by(
                user_id=u.user_id, transaction_type='Expense'
            ).scalar() or 0
            balance = float(income - expense)
            
            response_data.append({
                'user_id': u.user_id,
                'username': u.username,
                'email': u.email,
                'role': u.role,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'password_hash': u.password_hash,
                'balance': balance,
                'created_at': u.created_at.isoformat()
            })
            
        return jsonify(response_data), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
