from src.models.user import db
from datetime import datetime

class Offer(db.Model):
    """Teklif Modeli"""
    id = db.Column(db.Integer, primary_key=True)
    
    # İlişkiler
    cargo_post_id = db.Column(db.Integer, db.ForeignKey('cargo_post.id'), nullable=False)
    carrier_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Teklif bilgileri
    price = db.Column(db.Float, nullable=False)  # teklif edilen fiyat
    currency = db.Column(db.String(3), default='TRY')  # para birimi
    message = db.Column(db.Text, nullable=True)  # nakliyecinin mesajı
    
    # Zaman bilgileri
    pickup_date = db.Column(db.DateTime, nullable=True)  # teklif edilen alış tarihi
    delivery_date = db.Column(db.DateTime, nullable=True)  # teklif edilen teslim tarihi
    
    # Teklif durumu
    status = db.Column(db.String(20), default='pending')  # pending, accepted, rejected, withdrawn
    
    # Sistem alanları
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Kabul edilme tarihi (eğer kabul edildiyse)
    accepted_at = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f'<Offer {self.price} {self.currency} for CargoPost {self.cargo_post_id}>'

    def to_dict(self, include_carrier=False, include_cargo=False):
        """Teklif bilgilerini dict olarak döndür"""
        data = {
            'id': self.id,
            'cargo_post_id': self.cargo_post_id,
            'carrier_id': self.carrier_id,
            'price': self.price,
            'currency': self.currency,
            'message': self.message,
            'pickup_date': self.pickup_date.isoformat() if self.pickup_date else None,
            'delivery_date': self.delivery_date.isoformat() if self.delivery_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'accepted_at': self.accepted_at.isoformat() if self.accepted_at else None
        }
        
        if include_carrier and self.carrier:
            data['carrier'] = self.carrier.to_dict()
            
        if include_cargo and self.cargo_post:
            data['cargo_post'] = self.cargo_post.to_dict()
            
        return data

