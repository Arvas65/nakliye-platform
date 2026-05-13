import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Truck, 
  Users, 
  MapPin, 
  MessageCircle, 
  Shield, 
  Clock,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <Truck className="h-8 w-8 text-blue-600" />,
      title: "Kolay İlan Verme",
      description: "Yük ilanınızı dakikalar içinde oluşturun ve nakliyecilerden teklif almaya başlayın."
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Güvenilir Nakliyeciler",
      description: "Doğrulanmış ve deneyimli nakliyecilerle güvenle çalışın."
    },
    {
      icon: <MapPin className="h-8 w-8 text-purple-600" />,
      title: "Harita Entegrasyonu",
      description: "Yükünüzün konumunu takip edin ve en uygun rotaları görün."
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-orange-600" />,
      title: "Anlık Mesajlaşma",
      description: "Nakliyecilerle direkt iletişim kurun ve anlaşma detaylarını konuşun."
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Güvenli Ödeme",
      description: "Güvenli ödeme sistemi ile işlemlerinizi koruma altına alın."
    },
    {
      icon: <Clock className="h-8 w-8 text-indigo-600" />,
      title: "7/24 Destek",
      description: "Her zaman yanınızdayız. Sorunlarınız için 7/24 destek alın."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Aktif Kullanıcı" },
    { number: "50,000+", label: "Tamamlanan İş" },
    { number: "99%", label: "Müşteri Memnuniyeti" },
    { number: "24/7", label: "Destek Hizmeti" }
  ];

  const testimonials = [
    {
      name: "Ahmet Yılmaz",
      role: "Yük Sahibi",
      content: "Platform sayesinde yüklerimi çok daha hızlı ve güvenli şekilde taşıtabiliyorum. Nakliyecilerle direkt iletişim kurabilmek harika!",
      rating: 5
    },
    {
      name: "Mehmet Kaya",
      role: "Nakliyeci",
      content: "Sürekli iş bulabiliyorum ve müşterilerle kolay iletişim kurabiliyorum. Kesinlikle tavsiye ederim.",
      rating: 5
    },
    {
      name: "Fatma Demir",
      role: "Lojistik Uzmanı",
      content: "Şirketimizin nakliye ihtiyaçları için mükemmel bir çözüm. Zaman ve maliyet tasarrufu sağlıyor.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Yük Sahipleri ve Nakliyeciler
              <span className="block text-blue-200">Burada Buluşuyor</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Türkiye'nin en güvenilir nakliye platformunda yükünüzü taşıyacak 
              en uygun nakliyeciyi bulun veya nakliyeci olarak iş fırsatlarını keşfedin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                <Link to="/register">
                  Hemen Başla
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Link to="/cargo">
                  Yük İlanlarını Gör
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Neden Nakliye Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Modern teknoloji ile nakliye sektörünü dönüştürüyoruz. 
              İşte size sunduğumuz avantajlar.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nasıl Çalışır?
            </h2>
            <p className="text-xl text-gray-600">
              Sadece 3 adımda yükünüzü taşıyın veya iş bulun
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Kayıt Olun</h3>
              <p className="text-gray-600">
                Yük sahibi veya nakliyeci olarak platforma ücretsiz kayıt olun.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">İlan Verin / Teklif Verin</h3>
              <p className="text-gray-600">
                Yük ilanı verin veya mevcut ilanlara teklif vererek işe başlayın.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Anlaşın ve Taşıyın</h3>
              <p className="text-gray-600">
                En uygun teklifi seçin, anlaşın ve güvenle taşıma işlemini gerçekleştirin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Müşterilerimiz Ne Diyor?
            </h2>
            <p className="text-xl text-gray-600">
              Binlerce memnun kullanıcımızdan bazı görüşler
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Hemen Başlayın!
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Nakliye Platform'a katılın ve nakliye işlemlerinizi 
            daha kolay, güvenli ve karlı hale getirin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Link to="/register">
                Ücretsiz Kayıt Ol
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link to="/cargo">
                İlanları İncele
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

