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
        user_id = get_jwt_identity()
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
        user_id = get_jwt_identity()
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
        'joined_at': m.joined_at.isoformat()
    } for m in members]), 200
