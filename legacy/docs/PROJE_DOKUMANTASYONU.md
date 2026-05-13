# Nakliye Platform - Proje Dokümantasyonu

## 🚛 Proje Özeti

Nakliye Platform, yük sahipleri ile nakliyecileri buluşturan modern bir web platformudur. Bu platform, Uber benzeri bir model kullanarak nakliye sektöründe aracılık hizmeti sunar.

## 🎯 Proje Hedefleri

- Yük sahiplerinin kolayca ilan verebilmesi
- Nakliyecilerin uygun işleri bulabilmesi
- Güvenli ve şeffaf bir eşleşme sistemi
- Anlık mesajlaşma ve takip imkanı
- Harita entegrasyonu ile konum takibi

## 🏗️ Teknik Mimari

### Backend (API)
- **Framework**: Flask (Python)
- **Veritabanı**: SQLite (geliştirme), PostgreSQL (production)
- **Authentication**: JWT Token tabanlı
- **API Endpoint'leri**: RESTful API
- **Deploy URL**: https://77h9ikcwn97y.manus.space

### Frontend (Web Arayüzü)
- **Framework**: React + Vite
- **UI Kütüphanesi**: Tailwind CSS + shadcn/ui
- **State Management**: React Context API
- **Routing**: React Router
- **Build Tool**: Vite

### Özellikler
- Responsive tasarım (mobil uyumlu)
- Modern ve kullanıcı dostu arayüz
- Real-time mesajlaşma hazırlığı
- Harita entegrasyonu altyapısı
- Bildirim sistemi altyapısı

## 📊 Veritabanı Modelleri

### User (Kullanıcı)
- Kullanıcı bilgileri (ad, email, telefon)
- Hesap türü (yük sahibi / nakliyeci)
- Şirket bilgileri
- Araç bilgileri (nakliyeciler için)

### Cargo (Yük İlanı)
- İlan başlığı ve açıklaması
- Alış/teslim lokasyonları
- Yük türü ve ağırlığı
- Bütçe bilgileri
- Tarih bilgileri

### Offer (Teklif)
- Nakliyeci teklifleri
- Teklif miktarı
- Durum bilgisi (beklemede/kabul/red)

### Message (Mesaj)
- Kullanıcılar arası mesajlaşma
- Zaman damgası
- Mesaj içeriği

## 🔧 API Endpoint'leri

### Authentication
- `POST /api/auth/register` - Kullanıcı kayıt
- `POST /api/auth/login` - Kullanıcı giriş
- `POST /api/auth/logout` - Kullanıcı çıkış

### Kullanıcı Yönetimi
- `GET /api/users/profile` - Profil bilgileri
- `PUT /api/users/profile` - Profil güncelleme

### Yük İlanları
- `GET /api/cargo-posts` - İlan listesi
- `POST /api/cargo-posts` - Yeni ilan oluştur
- `GET /api/cargo-posts/{id}` - İlan detayı
- `PUT /api/cargo-posts/{id}` - İlan güncelle
- `DELETE /api/cargo-posts/{id}` - İlan sil

### Teklifler
- `GET /api/offers` - Teklif listesi
- `POST /api/offers` - Yeni teklif ver
- `PUT /api/offers/{id}` - Teklif güncelle
- `DELETE /api/offers/{id}` - Teklif sil

### Mesajlaşma
- `GET /api/messages` - Mesaj listesi
- `POST /api/messages` - Mesaj gönder
- `GET /api/messages/{user_id}` - Kullanıcı ile mesajlar

### Harita ve Bildirimler
- `GET /api/map/route` - Rota hesaplama
- `GET /api/notifications` - Bildirim listesi
- `POST /api/notifications` - Bildirim gönder

## 🚀 Kurulum ve Çalıştırma

### Backend Kurulumu
```bash
cd nakliye-platform
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python create_db.py  # Veritabanı oluştur
python src/main.py   # Sunucuyu başlat
```

