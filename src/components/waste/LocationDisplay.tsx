
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MapPin, Loader, AlertCircle, Info } from 'lucide-react';
import { GeoLocation } from '@/types';
import { useLanguage } from '@/components/LanguageContext';
import { useGlobalGeolocation } from '@/hooks/useGlobalGeolocation';

interface LocationDisplayProps {
  location: GeoLocation | null;
  loading: boolean;
  error: string | null;
}

const LocationDisplay = ({ location, loading, error }: LocationDisplayProps) => {
  const { t } = useLanguage();
  // Usamos el estado global como respaldo si el hook local falla
  const globalGeo = useGlobalGeolocation();
  
  // Priorizar el estado local, pero usar el global como respaldo
  const displayLocation = location || globalGeo.location;
  const displayLoading = loading && globalGeo.isLoading;
  const displayError = error || (globalGeo.status !== 'available' ? globalGeo.error : null);
  
  return (
    <div className="space-y-2">
      <Label>{t('waste.location')}</Label>
      <Card>
        <CardContent className="pt-4">
          {displayLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader className="h-5 w-5 text-primary animate-spin mr-2" />
              <span className="text-sm">{t('waste.gettingLocation')}</span>
            </div>
          ) : displayError ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center bg-yellow-50 p-3 rounded-md text-yellow-800 text-sm">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{displayError}</span>
              </div>
              {displayLocation && (
                <div className="flex items-center gap-2 text-sm mt-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  <span className="text-xs">Usando ubicación predeterminada. Puedes continuar con el formulario.</span>
                </div>
              )}
            </div>
          ) : displayLocation ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>
                  {t('waste.latitude')}: {displayLocation.coordinates[1].toFixed(6)}, 
                  {t('waste.longitude')}: {displayLocation.coordinates[0].toFixed(6)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {t('waste.locationPermission')}
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 p-3 rounded-md text-yellow-800 text-sm">
              {t('waste.locationFailed')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationDisplay;
