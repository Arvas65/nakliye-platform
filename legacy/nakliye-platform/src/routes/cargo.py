from flask import Blueprint, jsonify, request
from src.models.user import User, db
from src.models.cargo import CargoPost
from src.routes.auth import token_required
from datetime import datetime

cargo_bp = Blueprint('cargo', __name__)

@cargo_bp.route('/cargo-posts', methods=['POST'])
@token_required
def create_cargo_post(current_user):
    """Yük ilanı oluştur"""
    try:
        # Sadece yük sahipleri ilan oluşturabilir
        if current_user.user_type != 'cargo_owner':
            return jsonify({'message': 'Sadece yük sahipleri ilan oluşturabilir'}), 403
        
        data = request.get_json()
        
        # Gerekli alanları kontrol et
        required_fields = ['title', 'cargo_type', 'weight', 'pickup_city', 'delivery_city']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'message': f'{field} alanı gereklidir'}), 400
        
        # Yük ilanı oluştur
        cargo_post = CargoPost(
            owner_id=current_user.id,
            title=data['title'].strip(),
            description=data.get('description', '').strip(),
            cargo_type=data['cargo_type'].strip(),
            weight=float(data['weight']),
            volume=float(data['volume']) if data.get('volume') else None,
            pickup_city=data['pickup_city'].strip(),
            pickup_district=data.get('pickup_district', '').strip(),
            pickup_address=data.get('pickup_address', '').strip(),
            pickup_lat=float(data['pickup_lat']) if data.get('pickup_lat') else None,
            pickup_lng=float(data['pickup_lng']) if data.get('pickup_lng') else None,
            delivery_city=data['delivery_city'].strip(),
            delivery_district=data.get('delivery_district', '').strip(),
            delivery_address=data.get('delivery_address', '').strip(),
            delivery_lat=float(data['delivery_lat']) if data.get('delivery_lat') else None,
            delivery_lng=float(data['delivery_lng']) if data.get('delivery_lng') else None,
            budget_min=float(data['budget_min']) if data.get('budget_min') else None,
            budget_max=float(data['budget_max']) if data.get('budget_max') else None,
            currency=data.get('currency', 'TRY'),
            is_urgent=bool(data.get('is_urgent', False))
        )
        
        # Tarih alanlarını işle
        if data.get('pickup_date'):
            try:
                cargo_post.pickup_date = datetime.fromisoformat(data['pickup_date'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'message': 'Geçersiz alış tarihi formatı'}), 400
        
        if data.get('delivery_date'):
            try:
                cargo_post.delivery_date = datetime.fromisoformat(data['delivery_date'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'message': 'Geçersiz teslim tarihi formatı'}), 400
        
        db.session.add(cargo_post)
        db.session.commit()
        
        return jsonify({
            'message': 'Yük ilanı başarıyla oluşturuldu',
            'cargo_post': cargo_post.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'message': f'Geçersiz veri formatı: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Yük ilanı oluşturulurken hata oluştu: {str(e)}'}), 500

@cargo_bp.route('/cargo-posts', methods=['GET'])
def get_cargo_posts():
    """Yük ilanlarını listele (herkese açık)"""
    try:
        # Sayfalama parametreleri
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Filtreleme parametreleri
        pickup_city = request.args.get('pickup_city')
        delivery_city = request.args.get('delivery_city')
        cargo_type = request.args.get('cargo_type')
        min_weight = request.args.get('min_weight', type=float)
        max_weight = request.args.get('max_weight', type=float)
        is_urgent = request.args.get('is_urgent', type=bool)
        
        # Sorgu oluştur - sadece aktif ilanları göster
        query = CargoPost.query.filter_by(status='active')
        
        if pickup_city:
            query = query.filter(CargoPost.pickup_city.ilike(f'%{pickup_city}%'))
        
        if delivery_city:
            query = query.filter(CargoPost.delivery_city.ilike(f'%{delivery_city}%'))
        
        if cargo_type:
            query = query.filter(CargoPost.cargo_type.ilike(f'%{cargo_type}%'))
        
        if min_weight:
            query = query.filter(CargoPost.weight >= min_weight)
        
        if max_weight:
            query = query.filter(CargoPost.weight <= max_weight)
        
        if is_urgent is not None:
            query = query.filter_by(is_urgent=is_urgent)
        
        # Tarihe göre sırala (en yeni önce)
        query = query.order_by(CargoPost.created_at.desc())
        
        # Sayfalama uygula
        cargo_posts = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'cargo_posts': [post.to_dict() for post in cargo_posts.items],
            'total': cargo_posts.total,
            'pages': cargo_posts.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Yük ilanları listelenirken hata oluştu: {str(e)}'}), 500

