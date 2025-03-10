
import React from 'react';
import { useGlobalGeolocation } from '@/hooks/useGlobalGeolocation';
import { MapPin, AlertCircle, Loader2, MapPinOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface GeolocationAlertProps {
  className?: string;
}

/**
 * Componente que muestra un indicador del estado de geolocalización
 */
const GeolocationAlert = ({ className }: GeolocationAlertProps) => {
  const { location, status, error, requestGeolocation, isLoading } = useGlobalGeolocation();

  const getStatusColor = () => {
    switch (status) {
      case 'available':
        return "bg-green-500/80 hover:bg-green-500";
      case 'denied':
      case 'error':
        return "bg-destructive/80 hover:bg-destructive";
      case 'unavailable':
        return "bg-amber-500/80 hover:bg-amber-500";
      case 'loading':
        return "bg-blue-500/80 hover:bg-blue-500 animate-pulse";
      default:
        return "bg-slate-500/80 hover:bg-slate-500";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'available':
        return <MapPin className="h-5 w-5 text-white" />;
      case 'denied':
      case 'error':
        return <MapPinOff className="h-5 w-5 text-white" />;
      case 'unavailable':
        return <AlertCircle className="h-5 w-5 text-white" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 text-white animate-spin" />;
      default:
        return <MapPinOff className="h-5 w-5 text-white" />;
    }
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requestGeolocation();
  };

  return (
    <div 
      className={cn(
        "fixed bottom-12 right-4 z-50 transition-all duration-300", // Cambiado de bottom-4 right-28 a bottom-12 right-4
        className
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "p-2 rounded-full shadow-md flex items-center justify-center transition-colors",
              getStatusColor()
            )}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {getStatusIcon()}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <div className="space-y-2">
            <p className="font-medium">
              {status === 'available' && "Ubicación disponible"}
              {status === 'denied' && "Permiso de ubicación denegado"}
              {status === 'unavailable' && "Ubicación no disponible"}
              {status === 'error' && "Error de ubicación"}
              {status === 'loading' && "Obteniendo ubicación..."}
            </p>
            
            {error && <p className="text-xs text-muted-foreground">{error}</p>}
            
            {location && (
              <div className="text-xs text-muted-foreground">
                Lat: {location.coordinates[1].toFixed(4)}, 
                Lon: {location.coordinates[0].toFixed(4)}
              </div>
            )}
            
            <p className="text-xs italic">Haz clic para actualizar la ubicación</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default GeolocationAlert;
