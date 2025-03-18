
import React from 'react';
import { Waste } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Trash2, PenSquare, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { WASTE_TYPE_TRANSLATIONS, WASTE_STATUS_TRANSLATIONS, WASTE_TYPE_COLORS } from '@/services/wastes/constants';

interface WasteCardProps {
  waste: Waste;
  onEdit?: () => void;
  onDelete?: () => void;
  onShowLocation?: () => void;
  showActions?: boolean;
}

const WasteCard = ({ 
  waste, 
  onEdit, 
  onDelete, 
  onShowLocation, 
  showActions = true 
}: WasteCardProps) => {
  // Formatear fecha de publicación
  const formattedDate = format(
    new Date(waste.publicationDate), 
    "d 'de' MMMM, yyyy", 
    { locale: es }
  );
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {waste.imageUrl && (
        <div className="relative w-full h-48 overflow-hidden">
          <img
            src={waste.imageUrl}
            alt={waste.description}
            className="object-cover w-full h-full"
          />
          <div className="absolute top-2 right-2">
            <Badge 
              variant="secondary" 
              className={`${WASTE_TYPE_COLORS[waste.type]} text-white font-medium`}
            >
              {WASTE_TYPE_TRANSLATIONS[waste.type]}
            </Badge>
          </div>
          <div className="absolute bottom-2 right-2">
            <Badge variant="outline" className="bg-white">
              {WASTE_STATUS_TRANSLATIONS[waste.status]}
            </Badge>
          </div>
        </div>
      )}
      
      <CardHeader className={waste.imageUrl ? "py-3" : "pb-2"}>
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg truncate">
            {WASTE_TYPE_TRANSLATIONS[waste.type]}
          </h3>
          {!waste.imageUrl && (
            <Badge 
              variant="outline" 
              className={`ml-2 ${WASTE_TYPE_COLORS[waste.type]} text-white`}
            >
              {WASTE_TYPE_TRANSLATIONS[waste.type]}
            </Badge>
          )}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          {formattedDate}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm line-clamp-3">
          {waste.description || "Sin descripción"}
        </p>
        
        {waste.location && waste.location.coordinates && (
          <div className="flex items-center mt-3 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span className="truncate">
              {waste.location.coordinates[1].toFixed(6)}, {waste.location.coordinates[0].toFixed(6)}
            </span>
          </div>
        )}
      </CardContent>
      
      {showActions && (
        <CardFooter className="pt-2 pb-3 flex justify-between gap-2">
          {onShowLocation && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onShowLocation}
            >
              <MapPin className="h-4 w-4 mr-1" />
              Ver Mapa
            </Button>
          )}
          
          {onEdit && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onEdit}
            >
              <PenSquare className="h-4 w-4" />
            </Button>
          )}
          
          {onDelete && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default WasteCard;
