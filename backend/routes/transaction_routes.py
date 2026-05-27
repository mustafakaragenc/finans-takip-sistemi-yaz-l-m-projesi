"""
İşlem (Harcama/Gelir) API Uçnoktaları
GET/POST /api/transactions
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services import TransactionService, LoggingService
from models import Transaction, db
from datetime import datetime

transaction_bp = Blueprint('transactions', __name__)

@transaction_bp.route('', methods=['POST'])
@jwt_required()
def create_transaction():
    """Yeni işlem ekle"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Tarihi parse et
        date_str = data.get('transaction_date')
        if isinstance(date_str, str):
            transaction_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        else:
            transaction_date = datetime.now().date()
        
        transaction = TransactionService.create_transaction(
            user_id=user_id,
            category_id=data.get('category_id'),
            amount=data.get('amount'),
            transaction_type=data.get('transaction_type'),  # Income / Expense
            description=data.get('description'),
            transaction_date=transaction_date
        )
        
        LoggingService.log_action('TRANSACTION_CREATED', user_id, f'{data.get("transaction_type")} işlemi oluşturuldu')
        
        return jsonify({
            'message': 'İşlem başarıyla oluşturuldu',
            'transaction_id': transaction.transaction_id
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@transaction_bp.route('', methods=['GET'])
@jwt_required()
def get_transactions():
    """Kullanıcının tüm işlemlerini getir"""
    user_id = get_jwt_identity()
    
    transactions = Transaction.query.filter_by(user_id=user_id).order_by(
        Transaction.transaction_date.desc()
    ).all()
    
    return jsonify([{
        'transaction_id': t.transaction_id,
        'category_id': t.category_id,
        'category_name': t.category.category_name if t.category else f'Kategori {t.category_id}',
        'amount': float(t.amount),
        'transaction_type': t.transaction_type,
        'description': t.description,
        'transaction_date': t.transaction_date.isoformat()
    } for t in transactions]), 200

@transaction_bp.route('/<int:transaction_id>', methods=['PUT'])
@jwt_required()
def update_transaction(transaction_id):
    """İşlemi güncelle"""
    try:
        user_id = get_jwt_identity()
        transaction = Transaction.query.get(transaction_id)
        
        if not transaction or transaction.user_id != user_id:
            return jsonify({'error': 'İşlem bulunamadı veya yetkiniz yok'}), 404
        
        data = request.get_json()
        if 'amount' in data:
            transaction.amount = data['amount']
        if 'description' in data:
            transaction.description = data['description']
        
        db.session.commit()
        LoggingService.log_action('TRANSACTION_UPDATED', user_id, f'İşlem {transaction_id} güncellendi')
        
        return jsonify({'message': 'İşlem güncellendi'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@transaction_bp.route('/<int:transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(transaction_id):
    """İşlemi sil"""
    try:
        user_id = get_jwt_identity()
        transaction = Transaction.query.get(transaction_id)
        
        if not transaction or transaction.user_id != user_id:
            return jsonify({'error': 'İşlem bulunamadı veya yetkiniz yok'}), 404
        
        db.session.delete(transaction)
        db.session.commit()
        LoggingService.log_action('TRANSACTION_DELETED', user_id, f'İşlem {transaction_id} silindi')
        
        return jsonify({'message': 'İşlem silindi'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400
