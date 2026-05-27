"""
Bütçe API Uçnoktaları
GET/POST /api/budget/limits
GET /api/budget/report
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services import TransactionService, LoggingService
from models import BudgetLimit, db
from datetime import datetime

budget_bp = Blueprint('budget', __name__)

@budget_bp.route('/limits', methods=['POST'])
@jwt_required()
def set_budget_limit():
    """Kategori için aylık bütçe limiti belirle"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        budget = BudgetLimit(
            user_id=user_id,
            category_id=data.get('category_id'),
            monthly_limit=data.get('monthly_limit'),
            month_year=data.get('month_year')  # YYYY-MM
        )
        db.session.add(budget)
        db.session.commit()
        
        LoggingService.log_action('BUDGET_LIMIT_SET', user_id, f'Bütçe limiti {data.get("category_id")} için ayarlandı')
        
        return jsonify({'message': 'Bütçe limiti ayarlandı', 'budget_id': budget.budget_id}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@budget_bp.route('/limits', methods=['GET'])
@jwt_required()
def get_budget_limits():
    """Kullanıcının bütçe limitlerini getir"""
    user_id = get_jwt_identity()
    
    budgets = BudgetLimit.query.filter_by(user_id=user_id).all()
    
    return jsonify([{
        'budget_id': b.budget_id,
        'category_id': b.category_id,
        'category_name': b.category.category_name if b.category else f'Kategori {b.category_id}',
        'monthly_limit': float(b.monthly_limit),
        'month_year': b.month_year
    } for b in budgets]), 200

@budget_bp.route('/report/<int:year>/<int:month>', methods=['GET'])
@jwt_required()
def get_monthly_report(year, month):
    """Aylık harcama raporu"""
    user_id = get_jwt_identity()
    
    report = TransactionService.get_monthly_report(user_id, year, month)
    
    return jsonify(report), 200
