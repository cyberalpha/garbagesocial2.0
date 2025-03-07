
import { Clock, MapPin, User } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { GeoLocation } from '@/types';

interface WasteMetadataProps {
  publicationDate: Date;
  location: GeoLocation;
  userId: string;
  pickupCommitment?: {
    recyclerId: string;
    commitmentDate: Date;
  };
  isExpanded: boolean;
}

const WasteMetadata = ({ 
  publicationDate, 
  location, 
  userId, 
  pickupCommitment, 
  isExpanded 
}: WasteMetadataProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-gray-600">
        <Clock className="h-4 w-4" />
        <span>{formatDate(publicationDate)}</span>
      </div>
      
      <div className="flex items-center gap-2 text-gray-600">
        <MapPin className="h-4 w-4" />
        <span>
          {location.coordinates[1].toFixed(6)}, {location.coordinates[0].toFixed(6)}
        </span>
      </div>
      
      <div className="flex items-center gap-2 text-gray-600">
        <User className="h-4 w-4" />
        <span>Usuario ID: {userId.substring(0, 8)}...</span>
      </div>
      
      {isExpanded && pickupCommitment && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md border">
          <div className="font-medium mb-1">Compromiso de retiro:</div>
          <div className="text-sm text-gray-600">
            Reciclador: {pickupCommitment.recyclerId.substring(0, 8)}...
          </div>
          <div className="text-sm text-gray-600">
            Fecha: {formatDate(pickupCommitment.commitmentDate)}
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteMetadata;
