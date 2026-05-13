import requests
import math
from typing import Tuple, Optional

class MapService:
    """Harita ve konum servisleri"""
    
    @staticmethod
    def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """İki nokta arasındaki mesafeyi hesapla (km cinsinden)"""
        # Haversine formülü
        R = 6371  # Dünya'nın yarıçapı (km)
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lng = math.radians(lng2 - lng1)
        
        a = (math.sin(delta_lat / 2) ** 2 + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * 
             math.sin(delta_lng / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        distance = R * c
        return round(distance, 2)
    
    @staticmethod
    def get_city_coordinates(city_name: str) -> Optional[Tuple[float, float]]:
        """Şehir adından koordinat bilgisi al (basit sözlük tabanlı)"""
        # Türkiye'nin başlıca şehirlerinin koordinatları
        city_coordinates = {
            'istanbul': (41.0082, 28.9784),
            'ankara': (39.9334, 32.8597),
            'izmir': (38.4192, 27.1287),
            'bursa': (40.1826, 29.0665),
            'antalya': (36.8969, 30.7133),
            'adana': (37.0000, 35.3213),
            'konya': (37.8667, 32.4833),
            'gaziantep': (37.0662, 37.3833),
            'kayseri': (38.7312, 35.4787),
            'mersin': (36.8000, 34.6333),
            'eskişehir': (39.7767, 30.5206),
            'diyarbakır': (37.9144, 40.2306),
            'samsun': (41.2867, 36.3300),
            'denizli': (37.7765, 29.0864),
            'şanlıurfa': (37.1591, 38.7969),
            'adapazarı': (40.7839, 30.4034),
            'malatya': (38.3552, 38.3095),
            'kahramanmaraş': (37.5858, 36.9371),
            'erzurum': (39.9334, 41.2769),
            'van': (38.4891, 43.4089),
            'batman': (37.8812, 41.1351),
            'elazığ': (38.6810, 39.2264),
            'iğdır': (39.8880, 44.0048),
            'tekirdağ': (40.9833, 27.5167),
            'balıkesir': (39.6484, 27.8826),
            'çorum': (40.5506, 34.9556),
            'ordu': (40.9839, 37.8764),
            'afyon': (38.7507, 30.5567),
            'kütahya': (39.4242, 29.9833),
            'uşak': (38.6823, 29.4082)
        }
        
        city_lower = city_name.lower().strip()
        return city_coordinates.get(city_lower)
    
    @staticmethod
    def calculate_route_info(pickup_city: str, delivery_city: str) -> dict:
        """Rota bilgilerini hesapla"""
        pickup_coords = MapService.get_city_coordinates(pickup_city)
        delivery_coords = MapService.get_city_coordinates(delivery_city)
        
        if not pickup_coords or not delivery_coords:
            return {
                'distance_km': None,
                'estimated_duration_hours': None,
                'pickup_coordinates': pickup_coords,
                'delivery_coordinates': delivery_coords,
                'error': 'Şehir koordinatları bulunamadı'
            }
        
        distance = MapService.calculate_distance(
            pickup_coords[0], pickup_coords[1],
            delivery_coords[0], delivery_coords[1]
        )
        
        # Tahmini süre hesaplama (ortalama 80 km/h)
        estimated_hours = round(distance / 80, 1)
        
        return {
            'distance_km': distance,
            'estimated_duration_hours': estimated_hours,
            'pickup_coordinates': pickup_coords,
            'delivery_coordinates': delivery_coords,
            'error': None
        }
    
    @staticmethod
    def find_nearby_cargo_posts(user_lat: float, user_lng: float, radius_km: int = 50) -> list:
        """Kullanıcının yakınındaki yük ilanlarını bul"""
        from src.models.cargo import CargoPost
        
        # Tüm aktif yük ilanlarını al
        cargo_posts = CargoPost.query.filter_by(status='active').all()
        nearby_posts = []
        
        for post in cargo_posts:
            if post.pickup_lat and post.pickup_lng:
                distance = MapService.calculate_distance(
                    user_lat, user_lng,
                    post.pickup_lat, post.pickup_lng
                )
                
                if distance <= radius_km:
                    post_dict = post.to_dict()
                    post_dict['distance_km'] = distance
                    nearby_posts.append(post_dict)
        
        # Mesafeye göre sırala
        nearby_posts.sort(key=lambda x: x['distance_km'])
        return nearby_posts

