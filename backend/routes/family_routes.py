"""
Aile Bütçe Yönetimi API Uçnoktaları
POST /api/family/groups - Grup oluştur
POST /api/family/invite - Üye davet et
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services import LoggingService
from models import FamilyGroup, FamilyMember, User, db

family_bp = Blueprint('family', __name__)

@family_bp.route('/groups', methods=['POST'])
@jwt_required()
def create_family_group():
    """Yeni aile grubu oluştur (FamilyLeader tarafından)"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if user.role != 'FamilyLeader':
            return jsonify({'error': 'Yalnızca Aile Yöneticileri grup oluşturabilir'}), 403
        
        data = request.get_json()
        group = FamilyGroup(
            group_name=data.get('group_name'),
            leader_id=user_id,
            description=data.get('description')
        )
        db.session.add(group)
        db.session.commit()
        
        LoggingService.log_action('FAMILY_GROUP_CREATED', user_id, f'{data.get("group_name")} grubu oluşturuldu')
        
        return jsonify({'message': 'Grup oluşturuldu', 'group_id': group.group_id}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@family_bp.route('/invite', methods=['POST'])
@jwt_required()
def invite_member():
    """Aile grubuna üye davet et"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        group = FamilyGroup.query.get(data.get('group_id'))
        if not group or group.leader_id != user_id:
            return jsonify({'error': 'Grup bulunamadı veya yetkiniz yok'}), 404
        
        # Davet edilen kullanıcı varsa ekle
        invited_user = User.query.get(data.get('invited_user_id'))
        if not invited_user:
            return jsonify({'error': 'Kullanıcı bulunamadı'}), 404
        
        member = FamilyMember(group_id=group.group_id, user_id=invited_user.user_id)
        db.session.add(member)
        db.session.commit()
        
        LoggingService.log_action('FAMILY_MEMBER_ADDED', user_id, f'{invited_user.username} gruba eklendi')
        
        return jsonify({'message': 'Üye gruba eklendi'}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@family_bp.route('/groups/<int:group_id>/members', methods=['GET'])
@jwt_required()
def get_group_members(group_id):
    """Grup üyelerini listele"""
    members = FamilyMember.query.filter_by(group_id=group_id).all()
    
    return jsonify([{
        'member_id': m.member_id,
        'user_id': m.user_id,
        'username': m.user.username if m.user else 'Bilinmeyen',
        'fullname': f"{m.user.first_name} {m.user.last_name}" if m.user else 'Bilinmeyen',
        'joined_at': m.joined_at.isoformat()
    } for m in members]), 200

@family_bp.route('/groups', methods=['GET'])
@jwt_required()
def get_family_groups():
    """Kullanıcının üye olduğu veya yönettiği aile gruplarını listele"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if user.role == 'FamilyLeader' or user.role == 'Admin':
            groups = FamilyGroup.query.filter_by(leader_id=user_id).all()
        else:
            memberships = FamilyMember.query.filter_by(user_id=user_id).all()
            group_ids = [m.group_id for m in memberships]
            groups = FamilyGroup.query.filter(FamilyGroup.group_id.in_(group_ids)).all() if group_ids else []
            
        from models import Transaction
        return jsonify([{
            'group_id': g.group_id,
            'group_name': g.group_name,
            'leader_id': g.leader_id,
            'description': g.description,
            'created_at': g.created_at.isoformat(),
            'members': [{
                'user_id': m.user_id,
                'username': m.user.username if m.user else 'Bilinmeyen',
                'fullname': f"{m.user.first_name} {m.user.last_name}" if m.user else 'Bilinmeyen',
                'email': m.user.email if m.user else '-',
                'balance': float((db.session.query(db.func.sum(Transaction.amount)).filter_by(user_id=m.user_id, transaction_type='Income').scalar() or 0) - (db.session.query(db.func.sum(Transaction.amount)).filter_by(user_id=m.user_id, transaction_type='Expense').scalar() or 0)) if m.user else 0.0
            } for m in g.members]
        } for g in groups]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@family_bp.route('/eligible-users', methods=['GET'])
@jwt_required()
def get_eligible_users():
    """Aileye eklenebilecek bağımsız kullanıcıları listele"""
    try:
        taken_members = FamilyMember.query.all()
        taken_user_ids = [m.user_id for m in taken_members]
        
        leaders = FamilyGroup.query.all()
        leader_ids = [l.leader_id for l in leaders]
        
        exclude_ids = set(taken_user_ids + leader_ids)
        
        users = User.query.filter(User.role == 'Individual')
        if exclude_ids:
            users = users.filter(~User.user_id.in_(exclude_ids))
            
        return jsonify([{
            'user_id': u.user_id,
            'username': u.username,
            'fullname': f"{u.first_name} {u.last_name}",
            'email': u.email
        } for u in users.all()]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@family_bp.route('/groups/<int:group_id>/members/<int:invited_user_id>', methods=['DELETE'])
@jwt_required()
def remove_member(group_id, invited_user_id):
    """Aile grubundan üye çıkar"""
    try:
        user_id = int(get_jwt_identity())
        group = FamilyGroup.query.get(group_id)
        if not group or group.leader_id != user_id:
            return jsonify({'error': 'Grup bulunamadı veya yetkiniz yok'}), 404
        
        member = FamilyMember.query.filter_by(group_id=group_id, user_id=invited_user_id).first()
        if not member:
            return jsonify({'error': 'Üye grupta bulunamadı'}), 404
        
        db.session.delete(member)
        db.session.commit()
        
        LoggingService.log_action('FAMILY_MEMBER_REMOVED', user_id, f'Kullanıcı {invited_user_id} gruptan çıkarıldı')
        
        return jsonify({'message': 'Üye gruptan çıkarıldı'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
