import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CargoDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Yük Detayı - ID: {id}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Bu sayfa geliştirilme aşamasındadır.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CargoDetailPage;