@cargo_bp.route('/cargo-posts/<int:post_id>', methods=['GET'])
def get_cargo_post(post_id):
    """Belirli bir yük ilanının detaylarını getir"""
    try:
        cargo_post = CargoPost.query.get_or_404(post_id)
        
        # İlan sahibinin bilgilerini de dahil et
        return jsonify({
            'cargo_post': cargo_post.to_dict(include_offers=True),
            'owner': cargo_post.owner.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Yük ilanı detayları alınırken hata oluştu: {str(e)}'}), 500

@cargo_bp.route('/cargo-posts/<int:post_id>', methods=['PUT'])
@token_required
def update_cargo_post(current_user, post_id):
    """Yük ilanını güncelle"""
    try:
        cargo_post = CargoPost.query.get_or_404(post_id)
        
        # Sadece ilan sahibi güncelleyebilir
        if cargo_post.owner_id != current_user.id:
            return jsonify({'message': 'Bu ilanı güncelleme yetkiniz yok'}), 403
        
        data = request.get_json()
        
        # Güncellenebilir alanlar
        updatable_fields = [
            'title', 'description', 'cargo_type', 'weight', 'volume',
            'pickup_city', 'pickup_district', 'pickup_address',
            'delivery_city', 'delivery_district', 'delivery_address',
            'budget_min', 'budget_max', 'currency', 'is_urgent'
        ]
        
        for field in updatable_fields:
            if field in data:
                if field in ['weight', 'volume', 'budget_min', 'budget_max']:
                    if data[field] is not None:
                        setattr(cargo_post, field, float(data[field]))
                    else:
                        setattr(cargo_post, field, None)
                elif field == 'is_urgent':
                    setattr(cargo_post, field, bool(data[field]))
                else:
                    setattr(cargo_post, field, data[field].strip() if data[field] else None)
        
        # Tarih alanlarını güncelle
        if 'pickup_date' in data:
            if data['pickup_date']:
                try:
                    cargo_post.pickup_date = datetime.fromisoformat(data['pickup_date'].replace('Z', '+00:00'))
                except ValueError:
                    return jsonify({'message': 'Geçersiz alış tarihi formatı'}), 400
            else:
                cargo_post.pickup_date = None
        
        if 'delivery_date' in data:
            if data['delivery_date']:
                try:
                    cargo_post.delivery_date = datetime.fromisoformat(data['delivery_date'].replace('Z', '+00:00'))
                except ValueError:
                    return jsonify({'message': 'Geçersiz teslim tarihi formatı'}), 400
            else:
                cargo_post.delivery_date = None
        
        db.session.commit()
        
        return jsonify({
            'message': 'Yük ilanı başarıyla güncellendi',
            'cargo_post': cargo_post.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({'message': f'Geçersiz veri formatı: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Yük ilanı güncellenirken hata oluştu: {str(e)}'}), 500

@cargo_bp.route('/cargo-posts/<int:post_id>', methods=['DELETE'])
@token_required
def delete_cargo_post(current_user, post_id):
    """Yük ilanını sil (deaktive et)"""
    try:
        cargo_post = CargoPost.query.get_or_404(post_id)
        
        # Sadece ilan sahibi silebilir
        if cargo_post.owner_id != current_user.id:
            return jsonify({'message': 'Bu ilanı silme yetkiniz yok'}), 403
        
        # İlanı tamamen silmek yerine durumunu cancelled yap
        cargo_post.status = 'cancelled'
        db.session.commit()
        
        return jsonify({'message': 'Yük ilanı başarıyla iptal edildi'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Yük ilanı silinirken hata oluştu: {str(e)}'}), 500

@cargo_bp.route('/my-cargo-posts', methods=['GET'])
@token_required
def get_my_cargo_posts(current_user):
    """Kullanıcının kendi yük ilanlarını listele"""
    try:
        # Sadece yük sahipleri kendi ilanlarını görebilir
        if current_user.user_type != 'cargo_owner':
            return jsonify({'message': 'Sadece yük sahipleri bu işlemi yapabilir'}), 403
        
        # Sayfalama parametreleri
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')  # active, completed, cancelled
        
        # Sorgu oluştur
        query = CargoPost.query.filter_by(owner_id=current_user.id)
        
        if status:
            query = query.filter_by(status=status)
        
        # Tarihe göre sırala (en yeni önce)
        query = query.order_by(CargoPost.created_at.desc())
        
        # Sayfalama uygula
        cargo_posts = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'cargo_posts': [post.to_dict(include_offers=True) for post in cargo_posts.items],
            'total': cargo_posts.total,
            'pages': cargo_posts.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Yük ilanları listelenirken hata oluştu: {str(e)}'}), 500

@cargo_bp.route('/cargo-posts/<int:post_id>/complete', methods=['POST'])
@token_required
def complete_cargo_post(current_user, post_id):
    """Yük ilanını tamamlandı olarak işaretle"""
    try:
        cargo_post = CargoPost.query.get_or_404(post_id)
        
        # Sadece ilan sahibi tamamlayabilir
        if cargo_post.owner_id != current_user.id:
            return jsonify({'message': 'Bu ilanı tamamlama yetkiniz yok'}), 403
        
        if cargo_post.status != 'active':
            return jsonify({'message': 'Sadece aktif ilanlar tamamlanabilir'}), 400
        
        cargo_post.status = 'completed'
        db.session.commit()
        
        return jsonify({
            'message': 'Yük ilanı başarıyla tamamlandı',
            'cargo_post': cargo_post.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Yük ilanı tamamlanırken hata oluştu: {str(e)}'}), 500

