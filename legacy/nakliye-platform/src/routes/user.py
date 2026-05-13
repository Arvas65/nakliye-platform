from flask import Blueprint, jsonify, request
from src.models.user import User, db
from src.routes.auth import token_required

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['GET'])
@token_required
def get_users(current_user):
    """Tüm kullanıcıları listele (admin işlemi)"""
    try:
        # Sayfalama parametreleri
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        user_type = request.args.get('user_type')  # cargo_owner veya carrier
        
        # Sorgu oluştur
        query = User.query.filter_by(is_active=True)
        
        if user_type:
            query = query.filter_by(user_type=user_type)
        
        # Sayfalama uygula
        users = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'users': [user.to_dict() for user in users.items],
            'total': users.total,
            'pages': users.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Kullanıcılar listelenirken hata oluştu: {str(e)}'}), 500

@user_bp.route('/users/<int:user_id>', methods=['GET'])
@token_required
def get_user(current_user, user_id):
    """Belirli bir kullanıcının bilgilerini getir"""
    try:
        user = User.query.get_or_404(user_id)
        
        # Kullanıcı sadece kendi bilgilerini görebilir
        if current_user.id != user_id:
            return jsonify({'message': 'Bu bilgilere erişim yetkiniz yok'}), 403
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'message': f'Kullanıcı bilgileri alınırken hata oluştu: {str(e)}'}), 500

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
@token_required
def update_user(current_user, user_id):
    """Kullanıcı bilgilerini güncelle"""
    try:
        # Kullanıcı sadece kendi bilgilerini güncelleyebilir
        if current_user.id != user_id:
            return jsonify({'message': 'Bu bilgileri güncelleme yetkiniz yok'}), 403
        
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        # Güncellenebilir alanlar
        updatable_fields = ['full_name', 'phone', 'company_name', 'address']
        
        for field in updatable_fields:
            if field in data:
                setattr(user, field, data[field].strip() if data[field] else None)
        
        # Nakliyeci ise araç bilgilerini güncelle
        if user.user_type == 'carrier':
            carrier_fields = ['vehicle_type', 'vehicle_capacity', 'license_plate']
            for field in carrier_fields:
                if field in data:
                    if field == 'vehicle_capacity':
                        setattr(user, field, data[field])
                    else:
                        setattr(user, field, data[field].strip() if data[field] else None)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Kullanıcı bilgileri başarıyla güncellendi',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Kullanıcı güncellenirken hata oluştu: {str(e)}'}), 500

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(current_user, user_id):
    """Kullanıcı hesabını deaktive et"""
    try:
        # Kullanıcı sadece kendi hesabını silebilir
        if current_user.id != user_id:
            return jsonify({'message': 'Bu hesabı silme yetkiniz yok'}), 403
        
        user = User.query.get_or_404(user_id)
        
        # Hesabı tamamen silmek yerine deaktive et
        user.is_active = False
        db.session.commit()
        
        return jsonify({'message': 'Hesap başarıyla deaktive edildi'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Hesap silinirken hata oluştu: {str(e)}'}), 500

@user_bp.route('/carriers', methods=['GET'])
def get_carriers():
    """Aktif nakliyecileri listele (herkese açık)"""
    try:
        # Sayfalama parametreleri
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Filtreleme parametreleri
        city = request.args.get('city')
        vehicle_type = request.args.get('vehicle_type')
        min_capacity = request.args.get('min_capacity', type=float)
        
        # Sorgu oluştur
        query = User.query.filter_by(user_type='carrier', is_active=True, is_verified=True)
        
        if city:
            query = query.filter(User.address.contains(city))
        
        if vehicle_type:
            query = query.filter_by(vehicle_type=vehicle_type)
        
        if min_capacity:
            query = query.filter(User.vehicle_capacity >= min_capacity)
        
        # Sayfalama uygula
        carriers = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'carriers': [carrier.to_dict() for carrier in carriers.items],
            'total': carriers.total,
            'pages': carriers.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Nakliyeciler listelenirken hata oluştu: {str(e)}'}), 500
