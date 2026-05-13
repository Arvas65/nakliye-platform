from src.models.user import db
from datetime import datetime
from typing import List, Optional

class Notification(db.Model):
    """Bildirim Modeli"""
    id = db.Column(db.Integer, primary_key=True)
    
    # Bildirim alıcısı
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Bildirim içeriği
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), nullable=False)  # offer, message, system, etc.
    
    # İlgili kayıtlar
    related_cargo_post_id = db.Column(db.Integer, db.ForeignKey('cargo_post.id'), nullable=True)
    related_offer_id = db.Column(db.Integer, db.ForeignKey('offer.id'), nullable=True)
    related_message_id = db.Column(db.Integer, db.ForeignKey('message.id'), nullable=True)
    
    # Bildirim durumu
    is_read = db.Column(db.Boolean, default=False)
    is_sent = db.Column(db.Boolean, default=False)
    
    # Sistem alanları
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime, nullable=True)
    
    # İlişkiler
    user = db.relationship('User', backref='notifications')
    cargo_post = db.relationship('CargoPost')
    offer = db.relationship('Offer')
    message = db.relationship('Message')

    def __repr__(self):
        return f'<Notification {self.title} for user {self.user_id}>'

    def mark_as_read(self):
        """Bildirimi okundu olarak işaretle"""
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.utcnow()

    def to_dict(self):
        """Bildirim bilgilerini dict olarak döndür"""
        return {
            'id': self.id,
            'title': self.title,
            'message': self.message,
            'notification_type': self.notification_type,
            'related_cargo_post_id': self.related_cargo_post_id,
            'related_offer_id': self.related_offer_id,
            'related_message_id': self.related_message_id,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None
        }


class NotificationService:
    """Bildirim Servisi"""
    
    @staticmethod
    def create_notification(
        user_id: int,
        title: str,
        message: str,
        notification_type: str,
        related_cargo_post_id: Optional[int] = None,
        related_offer_id: Optional[int] = None,
        related_message_id: Optional[int] = None
    ) -> Notification:
        """Yeni bildirim oluştur"""
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            related_cargo_post_id=related_cargo_post_id,
            related_offer_id=related_offer_id,
            related_message_id=related_message_id
        )
        
        db.session.add(notification)
        db.session.commit()
        
        return notification
    
    @staticmethod
    def notify_new_offer(offer):
        """Yeni teklif bildirimi"""
        cargo_post = offer.cargo_post
        title = "Yeni Teklif Aldınız!"
        message = f"{offer.carrier.full_name or offer.carrier.username} '{cargo_post.title}' ilanınıza {offer.price} {offer.currency} teklif verdi."
        
        return NotificationService.create_notification(
            user_id=cargo_post.owner_id,
            title=title,
            message=message,
            notification_type='offer',
            related_cargo_post_id=cargo_post.id,
            related_offer_id=offer.id
        )
    
    @staticmethod
    def notify_offer_accepted(offer):
        """Teklif kabul bildirimi"""
        cargo_post = offer.cargo_post
        title = "Teklifiniz Kabul Edildi!"
        message = f"'{cargo_post.title}' ilanı için verdiğiniz {offer.price} {offer.currency} teklif kabul edildi."
        
        return NotificationService.create_notification(
            user_id=offer.carrier_id,
            title=title,
            message=message,
            notification_type='offer',
            related_cargo_post_id=cargo_post.id,
            related_offer_id=offer.id
        )
    
    @staticmethod
    def notify_offer_rejected(offer):
        """Teklif red bildirimi"""
        cargo_post = offer.cargo_post
        title = "Teklifiniz Reddedildi"
        message = f"'{cargo_post.title}' ilanı için verdiğiniz teklif reddedildi."
        
        return NotificationService.create_notification(
            user_id=offer.carrier_id,
            title=title,
            message=message,
            notification_type='offer',
            related_cargo_post_id=cargo_post.id,
            related_offer_id=offer.id
        )
    
    @staticmethod
    def notify_new_message(message):
        """Yeni mesaj bildirimi"""
        title = "Yeni Mesajınız Var!"
        msg_text = f"{message.sender.full_name or message.sender.username} size mesaj gönderdi."
        
        return NotificationService.create_notification(
            user_id=message.receiver_id,
            title=title,
            message=msg_text,
            notification_type='message',
            related_message_id=message.id
        )
    
    @staticmethod
    def notify_cargo_post_interest(cargo_post, interested_user):
        """Yük ilanına ilgi bildirimi"""
        title = "İlanınıza İlgi Var!"
        message = f"{interested_user.full_name or interested_user.username} '{cargo_post.title}' ilanınızla ilgileniyor."
        
        return NotificationService.create_notification(
            user_id=cargo_post.owner_id,
            title=title,
            message=message,
            notification_type='interest',
            related_cargo_post_id=cargo_post.id
        )
    
    @staticmethod
    def get_user_notifications(user_id: int, page: int = 1, per_page: int = 20, unread_only: bool = False):
        """Kullanıcının bildirimlerini getir"""
        query = Notification.query.filter_by(user_id=user_id)
        
        if unread_only:
            query = query.filter_by(is_read=False)
        
        query = query.order_by(Notification.created_at.desc())
        
        return query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
    
    @staticmethod
    def mark_all_as_read(user_id: int):
        """Kullanıcının tüm bildirimlerini okundu olarak işaretle"""
        notifications = Notification.query.filter_by(
            user_id=user_id,
            is_read=False
        ).all()
        
        for notification in notifications:
            notification.mark_as_read()
        
        db.session.commit()
        return len(notifications)
    
    @staticmethod
    def get_unread_count(user_id: int) -> int:
        """Kullanıcının okunmamış bildirim sayısını getir"""
        return Notification.query.filter_by(
            user_id=user_id,
            is_read=False
        ).count()
    
    @staticmethod
    def delete_old_notifications(days: int = 30):
        """Eski bildirimleri sil"""
        from datetime import timedelta
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        old_notifications = Notification.query.filter(
            Notification.created_at < cutoff_date,
            Notification.is_read == True
        ).all()
        
        for notification in old_notifications:
            db.session.delete(notification)
        
        db.session.commit()
        return len(old_notifications)

