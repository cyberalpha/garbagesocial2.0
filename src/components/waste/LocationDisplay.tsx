
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MapPin, Loader } from 'lucide-react';
import { GeoLocation } from '@/types';

interface LocationDisplayProps {
  location: GeoLocation | null;
  loading: boolean;
  error: string | null;
}

const LocationDisplay = ({ location, loading, error }: LocationDisplayProps) => {
  return (
    <div className="space-y-2">
      <Label>Ubicación</Label>
      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader className="h-5 w-5 text-primary animate-spin mr-2" />
              <span className="text-sm">Obteniendo ubicación...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-3 rounded-md text-red-800 text-sm">
              {error}
            </div>
          ) : location ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>
                  Latitud: {location.coordinates[1].toFixed(6)}, 
                  Longitud: {location.coordinates[0].toFixed(6)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Utilizando tu ubicación actual. Para más precisión, 
                confirma que has concedido permisos de ubicación a tu navegador.
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 p-3 rounded-md text-yellow-800 text-sm">
              No se pudo obtener tu ubicación. Intenta de nuevo o introduce la ubicación manualmente.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationDisplay;
