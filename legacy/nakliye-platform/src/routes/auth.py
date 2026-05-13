from flask import Blueprint, jsonify, request, current_app
from functools import wraps
from src.models.user import User, db
import re

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    """JWT token doğrulama decorator'ı"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Header'dan token'ı al
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # "Bearer TOKEN" formatından token'ı al
            except IndexError:
                return jsonify({'message': 'Token formatı hatalı'}), 401
        
        if not token:
            return jsonify({'message': 'Token eksik'}), 401
        
        try:
            # Token'ı doğrula
            payload = User.verify_token(token, current_app.config['SECRET_KEY'])
            if payload is None:
                return jsonify({'message': 'Token geçersiz veya süresi dolmuş'}), 401
            
            # Kullanıcıyı bul
            current_user = User.query.get(payload['user_id'])
            if not current_user or not current_user.is_active:
                return jsonify({'message': 'Kullanıcı bulunamadı veya aktif değil'}), 401
                
        except Exception as e:
            return jsonify({'message': 'Token doğrulama hatası'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def validate_email(email):
    """Email formatını kontrol et"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Şifre güvenlik kontrolü"""
    if len(password) < 6:
        return False, "Şifre en az 6 karakter olmalıdır"
    return True, "Geçerli"

@auth_bp.route('/register', methods=['POST'])
def register():
    """Kullanıcı kayıt"""
    try:
        data = request.get_json()
        
        # Gerekli alanları kontrol et
        required_fields = ['username', 'email', 'password', 'user_type']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'message': f'{field} alanı gereklidir'}), 400
        
        username = data['username'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        user_type = data['user_type']
        
        # Kullanıcı türü kontrolü
        if user_type not in ['cargo_owner', 'carrier']:
            return jsonify({'message': 'Geçersiz kullanıcı türü'}), 400
        
        # Email formatı kontrolü
        if not validate_email(email):
            return jsonify({'message': 'Geçersiz email formatı'}), 400
        
        # Şifre kontrolü
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({'message': message}), 400
        
        # Kullanıcı adı ve email benzersizlik kontrolü
        if User.query.filter_by(username=username).first():
            return jsonify({'message': 'Bu kullanıcı adı zaten kullanılıyor'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'message': 'Bu email adresi zaten kayıtlı'}), 400
        
        # Yeni kullanıcı oluştur
        user = User(
            username=username,
            email=email,
            user_type=user_type,
            full_name=data.get('full_name', '').strip(),
            phone=data.get('phone', '').strip(),
            company_name=data.get('company_name', '').strip(),
            address=data.get('address', '').strip()
        )
        
        # Nakliyeci ise araç bilgilerini ekle
        if user_type == 'carrier':
            user.vehicle_type = data.get('vehicle_type', '').strip()
            user.vehicle_capacity = data.get('vehicle_capacity')
            user.license_plate = data.get('license_plate', '').strip()
        
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Token oluştur
        token = user.generate_token(current_app.config['SECRET_KEY'])
        
        return jsonify({
            'message': 'Kayıt başarılı',
            'user': user.to_dict(),
            'token': token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Kayıt sırasında hata oluştu: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Kullanıcı giriş"""
    try:
        data = request.get_json()
        
        if not data.get('username') or not data.get('password'):
            return jsonify({'message': 'Kullanıcı adı ve şifre gereklidir'}), 400
        
        username = data['username'].strip()
        password = data['password']
        
        # Kullanıcıyı bul (username veya email ile)
        user = User.query.filter(
            (User.username == username) | (User.email == username)
        ).first()
        
        if not user or not user.check_password(password):
            return jsonify({'message': 'Kullanıcı adı veya şifre hatalı'}), 401
        
        if not user.is_active:
            return jsonify({'message': 'Hesabınız aktif değil'}), 401
        
        # Token oluştur
        token = user.generate_token(current_app.config['SECRET_KEY'])
        
        return jsonify({
            'message': 'Giriş başarılı',
            'user': user.to_dict(),
            'token': token
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Giriş sırasında hata oluştu: {str(e)}'}), 500

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Mevcut kullanıcı bilgilerini getir"""
    return jsonify({
        'user': current_user.to_dict()
    }), 200

@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    """Şifre değiştir"""
    try:
        data = request.get_json()
        
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'message': 'Mevcut şifre ve yeni şifre gereklidir'}), 400
        
        current_password = data['current_password']
        new_password = data['new_password']
        
        # Mevcut şifreyi kontrol et
        if not current_user.check_password(current_password):
            return jsonify({'message': 'Mevcut şifre hatalı'}), 400
        
        # Yeni şifre kontrolü
        is_valid, message = validate_password(new_password)
        if not is_valid:
            return jsonify({'message': message}), 400
        
        # Şifreyi güncelle
        current_user.set_password(new_password)
        db.session.commit()
        
        return jsonify({'message': 'Şifre başarıyla değiştirildi'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Şifre değiştirme sırasında hata oluştu: {str(e)}'}), 500

@auth_bp.route('/update-profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Profil bilgilerini güncelle"""
    try:
        data = request.get_json()
        
        # Güncellenebilir alanlar
        updatable_fields = ['full_name', 'phone', 'company_name', 'address']
        
        for field in updatable_fields:
            if field in data:
                setattr(current_user, field, data[field].strip() if data[field] else None)
        
        # Nakliyeci ise araç bilgilerini güncelle
        if current_user.user_type == 'carrier':
            carrier_fields = ['vehicle_type', 'vehicle_capacity', 'license_plate']
            for field in carrier_fields:
                if field in data:
                    if field == 'vehicle_capacity':
                        setattr(current_user, field, data[field])
                    else:
                        setattr(current_user, field, data[field].strip() if data[field] else None)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profil başarıyla güncellendi',
            'user': current_user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Profil güncelleme sırasında hata oluştu: {str(e)}'}), 500

