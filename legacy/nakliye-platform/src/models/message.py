from src.models.user import db
from datetime import datetime

class Message(db.Model):
    """Mesaj Modeli"""
    id = db.Column(db.Integer, primary_key=True)
    
    # Mesaj gönderen ve alan
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Hangi yük ilanı ile ilgili (opsiyonel)
    cargo_post_id = db.Column(db.Integer, db.ForeignKey('cargo_post.id'), nullable=True)
    
    # Hangi teklif ile ilgili (opsiyonel)
    offer_id = db.Column(db.Integer, db.ForeignKey('offer.id'), nullable=True)
    
    # Mesaj içeriği
    content = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(20), default='text')  # text, image, file
    
    # Mesaj durumu
    is_read = db.Column(db.Boolean, default=False)
    is_deleted_by_sender = db.Column(db.Boolean, default=False)
    is_deleted_by_receiver = db.Column(db.Boolean, default=False)
    
    # Sistem alanları
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime, nullable=True)
    
    # İlişkiler
    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='received_messages')
    cargo_post = db.relationship('CargoPost', backref='messages')
    offer = db.relationship('Offer', backref='messages')

    def __repr__(self):
        return f'<Message from {self.sender_id} to {self.receiver_id}>'

    def mark_as_read(self):
        """Mesajı okundu olarak işaretle"""
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.utcnow()

    def to_dict(self, include_sender=False, include_receiver=False):
        """Mesaj bilgilerini dict olarak döndür"""
        data = {
            'id': self.id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'cargo_post_id': self.cargo_post_id,
            'offer_id': self.offer_id,
            'content': self.content,
            'message_type': self.message_type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None
        }
        
        if include_sender and self.sender:
            data['sender'] = {
                'id': self.sender.id,
                'username': self.sender.username,
                'full_name': self.sender.full_name,
                'user_type': self.sender.user_type
            }
            
        if include_receiver and self.receiver:
            data['receiver'] = {
                'id': self.receiver.id,
                'username': self.receiver.username,
                'full_name': self.receiver.full_name,
                'user_type': self.receiver.user_type
            }
            
        return data


class Conversation(db.Model):
    """Konuşma Modeli - İki kullanıcı arasındaki mesajlaşma oturumu"""
    id = db.Column(db.Integer, primary_key=True)
    
    # Konuşmaya katılan kullanıcılar
    user1_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Hangi yük ilanı ile ilgili (opsiyonel)
    cargo_post_id = db.Column(db.Integer, db.ForeignKey('cargo_post.id'), nullable=True)
    
    # Hangi teklif ile ilgili (opsiyonel)
    offer_id = db.Column(db.Integer, db.ForeignKey('offer.id'), nullable=True)
    
    # Son mesaj bilgileri
    last_message_id = db.Column(db.Integer, db.ForeignKey('message.id'), nullable=True)
    last_message_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Konuşma durumu
    is_active = db.Column(db.Boolean, default=True)
    
    # Sistem alanları
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # İlişkiler
    user1 = db.relationship('User', foreign_keys=[user1_id])
    user2 = db.relationship('User', foreign_keys=[user2_id])
    cargo_post = db.relationship('CargoPost')
    offer = db.relationship('Offer')
    last_message = db.relationship('Message', foreign_keys=[last_message_id])
    
    # Benzersizlik kısıtı - aynı kullanıcılar arasında aynı ilan/teklif için sadece bir konuşma
    __table_args__ = (
        db.UniqueConstraint('user1_id', 'user2_id', 'cargo_post_id', 'offer_id'),
    )

    def __repr__(self):
        return f'<Conversation between {self.user1_id} and {self.user2_id}>'

    def get_other_user(self, current_user_id):
        """Mevcut kullanıcının karşısındaki kullanıcıyı döndür"""
        if self.user1_id == current_user_id:
            return self.user2
        elif self.user2_id == current_user_id:
            return self.user1
        else:
            return None

    def get_unread_count(self, user_id):
        """Kullanıcının bu konuşmadaki okunmamış mesaj sayısını döndür"""
        return Message.query.filter_by(
            receiver_id=user_id,
            is_read=False,
            is_deleted_by_receiver=False
        ).filter(
            (Message.sender_id == self.user1_id) | (Message.sender_id == self.user2_id)
        ).count()

    def to_dict(self, current_user_id, include_last_message=True):
        """Konuşma bilgilerini dict olarak döndür"""
        other_user = self.get_other_user(current_user_id)
        
        data = {
            'id': self.id,
            'cargo_post_id': self.cargo_post_id,
            'offer_id': self.offer_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_message_at': self.last_message_at.isoformat() if self.last_message_at else None,
            'unread_count': self.get_unread_count(current_user_id)
        }
        
        if other_user:
            data['other_user'] = {
                'id': other_user.id,
                'username': other_user.username,
                'full_name': other_user.full_name,
                'user_type': other_user.user_type
            }
        
        if include_last_message and self.last_message:
            data['last_message'] = self.last_message.to_dict()
            
        return data

