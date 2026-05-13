from flask import Blueprint, jsonify, request
from src.models.user import User, db
from src.models.cargo import CargoPost
from src.models.offer import Offer
from src.models.message import Message, Conversation
from src.routes.auth import token_required
from datetime import datetime
from sqlalchemy import or_, and_

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/conversations', methods=['GET'])
@token_required
def get_conversations(current_user):
    """Kullanıcının konuşmalarını listele"""
    try:
        # Sayfalama parametreleri
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Kullanıcının dahil olduğu konuşmaları bul
        query = Conversation.query.filter(
            or_(
                Conversation.user1_id == current_user.id,
                Conversation.user2_id == current_user.id
            )
        ).filter_by(is_active=True)
        
        # Son mesaj tarihine göre sırala
        query = query.order_by(Conversation.last_message_at.desc())
        
        # Sayfalama uygula
        conversations = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'conversations': [conv.to_dict(current_user.id) for conv in conversations.items],
            'total': conversations.total,
            'pages': conversations.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Konuşmalar listelenirken hata oluştu: {str(e)}'}), 500

@chat_bp.route('/conversations', methods=['POST'])
@token_required
def create_conversation(current_user):
    """Yeni konuşma başlat"""
    try:
        data = request.get_json()
        
        # Gerekli alanları kontrol et
        if not data.get('other_user_id'):
            return jsonify({'message': 'Karşı kullanıcı ID gereklidir'}), 400
        
        other_user_id = int(data['other_user_id'])
        cargo_post_id = data.get('cargo_post_id')
        offer_id = data.get('offer_id')
        
        # Kendisiyle konuşma başlatamaz
        if other_user_id == current_user.id:
            return jsonify({'message': 'Kendinizle konuşma başlatamazsınız'}), 400
        
        # Karşı kullanıcının varlığını kontrol et
        other_user = User.query.get(other_user_id)
        if not other_user or not other_user.is_active:
            return jsonify({'message': 'Kullanıcı bulunamadı'}), 404
        
        # Yük ilanı kontrolü
        if cargo_post_id:
            cargo_post = CargoPost.query.get(cargo_post_id)
            if not cargo_post:
                return jsonify({'message': 'Yük ilanı bulunamadı'}), 404
        
        # Teklif kontrolü
        if offer_id:
            offer = Offer.query.get(offer_id)
            if not offer:
                return jsonify({'message': 'Teklif bulunamadı'}), 404
        
        # Mevcut konuşmayı kontrol et
        user1_id = min(current_user.id, other_user_id)
        user2_id = max(current_user.id, other_user_id)
        
        existing_conversation = Conversation.query.filter_by(
            user1_id=user1_id,
            user2_id=user2_id,
            cargo_post_id=cargo_post_id,
            offer_id=offer_id
        ).first()
        
        if existing_conversation:
            return jsonify({
                'message': 'Konuşma zaten mevcut',
                'conversation': existing_conversation.to_dict(current_user.id)
            }), 200
        
        # Yeni konuşma oluştur
        conversation = Conversation(
            user1_id=user1_id,
            user2_id=user2_id,
            cargo_post_id=cargo_post_id,
            offer_id=offer_id
        )
        
        db.session.add(conversation)
        db.session.commit()
        
        return jsonify({
            'message': 'Konuşma başarıyla oluşturuldu',
            'conversation': conversation.to_dict(current_user.id)
        }), 201
        
    except ValueError:
        return jsonify({'message': 'Geçersiz kullanıcı ID'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Konuşma oluşturulurken hata oluştu: {str(e)}'}), 500

@chat_bp.route('/conversations/<int:conversation_id>/messages', methods=['GET'])
@token_required
def get_messages(current_user, conversation_id):
    """Konuşmanın mesajlarını listele"""
    try:
        # Konuşmayı kontrol et
        conversation = Conversation.query.get_or_404(conversation_id)
        
        # Kullanıcının bu konuşmaya erişim yetkisi var mı?
        if current_user.id not in [conversation.user1_id, conversation.user2_id]:
            return jsonify({'message': 'Bu konuşmaya erişim yetkiniz yok'}), 403
        
        # Sayfalama parametreleri
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        # Mesajları bul (silinmemiş olanlar)
        query = Message.query.filter(
            or_(
                and_(Message.sender_id == conversation.user1_id, Message.receiver_id == conversation.user2_id),
                and_(Message.sender_id == conversation.user2_id, Message.receiver_id == conversation.user1_id)
            )
        )
        
        # Kullanıcının sildiği mesajları hariç tut
        if current_user.id == conversation.user1_id:
            query = query.filter_by(is_deleted_by_sender=False)
        else:
            query = query.filter_by(is_deleted_by_receiver=False)
        
        # Tarihe göre sırala (en eski önce)
        query = query.order_by(Message.created_at.asc())
        
        # Sayfalama uygula
        messages = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        # Okunmamış mesajları okundu olarak işaretle
        unread_messages = Message.query.filter_by(
            receiver_id=current_user.id,
            is_read=False
        ).filter(
            Message.id.in_([msg.id for msg in messages.items])
        ).all()
        
        for message in unread_messages:
            message.mark_as_read()
        
        if unread_messages:
            db.session.commit()
        
        return jsonify({
            'messages': [msg.to_dict(include_sender=True) for msg in messages.items],
            'total': messages.total,
            'pages': messages.pages,
            'current_page': page,
            'per_page': per_page,
            'conversation': conversation.to_dict(current_user.id)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Mesajlar listelenirken hata oluştu: {str(e)}'}), 500

@chat_bp.route('/conversations/<int:conversation_id>/messages', methods=['POST'])
@token_required
def send_message(current_user, conversation_id):
    """Mesaj gönder"""
    try:
        # Konuşmayı kontrol et
        conversation = Conversation.query.get_or_404(conversation_id)
        
        # Kullanıcının bu konuşmaya erişim yetkisi var mı?
        if current_user.id not in [conversation.user1_id, conversation.user2_id]:
            return jsonify({'message': 'Bu konuşmaya erişim yetkiniz yok'}), 403
        
        data = request.get_json()
        
        # Mesaj içeriği kontrolü
        if not data.get('content') or not data['content'].strip():
            return jsonify({'message': 'Mesaj içeriği gereklidir'}), 400
        
        # Alıcıyı belirle
        receiver_id = conversation.user2_id if current_user.id == conversation.user1_id else conversation.user1_id
        
        # Mesaj oluştur
        message = Message(
            sender_id=current_user.id,
            receiver_id=receiver_id,
            cargo_post_id=conversation.cargo_post_id,
            offer_id=conversation.offer_id,
            content=data['content'].strip(),
            message_type=data.get('message_type', 'text')
        )
        
        db.session.add(message)
        db.session.flush()  # ID'yi al
        
        # Konuşmanın son mesaj bilgilerini güncelle
        conversation.last_message_id = message.id
        conversation.last_message_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Mesaj başarıyla gönderildi',
            'sent_message': message.to_dict(include_sender=True, include_receiver=True)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Mesaj gönderilirken hata oluştu: {str(e)}'}), 500

@chat_bp.route('/messages/<int:message_id>/read', methods=['POST'])
@token_required
def mark_message_read(current_user, message_id):
    """Mesajı okundu olarak işaretle"""
    try:
        message = Message.query.get_or_404(message_id)
        
        # Sadece alıcı mesajı okundu olarak işaretleyebilir
        if message.receiver_id != current_user.id:
            return jsonify({'message': 'Bu mesajı okundu olarak işaretleme yetkiniz yok'}), 403
        
        message.mark_as_read()
        db.session.commit()
        
        return jsonify({
            'message': 'Mesaj okundu olarak işaretlendi',
            'read_message': message.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Mesaj işaretlenirken hata oluştu: {str(e)}'}), 500

@chat_bp.route('/messages/<int:message_id>', methods=['DELETE'])
@token_required
def delete_message(current_user, message_id):
    """Mesajı sil (soft delete)"""
    try:
        message = Message.query.get_or_404(message_id)
        
        # Sadece gönderen veya alıcı mesajı silebilir
        if current_user.id not in [message.sender_id, message.receiver_id]:
            return jsonify({'message': 'Bu mesajı silme yetkiniz yok'}), 403
        
        # Kullanıcıya göre silme işareti koy
        if current_user.id == message.sender_id:
            message.is_deleted_by_sender = True
        else:
            message.is_deleted_by_receiver = True
        
        db.session.commit()
        
        return jsonify({'message': 'Mesaj başarıyla silindi'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Mesaj silinirken hata oluştu: {str(e)}'}), 500

@chat_bp.route('/unread-count', methods=['GET'])
@token_required
def get_unread_count(current_user):
    """Kullanıcının toplam okunmamış mesaj sayısını getir"""
    try:
        unread_count = Message.query.filter_by(
            receiver_id=current_user.id,
            is_read=False,
            is_deleted_by_receiver=False
        ).count()
        
        return jsonify({
            'unread_count': unread_count
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Okunmamış mesaj sayısı alınırken hata oluştu: {str(e)}'}), 500

@chat_bp.route('/conversations/<int:conversation_id>/mark-all-read', methods=['POST'])
@token_required
def mark_all_messages_read(current_user, conversation_id):
    """Konuşmadaki tüm mesajları okundu olarak işaretle"""
    try:
        # Konuşmayı kontrol et
        conversation = Conversation.query.get_or_404(conversation_id)
        
        # Kullanıcının bu konuşmaya erişim yetkisi var mı?
        if current_user.id not in [conversation.user1_id, conversation.user2_id]:
            return jsonify({'message': 'Bu konuşmaya erişim yetkiniz yok'}), 403
        
        # Kullanıcının okunmamış mesajlarını bul ve okundu olarak işaretle
        unread_messages = Message.query.filter_by(
            receiver_id=current_user.id,
            is_read=False
        ).filter(
            or_(
                and_(Message.sender_id == conversation.user1_id, Message.receiver_id == conversation.user2_id),
                and_(Message.sender_id == conversation.user2_id, Message.receiver_id == conversation.user1_id)
            )
        ).all()
        
        for message in unread_messages:
            message.mark_as_read()
        
        db.session.commit()
        
        return jsonify({
            'message': f'{len(unread_messages)} mesaj okundu olarak işaretlendi'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Mesajlar işaretlenirken hata oluştu: {str(e)}'}), 500

