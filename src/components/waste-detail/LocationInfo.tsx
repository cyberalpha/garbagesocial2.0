
import { MapPin } from 'lucide-react';
import { GeoLocation } from '@/types';

interface LocationInfoProps {
  location: GeoLocation;
}

const LocationInfo = ({ location }: LocationInfoProps) => {
  return (
    <div className="flex items-center text-gray-600">
      <MapPin className="h-4 w-4 mr-2" />
      <span>
        Latitud: {location.coordinates[1].toFixed(6)}, 
        Longitud: {location.coordinates[0].toFixed(6)}
      </span>
    </div>
  );
};

export default LocationInfo;
