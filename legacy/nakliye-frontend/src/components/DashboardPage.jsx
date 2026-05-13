import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Truck, 
  MessageCircle, 
  Bell, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Users,
  MapPin
} from 'lucide-react';

const DashboardPage = () => {
  const { user, apiCall } = useAuth();
  const [stats, setStats] = useState({
    totalCargoPosts: 0,
    activeCargoPosts: 0,
    totalOffers: 0,
    pendingOffers: 0,
    acceptedOffers: 0,
    unreadMessages: 0,
    unreadNotifications: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats based on user type
      if (user.user_type === 'cargo_owner') {
        // Fetch cargo owner stats
        const [cargoResponse, offersResponse, messagesResponse, notificationsResponse] = await Promise.all([
          apiCall('/my-cargo-posts?per_page=1'),
          apiCall('/cargo-posts/1/offers?per_page=1'), // This would need to be updated for all cargo posts
          apiCall('/unread-count'),
          apiCall('/notifications/unread-count')
        ]);

        setStats({
          totalCargoPosts: cargoResponse.total || 0,
          activeCargoPosts: cargoResponse.total || 0, // Would need filtering
          totalOffers: 0, // Would need aggregation
          pendingOffers: 0,
          acceptedOffers: 0,
          unreadMessages: messagesResponse.unread_count || 0,
          unreadNotifications: notificationsResponse.unread_count || 0
        });
      } else {
        // Fetch carrier stats
        const [offersResponse, messagesResponse, notificationsResponse] = await Promise.all([
          apiCall('/my-offers?per_page=1'),
          apiCall('/unread-count'),
          apiCall('/notifications/unread-count')
        ]);

        setStats({
          totalCargoPosts: 0,
          activeCargoPosts: 0,
          totalOffers: offersResponse.total || 0,
          pendingOffers: 0, // Would need filtering
          acceptedOffers: 0, // Would need filtering
          unreadMessages: messagesResponse.unread_count || 0,
          unreadNotifications: notificationsResponse.unread_count || 0
        });
      }

      // Mock recent activity for now
      setRecentActivity([
        {
          id: 1,
          type: 'offer',
          title: 'Yeni teklif aldınız',
          description: 'İstanbul-Ankara yük ilanınıza 15.000₺ teklif geldi',
          time: '2 saat önce',
          status: 'new'
        },
        {
          id: 2,
          type: 'message',
          title: 'Yeni mesaj',
          description: 'Ahmet Yılmaz size mesaj gönderdi',
          time: '4 saat önce',
          status: 'unread'
        },
        {
          id: 3,
          type: 'cargo',
          title: 'İlan onaylandı',
          description: 'Bursa-İzmir yük ilanınız onaylandı ve yayınlandı',
          time: '1 gün önce',
          status: 'completed'
        }
      ]);

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'unread':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <Badge variant="destructive">Yeni</Badge>;
      case 'unread':
        return <Badge variant="default">Okunmadı</Badge>;
      case 'completed':
        return <Badge variant="secondary">Tamamlandı</Badge>;
      default:
        return <Badge variant="outline">Bekliyor</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {user.full_name || user.username}!
          </h1>
          <p className="text-gray-600 mt-2">
            {user.user_type === 'cargo_owner' 
              ? 'Yük ilanlarınızı yönetin ve teklifleri inceleyin'
              : 'Yeni iş fırsatlarını keşfedin ve tekliflerinizi takip edin'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            {user.user_type === 'cargo_owner' ? (
              <>
                <Button asChild>
                  <Link to="/create-cargo">
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni İlan Ver
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/cargo">
                    <Eye className="h-4 w-4 mr-2" />
                    İlanlarımı Görüntüle
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild>
                  <Link to="/cargo">
                    <Package className="h-4 w-4 mr-2" />
                    Yük İlanlarını İncele
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/offers">
                    <Eye className="h-4 w-4 mr-2" />
                    Tekliflerimi Görüntüle
                  </Link>
                </Button>
              </>
            )}
            <Button asChild variant="outline">
              <Link to="/chat">
                <MessageCircle className="h-4 w-4 mr-2" />
                Mesajlar
                {stats.unreadMessages > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {stats.unreadMessages}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user.user_type === 'cargo_owner' ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Toplam İlanlar
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCargoPosts}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeCargoPosts} aktif ilan
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Gelen Teklifler
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOffers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingOffers} bekleyen teklif
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Verdiğim Teklifler
                  </CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOffers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.acceptedOffers} kabul edildi
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Bekleyen Teklifler
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingOffers}</div>
                  <p className="text-xs text-muted-foreground">
                    Yanıt bekleniyor
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Okunmamış Mesajlar
              </CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unreadMessages}</div>
              <p className="text-xs text-muted-foreground">
                Yeni mesajlar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Bildirimler
              </CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unreadNotifications}</div>
              <p className="text-xs text-muted-foreground">
                Okunmamış bildirim
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Son Aktiviteler</CardTitle>
              <CardDescription>
                Hesabınızdaki son hareketler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="mt-1">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        {getStatusBadge(activity.status)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/notifications">
                    Tüm Bildirimleri Görüntüle
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Hızlı Erişim</CardTitle>
              <CardDescription>
                Sık kullanılan özellikler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link to="/profile">
                    <Users className="h-4 w-4 mr-3" />
                    Profil Ayarları
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link to="/cargo">
                    <MapPin className="h-4 w-4 mr-3" />
                    Yük İlanları
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link to="/chat">
                    <MessageCircle className="h-4 w-4 mr-3" />
                    Mesajlaşma
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link to="/offers">
                    <Package className="h-4 w-4 mr-3" />
                    Teklifler
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link to="/notifications">
                    <Bell className="h-4 w-4 mr-3" />
                    Bildirimler
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

