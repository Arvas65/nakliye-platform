from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import jwt
from datetime import datetime, timedelta

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Kullanıcı türü: 'cargo_owner' (yük sahibi) veya 'carrier' (nakliyeci)
    user_type = db.Column(db.String(20), nullable=False)
    
    # Profil bilgileri
    full_name = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    company_name = db.Column(db.String(100), nullable=True)
    tax_number = db.Column(db.String(20), nullable=True)
    address = db.Column(db.Text, nullable=True)
    
    # Nakliyeci için özel alanlar
    vehicle_type = db.Column(db.String(50), nullable=True)  # kamyon, kamyonet, vb.
    vehicle_capacity = db.Column(db.Float, nullable=True)  # ton cinsinden
    license_plate = db.Column(db.String(20), nullable=True)
    
    # Sistem alanları
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # İlişkiler
    cargo_posts = db.relationship('CargoPost', backref='owner', lazy=True, foreign_keys='CargoPost.owner_id')
    offers = db.relationship('Offer', backref='carrier', lazy=True, foreign_keys='Offer.carrier_id')

    def __repr__(self):
        return f'<User {self.username} ({self.user_type})>'

    def set_password(self, password):
        """Şifreyi hash'leyerek kaydet"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Şifreyi kontrol et"""
        return check_password_hash(self.password_hash, password)

    def generate_token(self, secret_key, expires_in=3600):
        """JWT token oluştur"""
        payload = {
            'user_id': self.id,
            'username': self.username,
            'user_type': self.user_type,
            'exp': datetime.utcnow() + timedelta(seconds=expires_in)
        }
        return jwt.encode(payload, secret_key, algorithm='HS256')

    @staticmethod
    def verify_token(token, secret_key):
        """JWT token'ı doğrula"""
        try:
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    def to_dict(self, include_sensitive=False):
        """Kullanıcı bilgilerini dict olarak döndür"""
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'user_type': self.user_type,
            'full_name': self.full_name,
            'phone': self.phone,
            'company_name': self.company_name,
            'address': self.address,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        # Nakliyeci ise araç bilgilerini ekle
        if self.user_type == 'carrier':
            data.update({
                'vehicle_type': self.vehicle_type,
                'vehicle_capacity': self.vehicle_capacity,
                'license_plate': self.license_plate
            })
        
        # Hassas bilgileri dahil et (admin için)
        if include_sensitive:
            data['tax_number'] = self.tax_number
            
        return data
