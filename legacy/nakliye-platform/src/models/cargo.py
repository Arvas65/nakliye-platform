from src.models.user import db
from datetime import datetime

class CargoPost(db.Model):
    """Yük İlanı Modeli"""
    id = db.Column(db.Integer, primary_key=True)
    
    # İlan sahibi
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Yük bilgileri
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    cargo_type = db.Column(db.String(50), nullable=False)  # demir, gıda, mobilya, vb.
    weight = db.Column(db.Float, nullable=False)  # ton cinsinden
    volume = db.Column(db.Float, nullable=True)  # m3 cinsinden
    
    # Lokasyon bilgileri
    pickup_city = db.Column(db.String(50), nullable=False)
    pickup_district = db.Column(db.String(50), nullable=True)
    pickup_address = db.Column(db.Text, nullable=True)
    pickup_lat = db.Column(db.Float, nullable=True)
    pickup_lng = db.Column(db.Float, nullable=True)
    
    delivery_city = db.Column(db.String(50), nullable=False)
    delivery_district = db.Column(db.String(50), nullable=True)
    delivery_address = db.Column(db.Text, nullable=True)
    delivery_lat = db.Column(db.Float, nullable=True)
    delivery_lng = db.Column(db.Float, nullable=True)
    
    # Zaman bilgileri
    pickup_date = db.Column(db.DateTime, nullable=True)
    delivery_date = db.Column(db.DateTime, nullable=True)
    
    # Fiyat bilgileri
    budget_min = db.Column(db.Float, nullable=True)  # minimum bütçe
    budget_max = db.Column(db.Float, nullable=True)  # maksimum bütçe
    currency = db.Column(db.String(3), default='TRY')  # para birimi
    
    # İlan durumu
    status = db.Column(db.String(20), default='active')  # active, completed, cancelled
    is_urgent = db.Column(db.Boolean, default=False)
    
    # Sistem alanları
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # İlişkiler
    offers = db.relationship('Offer', backref='cargo_post', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<CargoPost {self.title} ({self.pickup_city} -> {self.delivery_city})>'

    def to_dict(self, include_offers=False):
        """Yük ilanı bilgilerini dict olarak döndür"""
        data = {
            'id': self.id,
            'owner_id': self.owner_id,
            'title': self.title,
            'description': self.description,
            'cargo_type': self.cargo_type,
            'weight': self.weight,
            'volume': self.volume,
            'pickup_city': self.pickup_city,
            'pickup_district': self.pickup_district,
            'pickup_address': self.pickup_address,
            'pickup_lat': self.pickup_lat,
            'pickup_lng': self.pickup_lng,
            'delivery_city': self.delivery_city,
            'delivery_district': self.delivery_district,
            'delivery_address': self.delivery_address,
            'delivery_lat': self.delivery_lat,
            'delivery_lng': self.delivery_lng,
            'pickup_date': self.pickup_date.isoformat() if self.pickup_date else None,
            'delivery_date': self.delivery_date.isoformat() if self.delivery_date else None,
            'budget_min': self.budget_min,
            'budget_max': self.budget_max,
            'currency': self.currency,
            'status': self.status,
            'is_urgent': self.is_urgent,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_offers:
            data['offers'] = [offer.to_dict() for offer in self.offers]
            
        return data