### Frontend Kurulumu
```bash
cd nakliye-frontend
npm install
npm run dev  # Geliştirme sunucusu
npm run build  # Production build
```

## 🌐 Deployment

### Backend Deployment
- Production URL: https://77h9ikcwn97y.manus.space
- Otomatik deployment yapılandırılmış
- Environment variables ayarlanmış

### Frontend Deployment
- Static site olarak deploy edilebilir
- Build dosyaları `/dist` klasöründe
- CDN üzerinden servis edilebilir

## 🔐 Güvenlik

### Authentication
- JWT token tabanlı kimlik doğrulama
- Şifre hash'leme (bcrypt)
- Token süresi sınırlaması

### API Güvenliği
- CORS yapılandırması
- Input validation
- SQL injection koruması

## 📱 Kullanıcı Akışları

### Yük Sahibi Akışı
1. Kayıt ol / Giriş yap
2. Yük ilanı oluştur
3. Gelen teklifleri incele
4. Uygun teklifi kabul et
5. Nakliyeci ile mesajlaş
6. Taşıma sürecini takip et

### Nakliyeci Akışı
1. Kayıt ol / Giriş yap
2. Yük ilanlarını incele
3. Uygun ilanlara teklif ver
4. Kabul edilen teklifler için iletişim kur
5. Taşıma işlemini gerçekleştir

## 🎨 Kullanıcı Arayüzü

### Ana Sayfa
- Platform tanıtımı
- İstatistikler
- Özellik açıklamaları
- Kullanıcı yorumları

### Dashboard
- Kullanıcı özeti
- Hızlı erişim linkleri
- Son aktiviteler
- Bildirimler

### İlan Sayfaları
- İlan listesi (filtreleme)
- İlan detayı
- İlan oluşturma formu

### Mesajlaşma
- Mesaj listesi
- Chat arayüzü
- Real-time mesajlaşma hazırlığı

## 🔮 Gelecek Geliştirmeler

### Kısa Vadeli
- Real-time mesajlaşma (WebSocket)
- Push notification sistemi
- Mobil uygulama (React Native)
- Ödeme entegrasyonu

### Orta Vadeli
- GPS takip sistemi
- Otomatik rota optimizasyonu
- Değerlendirme sistemi
- Çoklu dil desteği

### Uzun Vadeli
- AI destekli eşleşme
- Blockchain entegrasyonu
- IoT sensör desteği
- Uluslararası nakliye

## 📞 Destek ve İletişim

### Teknik Destek
- API dokümantasyonu mevcut
- Kod yorumları eklenmiş
- Test senaryoları hazırlanmış

### Bakım ve Güncelleme
- Modüler yapı sayesinde kolay güncelleme
- Veritabanı migration sistemi
- Otomatik backup sistemi önerisi

## 📈 Performans ve Ölçeklenebilirlik

### Mevcut Durum
- SQLite veritabanı (geliştirme)
- Tek sunucu deployment
- Temel caching

### Önerilen İyileştirmeler
- PostgreSQL/MySQL geçişi
- Redis cache sistemi
- Load balancer kullanımı
- CDN entegrasyonu

## 🎉 Proje Teslimi

Proje başarıyla tamamlanmış ve aşağıdaki deliverable'lar hazırlanmıştır:

1. **Çalışan Backend API** - https://77h9ikcwn97y.manus.space
2. **Modern Web Arayüzü** - React tabanlı responsive tasarım
3. **Kaynak Kodları** - Tam dokümantasyonlu kod tabanı
4. **Veritabanı Şeması** - Tüm modeller ve ilişkiler
5. **API Dokümantasyonu** - Tüm endpoint'ler açıklanmış
6. **Deployment Kılavuzu** - Kurulum ve çalıştırma talimatları

Platform artık kullanıma hazır durumda ve gelecekteki geliştirmeler için sağlam bir temel oluşturmuştur.

