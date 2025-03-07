
import { useState } from 'react';
import { Waste } from '../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User, AlertCircle } from 'lucide-react';

interface WasteCardProps {
  waste: Waste;
  onCommit?: (waste: Waste) => void;
}

const WasteCard = ({ waste, onCommit }: WasteCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Formato de fecha
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Traduce el tipo de residuo
  const getWasteTypeText = () => {
    switch(waste.type) {
      case 'organic': return 'Orgánico';
      case 'paper': return 'Papel';
      case 'glass': return 'Vidrio';
      case 'plastic': return 'Plástico';
      case 'metal': return 'Metal';
      case 'sanitary': return 'Control Sanitario';
      case 'dump': return 'Basural';
      default: return 'Varios';
    }
  };
  
  // Determina el color según el tipo de residuo
  const getWasteTypeColor = () => {
    switch(waste.type) {
      case 'organic': return 'bg-waste-organic';
      case 'paper': return 'bg-waste-paper';
      case 'glass': return 'bg-waste-glass';
      case 'plastic': return 'bg-waste-plastic';
      case 'metal': return 'bg-waste-metal';
      case 'sanitary': return 'bg-waste-sanitary';
      case 'dump': return 'bg-waste-dump';
      default: return 'bg-waste-various';
    }
  };

  // Traduce el estado
  const getStatusText = () => {
    switch(waste.status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En proceso';
      case 'collected': return 'Retirado';
      case 'canceled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };
  
  // Color del estado
  const getStatusColor = () => {
    switch(waste.status) {
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'collected': return 'bg-green-500';
      case 'canceled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Imagen si existe */}
      {waste.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={waste.imageUrl} 
            alt={waste.description} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <Badge 
              className={`${getWasteTypeColor()} text-white`}
            >
              {getWasteTypeText()}
            </Badge>
          </div>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {waste.imageUrl ? waste.description : (
              <div className="flex items-center gap-2">
                <Badge 
                  className={`${getWasteTypeColor()} text-white`}
                >
                  {getWasteTypeText()}
                </Badge>
                <span>{waste.description}</span>
              </div>
            )}
          </CardTitle>
          <Badge 
            variant="outline" 
            className={`${getStatusColor()} text-white`}
          >
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="text-sm space-y-2">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{formatDate(waste.publicationDate)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>
            {waste.location.coordinates[1].toFixed(6)}, {waste.location.coordinates[0].toFixed(6)}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <User className="h-4 w-4" />
          <span>Usuario ID: {waste.userId.substring(0, 8)}...</span>
        </div>
        
        {isExpanded && waste.pickupCommitment && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md border">
            <div className="font-medium mb-1">Compromiso de retiro:</div>
            <div className="text-sm text-gray-600">
              Reciclador: {waste.pickupCommitment.recyclerId.substring(0, 8)}...
            </div>
            <div className="text-sm text-gray-600">
              Fecha: {formatDate(waste.pickupCommitment.commitmentDate)}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Ver menos' : 'Ver más'}
        </Button>
        
        {waste.status === 'pending' && onCommit && (
          <Button 
            onClick={() => onCommit(waste)}
            size="sm"
            className="gap-1"
          >
            <AlertCircle className="h-4 w-4" />
            Comprometerme
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default WasteCard;
