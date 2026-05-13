import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  MapPin, 
  Calendar, 
  Weight, 
  DollarSign,
  Search,
  Filter,
  Eye,
  Clock,
  Truck
} from 'lucide-react';

const CargoListPage = () => {
  const { apiCall } = useAuth();
  const [cargoPosts, setCargoPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    cargo_type: '',
    pickup_city: '',
    delivery_city: '',
    min_weight: '',
    max_weight: '',
    sort_by: 'created_at'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 12,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchCargoPosts();
  }, [filters, pagination.page]);

  const fetchCargoPosts = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: pagination.page,
        per_page: pagination.per_page,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });

      const response = await apiCall(`/cargo-posts?${queryParams}`);
      
      setCargoPosts(response.cargo_posts || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        pages: response.pages || 0
      }));
    } catch (error) {
      console.error('Cargo posts fetch error:', error);
      setCargoPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getUrgencyBadge = (isUrgent) => {
    return isUrgent ? (
      <Badge variant="destructive" className="text-xs">
        <Clock className="h-3 w-3 mr-1" />
        Acil
      </Badge>
    ) : null;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'default', text: 'Aktif' },
      completed: { variant: 'secondary', text: 'Tamamlandı' },
      cancelled: { variant: 'destructive', text: 'İptal' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  if (loading && cargoPosts.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Yük İlanları
          </h1>
          <p className="text-gray-600">
            Aktif yük ilanlarını inceleyin ve teklif verin
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtreler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Arama</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="İlan başlığı veya açıklama..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Yük Türü</label>
                <Select onValueChange={(value) => handleFilterChange('cargo_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Yük türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tümü</SelectItem>
                    <SelectItem value="genel">Genel Kargo</SelectItem>
                    <SelectItem value="elektronik">Elektronik</SelectItem>
                    <SelectItem value="gida">Gıda</SelectItem>
                    <SelectItem value="tekstil">Tekstil</SelectItem>
                    <SelectItem value="mobilya">Mobilya</SelectItem>
                    <SelectItem value="otomotiv">Otomotiv</SelectItem>
                    <SelectItem value="kimyasal">Kimyasal</SelectItem>
                    <SelectItem value="diger">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Alış Şehri</label>
                <Input
                  placeholder="Alış şehri"
                  value={filters.pickup_city}
                  onChange={(e) => handleFilterChange('pickup_city', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Teslim Şehri</label>
                <Input
                  placeholder="Teslim şehri"
                  value={filters.delivery_city}
                  onChange={(e) => handleFilterChange('delivery_city', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Min Ağırlık (kg)</label>
                <Input
                  type="number"
                  placeholder="Min ağırlık"
                  value={filters.min_weight}
                  onChange={(e) => handleFilterChange('min_weight', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Max Ağırlık (kg)</label>
                <Input
                  type="number"
                  placeholder="Max ağırlık"
                  value={filters.max_weight}
                  onChange={(e) => handleFilterChange('max_weight', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sıralama</label>
                <Select onValueChange={(value) => handleFilterChange('sort_by', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sıralama" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">En Yeni</SelectItem>
                    <SelectItem value="pickup_date">Alış Tarihi</SelectItem>
                    <SelectItem value="budget_max">Bütçe (Yüksek)</SelectItem>
                    <SelectItem value="budget_min">Bütçe (Düşük)</SelectItem>
                    <SelectItem value="weight">Ağırlık</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={() => {
                    setFilters({
                      search: '',
                      cargo_type: '',
                      pickup_city: '',
                      delivery_city: '',
                      min_weight: '',
                      max_weight: '',
                      sort_by: 'created_at'
                    });
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Filtreleri Temizle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {pagination.total} ilan bulundu
          </p>
          {loading && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Yükleniyor...
            </div>
          )}
        </div>

        {/* Cargo Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {cargoPosts.map((cargo) => (
            <Card key={cargo.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">
                    {cargo.title}
                  </CardTitle>
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(cargo.status)}
                    {getUrgencyBadge(cargo.is_urgent)}
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {cargo.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Route */}
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium">{cargo.pickup_city}</span>
                    <span className="mx-2">→</span>
                    <span className="font-medium">{cargo.delivery_city}</span>
                  </div>

                  {/* Cargo Type & Weight */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Package className="h-4 w-4 mr-2 text-green-600" />
                      {cargo.cargo_type}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Weight className="h-4 w-4 mr-2 text-purple-600" />
                      {cargo.weight} kg
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                    <span>
                      {cargo.budget_min && cargo.budget_max 
                        ? `${cargo.budget_min} - ${cargo.budget_max} ${cargo.currency}`
                        : cargo.budget_max 
                        ? `Max ${cargo.budget_max} ${cargo.currency}`
                        : 'Bütçe belirtilmemiş'
                      }
                    </span>
                  </div>

                  {/* Pickup Date */}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                    Alış: {formatDate(cargo.pickup_date)}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link to={`/cargo/${cargo.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Detay
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/cargo/${cargo.id}#offer`}>
                        <Truck className="h-4 w-4 mr-1" />
                        Teklif Ver
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {!loading && cargoPosts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Yük ilanı bulunamadı
              </h3>
              <p className="text-gray-600 mb-4">
                Arama kriterlerinize uygun ilan bulunmuyor. Filtreleri değiştirmeyi deneyin.
              </p>
              <Button 
                onClick={() => {
                  setFilters({
                    search: '',
                    cargo_type: '',
                    pickup_city: '',
                    delivery_city: '',
                    min_weight: '',
                    max_weight: '',
                    sort_by: 'created_at'
                  });
                }}
                variant="outline"
              >
                Filtreleri Temizle
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Önceki
            </Button>
            
            <div className="flex space-x-1">
              {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              Sonraki
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CargoListPage;

