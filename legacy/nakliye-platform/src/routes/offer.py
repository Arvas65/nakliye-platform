from flask import Blueprint, jsonify, request
from src.models.user import User, db
from src.models.cargo import CargoPost
from src.models.offer import Offer
from src.routes.auth import token_required
from datetime import datetime

offer_bp = Blueprint('offer', __name__)

@offer_bp.route('/cargo-posts/<int:post_id>/offers', methods=['POST'])
@token_required
def create_offer(current_user, post_id):
    """Yük ilanına teklif ver"""
    try:
        # Sadece nakliyeciler teklif verebilir
        if current_user.user_type != 'carrier':
            return jsonify({'message': 'Sadece nakliyeciler teklif verebilir'}), 403
        
        # Yük ilanını kontrol et
        cargo_post = CargoPost.query.get_or_404(post_id)
        
        if cargo_post.status != 'active':
            return jsonify({'message': 'Bu ilan artık aktif değil'}), 400
        
        # Kendi ilanına teklif veremez
        if cargo_post.owner_id == current_user.id:
            return jsonify({'message': 'Kendi ilanınıza teklif veremezsiniz'}), 400
        
        # Daha önce teklif verip vermediğini kontrol et
        existing_offer = Offer.query.filter_by(
            cargo_post_id=post_id,
            carrier_id=current_user.id,
            status='pending'
        ).first()
        
        if existing_offer:
            return jsonify({'message': 'Bu ilan için zaten bekleyen bir teklifiniz var'}), 400
        
        data = request.get_json()
        
        # Gerekli alanları kontrol et
        if not data.get('price'):
            return jsonify({'message': 'Teklif fiyatı gereklidir'}), 400
        
        try:
            price = float(data['price'])
            if price <= 0:
                return jsonify({'message': 'Teklif fiyatı pozitif olmalıdır'}), 400
        except ValueError:
            return jsonify({'message': 'Geçersiz fiyat formatı'}), 400
        
        # Teklif oluştur
        offer = Offer(
            cargo_post_id=post_id,
            carrier_id=current_user.id,
            price=price,
            currency=data.get('currency', 'TRY'),
            message=data.get('message', '').strip()
        )
        
        # Tarih alanlarını işle
        if data.get('pickup_date'):
            try:
                offer.pickup_date = datetime.fromisoformat(data['pickup_date'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'message': 'Geçersiz alış tarihi formatı'}), 400
        
        if data.get('delivery_date'):
            try:
                offer.delivery_date = datetime.fromisoformat(data['delivery_date'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'message': 'Geçersiz teslim tarihi formatı'}), 400
        
        db.session.add(offer)
        db.session.commit()
        
        return jsonify({
            'message': 'Teklif başarıyla gönderildi',
            'offer': offer.to_dict(include_carrier=True)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Teklif gönderilirken hata oluştu: {str(e)}'}), 500

@offer_bp.route('/cargo-posts/<int:post_id>/offers', methods=['GET'])
@token_required
def get_cargo_post_offers(current_user, post_id):
    """Yük ilanının tekliflerini listele"""
    try:
        cargo_post = CargoPost.query.get_or_404(post_id)
        
        # Sadece ilan sahibi teklifleri görebilir
        if cargo_post.owner_id != current_user.id:
            return jsonify({'message': 'Bu teklifleri görme yetkiniz yok'}), 403
        
        # Sayfalama parametreleri
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')  # pending, accepted, rejected
        
        # Sorgu oluştur
        query = Offer.query.filter_by(cargo_post_id=post_id)
        
        if status:
            query = query.filter_by(status=status)
        
        # Tarihe göre sırala (en yeni önce)
        query = query.order_by(Offer.created_at.desc())
        
        # Sayfalama uygula
        offers = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'offers': [offer.to_dict(include_carrier=True) for offer in offers.items],
            'total': offers.total,
            'pages': offers.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Teklifler listelenirken hata oluştu: {str(e)}'}), 500

@offer_bp.route('/offers/<int:offer_id>/accept', methods=['POST'])
@token_required
def accept_offer(current_user, offer_id):
    """Teklifi kabul et"""
    try:
        offer = Offer.query.get_or_404(offer_id)
        cargo_post = offer.cargo_post
        
        # Sadece ilan sahibi teklifi kabul edebilir
        if cargo_post.owner_id != current_user.id:
            return jsonify({'message': 'Bu teklifi kabul etme yetkiniz yok'}), 403
        
        if offer.status != 'pending':
            return jsonify({'message': 'Sadece bekleyen teklifler kabul edilebilir'}), 400
        
        if cargo_post.status != 'active':
            return jsonify({'message': 'Bu ilan artık aktif değil'}), 400
        
        # Teklifi kabul et
        offer.status = 'accepted'
        offer.accepted_at = datetime.utcnow()
        
        # Diğer bekleyen teklifleri reddet
        other_offers = Offer.query.filter_by(
            cargo_post_id=cargo_post.id,
            status='pending'
        ).filter(Offer.id != offer_id).all()
        
        for other_offer in other_offers:
            other_offer.status = 'rejected'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Teklif başarıyla kabul edildi',
            'offer': offer.to_dict(include_carrier=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Teklif kabul edilirken hata oluştu: {str(e)}'}), 500

@offer_bp.route('/offers/<int:offer_id>/reject', methods=['POST'])
@token_required
def reject_offer(current_user, offer_id):
    """Teklifi reddet"""
    try:
        offer = Offer.query.get_or_404(offer_id)
        cargo_post = offer.cargo_post
        
        # Sadece ilan sahibi teklifi reddedebilir
        if cargo_post.owner_id != current_user.id:
            return jsonify({'message': 'Bu teklifi reddetme yetkiniz yok'}), 403
        
        if offer.status != 'pending':
            return jsonify({'message': 'Sadece bekleyen teklifler reddedilebilir'}), 400
        
        # Teklifi reddet
        offer.status = 'rejected'
        db.session.commit()
        
        return jsonify({
            'message': 'Teklif reddedildi',
            'offer': offer.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Teklif reddedilirken hata oluştu: {str(e)}'}), 500

@offer_bp.route('/offers/<int:offer_id>/withdraw', methods=['POST'])
@token_required
def withdraw_offer(current_user, offer_id):
    """Teklifi geri çek"""
    try:
        offer = Offer.query.get_or_404(offer_id)
        
        # Sadece teklif sahibi geri çekebilir
        if offer.carrier_id != current_user.id:
            return jsonify({'message': 'Bu teklifi geri çekme yetkiniz yok'}), 403
        
        if offer.status != 'pending':
            return jsonify({'message': 'Sadece bekleyen teklifler geri çekilebilir'}), 400
        
        # Teklifi geri çek
        offer.status = 'withdrawn'
        db.session.commit()
        
        return jsonify({
            'message': 'Teklif geri çekildi',
            'offer': offer.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Teklif geri çekilirken hata oluştu: {str(e)}'}), 500

@offer_bp.route('/my-offers', methods=['GET'])
@token_required
def get_my_offers(current_user):
    """Kullanıcının kendi tekliflerini listele"""
    try:
        # Sadece nakliyeciler kendi tekliflerini görebilir
        if current_user.user_type != 'carrier':
            return jsonify({'message': 'Sadece nakliyeciler bu işlemi yapabilir'}), 403
        
        # Sayfalama parametreleri
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')  # pending, accepted, rejected, withdrawn
        
        # Sorgu oluştur
        query = Offer.query.filter_by(carrier_id=current_user.id)
        
        if status:
            query = query.filter_by(status=status)
        
        # Tarihe göre sırala (en yeni önce)
        query = query.order_by(Offer.created_at.desc())
        
        # Sayfalama uygula
        offers = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'offers': [offer.to_dict(include_cargo=True) for offer in offers.items],
            'total': offers.total,
            'pages': offers.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Teklifler listelenirken hata oluştu: {str(e)}'}), 500

@offer_bp.route('/offers/<int:offer_id>', methods=['GET'])
@token_required
def get_offer(current_user, offer_id):
    """Belirli bir teklifin detaylarını getir"""
    try:
        offer = Offer.query.get_or_404(offer_id)
        
        # Sadece teklif sahibi veya ilan sahibi görebilir
        if offer.carrier_id != current_user.id and offer.cargo_post.owner_id != current_user.id:
            return jsonify({'message': 'Bu teklifi görme yetkiniz yok'}), 403
        
        return jsonify({
            'offer': offer.to_dict(include_carrier=True, include_cargo=True)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Teklif detayları alınırken hata oluştu: {str(e)}'}), 500

@offer_bp.route('/offers/<int:offer_id>', methods=['PUT'])
@token_required
def update_offer(current_user, offer_id):
    """Teklifi güncelle (sadece bekleyen teklifler)"""
    try:
        offer = Offer.query.get_or_404(offer_id)
        
        # Sadece teklif sahibi güncelleyebilir
        if offer.carrier_id != current_user.id:
            return jsonify({'message': 'Bu teklifi güncelleme yetkiniz yok'}), 403
        
        if offer.status != 'pending':
            return jsonify({'message': 'Sadece bekleyen teklifler güncellenebilir'}), 400
        
        data = request.get_json()
        
        # Güncellenebilir alanlar
        if 'price' in data:
            try:
                price = float(data['price'])
                if price <= 0:
                    return jsonify({'message': 'Teklif fiyatı pozitif olmalıdır'}), 400
                offer.price = price
            except ValueError:
                return jsonify({'message': 'Geçersiz fiyat formatı'}), 400
        
        if 'currency' in data:
            offer.currency = data['currency']
        
        if 'message' in data:
            offer.message = data['message'].strip()
        
        # Tarih alanlarını güncelle
        if 'pickup_date' in data:
            if data['pickup_date']:
                try:
                    offer.pickup_date = datetime.fromisoformat(data['pickup_date'].replace('Z', '+00:00'))
                except ValueError:
                    return jsonify({'message': 'Geçersiz alış tarihi formatı'}), 400
            else:
                offer.pickup_date = None
        
        if 'delivery_date' in data:
            if data['delivery_date']:
                try:
                    offer.delivery_date = datetime.fromisoformat(data['delivery_date'].replace('Z', '+00:00'))
                except ValueError:
                    return jsonify({'message': 'Geçersiz teslim tarihi formatı'}), 400
            else:
                offer.delivery_date = None
        
        db.session.commit()
        
        return jsonify({
            'message': 'Teklif başarıyla güncellendi',
            'offer': offer.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Teklif güncellenirken hata oluştu: {str(e)}'}), 500

