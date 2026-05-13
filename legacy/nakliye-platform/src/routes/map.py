from flask import Blueprint, jsonify, request
from src.models.user import User, db
from src.models.cargo import CargoPost
from src.routes.auth import token_required
from src.services.map_service import MapService

map_bp = Blueprint('map', __name__)

@map_bp.route('/map/route-info', methods=['POST'])
def get_route_info():
    """Rota bilgilerini hesapla"""
    try:
        data = request.get_json()
        
        if not data.get('pickup_city') or not data.get('delivery_city'):
            return jsonify({'message': 'Alış ve teslim şehirleri gereklidir'}), 400
        
        pickup_city = data['pickup_city'].strip()
        delivery_city = data['delivery_city'].strip()
        
        route_info = MapService.calculate_route_info(pickup_city, delivery_city)
        
        return jsonify({
            'route_info': route_info
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Rota bilgileri hesaplanırken hata oluştu: {str(e)}'}), 500

@map_bp.route('/map/nearby-cargo', methods=['GET'])
@token_required
def get_nearby_cargo(current_user):
    """Yakındaki yük ilanlarını getir"""
    try:
        # Koordinat parametreleri
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        radius = request.args.get('radius', 50, type=int)  # km cinsinden
        
        if not lat or not lng:
            return jsonify({'message': 'Konum bilgileri (lat, lng) gereklidir'}), 400
        
        if radius > 500:  # Maksimum 500 km
            radius = 500
        
        nearby_posts = MapService.find_nearby_cargo_posts(lat, lng, radius)
        
        return jsonify({
            'nearby_cargo_posts': nearby_posts,
            'search_center': {'lat': lat, 'lng': lng},
            'search_radius_km': radius,
            'total_found': len(nearby_posts)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Yakındaki yük ilanları aranırken hata oluştu: {str(e)}'}), 500

@map_bp.route('/map/distance', methods=['POST'])
def calculate_distance():
    """İki nokta arasındaki mesafeyi hesapla"""
    try:
        data = request.get_json()
        
        required_fields = ['lat1', 'lng1', 'lat2', 'lng2']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'{field} alanı gereklidir'}), 400
        
        try:
            lat1 = float(data['lat1'])
            lng1 = float(data['lng1'])
            lat2 = float(data['lat2'])
            lng2 = float(data['lng2'])
        except ValueError:
            return jsonify({'message': 'Geçersiz koordinat formatı'}), 400
        
        distance = MapService.calculate_distance(lat1, lng1, lat2, lng2)
        
        return jsonify({
            'distance_km': distance,
            'point1': {'lat': lat1, 'lng': lng1},
            'point2': {'lat': lat2, 'lng': lng2}
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Mesafe hesaplanırken hata oluştu: {str(e)}'}), 500

@map_bp.route('/map/city-coordinates/<city_name>', methods=['GET'])
def get_city_coordinates(city_name):
    """Şehir koordinatlarını getir"""
    try:
        coordinates = MapService.get_city_coordinates(city_name)
        
        if not coordinates:
            return jsonify({
                'message': 'Şehir bulunamadı',
                'city': city_name,
                'coordinates': None
            }), 404
        
        return jsonify({
            'city': city_name,
            'coordinates': {
                'lat': coordinates[0],
                'lng': coordinates[1]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Şehir koordinatları alınırken hata oluştu: {str(e)}'}), 500

@map_bp.route('/map/cargo-posts-with-coordinates', methods=['GET'])
def get_cargo_posts_with_coordinates():
    """Koordinatları olan yük ilanlarını harita için getir"""
    try:
        # Sayfalama parametreleri
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 100, type=int)
        
        # Filtreleme parametreleri
        cargo_type = request.args.get('cargo_type')
        min_weight = request.args.get('min_weight', type=float)
        max_weight = request.args.get('max_weight', type=float)
        
        # Sadece koordinatları olan aktif ilanları getir
        query = CargoPost.query.filter(
            CargoPost.status == 'active',
            CargoPost.pickup_lat.isnot(None),
            CargoPost.pickup_lng.isnot(None)
        )
        
        if cargo_type:
            query = query.filter(CargoPost.cargo_type.ilike(f'%{cargo_type}%'))
        
        if min_weight:
            query = query.filter(CargoPost.weight >= min_weight)
        
        if max_weight:
            query = query.filter(CargoPost.weight <= max_weight)
        
        # Tarihe göre sırala
        query = query.order_by(CargoPost.created_at.desc())
        
        # Sayfalama uygula
        cargo_posts = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        # Harita için optimize edilmiş format
        map_data = []
        for post in cargo_posts.items:
            map_data.append({
                'id': post.id,
                'title': post.title,
                'cargo_type': post.cargo_type,
                'weight': post.weight,
                'pickup_coordinates': {
                    'lat': post.pickup_lat,
                    'lng': post.pickup_lng
                },
                'pickup_city': post.pickup_city,
                'delivery_city': post.delivery_city,
                'delivery_coordinates': {
                    'lat': post.delivery_lat,
                    'lng': post.delivery_lng
                } if post.delivery_lat and post.delivery_lng else None,
                'budget_min': post.budget_min,
                'budget_max': post.budget_max,
                'currency': post.currency,
                'is_urgent': post.is_urgent,
                'created_at': post.created_at.isoformat() if post.created_at else None
            })
        
        return jsonify({
            'cargo_posts': map_data,
            'total': cargo_posts.total,
            'pages': cargo_posts.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Harita verileri alınırken hata oluştu: {str(e)}'}), 500

