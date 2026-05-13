from flask import Blueprint, jsonify, request
from src.models.user import User, db
from src.routes.auth import token_required
from src.services.notification_service import NotificationService, Notification

notification_bp = Blueprint('notification', __name__)

@notification_bp.route('/notifications', methods=['GET'])
@token_required
def get_notifications(current_user):
    """Kullanıcının bildirimlerini listele"""
    try:
        # Sayfalama parametreleri
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        
        # Bildirimleri getir
        notifications = NotificationService.get_user_notifications(
            user_id=current_user.id,
            page=page,
            per_page=per_page,
            unread_only=unread_only
        )
        
        return jsonify({
            'notifications': [notification.to_dict() for notification in notifications.items],
            'total': notifications.total,
            'pages': notifications.pages,
            'current_page': page,
            'per_page': per_page,
            'unread_only': unread_only
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Bildirimler listelenirken hata oluştu: {str(e)}'}), 500

@notification_bp.route('/notifications/unread-count', methods=['GET'])
@token_required
def get_unread_count(current_user):
    """Okunmamış bildirim sayısını getir"""
    try:
        unread_count = NotificationService.get_unread_count(current_user.id)
        
        return jsonify({
            'unread_count': unread_count
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Okunmamış bildirim sayısı alınırken hata oluştu: {str(e)}'}), 500

@notification_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
@token_required
def mark_notification_read(current_user, notification_id):
    """Bildirimi okundu olarak işaretle"""
    try:
        notification = Notification.query.get_or_404(notification_id)
        
        # Sadece bildirim sahibi işaretleyebilir
        if notification.user_id != current_user.id:
            return jsonify({'message': 'Bu bildirimi işaretleme yetkiniz yok'}), 403
        
        notification.mark_as_read()
        db.session.commit()
        
        return jsonify({
            'message': 'Bildirim okundu olarak işaretlendi',
            'notification': notification.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Bildirim işaretlenirken hata oluştu: {str(e)}'}), 500

@notification_bp.route('/notifications/mark-all-read', methods=['POST'])
@token_required
def mark_all_notifications_read(current_user):
    """Tüm bildirimleri okundu olarak işaretle"""
    try:
        marked_count = NotificationService.mark_all_as_read(current_user.id)
        
        return jsonify({
            'message': f'{marked_count} bildirim okundu olarak işaretlendi',
            'marked_count': marked_count
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Bildirimler işaretlenirken hata oluştu: {str(e)}'}), 500

@notification_bp.route('/notifications/<int:notification_id>', methods=['DELETE'])
@token_required
def delete_notification(current_user, notification_id):
    """Bildirimi sil"""
    try:
        notification = Notification.query.get_or_404(notification_id)
        
        # Sadece bildirim sahibi silebilir
        if notification.user_id != current_user.id:
            return jsonify({'message': 'Bu bildirimi silme yetkiniz yok'}), 403
        
        db.session.delete(notification)
        db.session.commit()
        
        return jsonify({'message': 'Bildirim başarıyla silindi'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Bildirim silinirken hata oluştu: {str(e)}'}), 500

@notification_bp.route('/notifications/test', methods=['POST'])
@token_required
def create_test_notification(current_user):
    """Test bildirimi oluştur (geliştirme amaçlı)"""
    try:
        data = request.get_json()
        
        title = data.get('title', 'Test Bildirimi')
        message = data.get('message', 'Bu bir test bildirimidir.')
        notification_type = data.get('notification_type', 'system')
        
        notification = NotificationService.create_notification(
            user_id=current_user.id,
            title=title,
            message=message,
            notification_type=notification_type
        )
        
        return jsonify({
            'message': 'Test bildirimi oluşturuldu',
            'notification': notification.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'message': f'Test bildirimi oluşturulurken hata oluştu: {str(e)}'}), 500

@notification_bp.route('/notifications/settings', methods=['GET'])
@token_required
def get_notification_settings(current_user):
    """Bildirim ayarlarını getir"""
    try:
        # Basit bildirim ayarları (gelecekte genişletilebilir)
        settings = {
            'email_notifications': True,
            'push_notifications': True,
            'sms_notifications': False,
            'notification_types': {
                'new_offer': True,
                'offer_accepted': True,
                'offer_rejected': True,
                'new_message': True,
                'cargo_interest': True,
                'system_updates': True
            }
        }
        
        return jsonify({
            'notification_settings': settings
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Bildirim ayarları alınırken hata oluştu: {str(e)}'}), 500

@notification_bp.route('/notifications/settings', methods=['PUT'])
@token_required
def update_notification_settings(current_user):
    """Bildirim ayarlarını güncelle"""
    try:
        data = request.get_json()
        
        # Şu an için sadece başarı mesajı döndür
        # Gelecekte kullanıcı ayarları tablosu eklenebilir
        
        return jsonify({
            'message': 'Bildirim ayarları güncellendi',
            'updated_settings': data
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Bildirim ayarları güncellenirken hata oluştu: {str(e)}'}), 500

