
import { useState } from 'react';
import { Waste } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MapMarkerProps {
  waste: Waste;
  onClick?: () => void;
  isSelected?: boolean;
  routeOrder?: number;
}

const MapMarker = ({ waste, onClick, isSelected, routeOrder }: MapMarkerProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determina el color según el tipo de residuo
  const getMarkerColor = () => {
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

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Marker pin */}
      <div className={`
        relative cursor-pointer 
        transform transition-transform duration-200 
        ${isSelected ? 'scale-125' : 'hover:scale-110'}
      `}>
        <div className={`
          w-8 h-8 rounded-full ${getMarkerColor()} 
          shadow-lg flex items-center justify-center 
          border-2 ${isSelected ? 'border-blue-500 border-4' : 'border-white'}
        `}>
          {routeOrder ? (
            <span className="text-white font-bold text-xs">{routeOrder}</span>
          ) : (
            <div className="w-4 h-4 bg-white rounded-full animate-pulse-light" />
          )}
        </div>
        <div className={`
          absolute -bottom-2 left-1/2 transform -translate-x-1/2 
          w-4 h-4 rotate-45 ${getMarkerColor()}
        `} />
      </div>
      
      {/* Tooltip on hover */}
      {(isHovered || isSelected) && (
        <Card className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 w-48 animate-fade-in">
          <CardContent className="p-3">
            <div className="text-sm font-medium flex items-center">
              {getWasteTypeText()}
              {routeOrder && (
                <Badge className="ml-2 bg-blue-500" variant="default">
                  {routeOrder}
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-500 truncate">{waste.description}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MapMarker;
