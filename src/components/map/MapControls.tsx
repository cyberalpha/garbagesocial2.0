
import React from 'react';
import { Button } from '@/components/ui/button';
import { Locate, Layers, ZoomIn, ZoomOut, Route as RouteIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterUser: () => void;
  onToggleRoutingMode?: () => void;
  showRouteTools?: boolean;
  isRoutingMode?: boolean;
}

const MapControls = ({
  onZoomIn,
  onZoomOut,
  onCenterUser,
  onToggleRoutingMode,
  showRouteTools = false,
  isRoutingMode = false
}: MapControlsProps) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col space-y-2">
      <Button variant="secondary" size="icon" onClick={onZoomIn}>
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="secondary" size="icon" onClick={onZoomOut}>
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button variant="secondary" size="icon" onClick={onCenterUser}>
        <Locate className="h-4 w-4" />
      </Button>
      {showRouteTools && (
        <Button 
          variant={isRoutingMode ? "default" : "secondary"} 
          size="icon"
          onClick={onToggleRoutingMode}
          title={isRoutingMode ? "Desactivar modo ruta" : "Activar modo ruta"}
        >
          <RouteIcon className="h-4 w-4" />
        </Button>
      )}
      <Button variant="secondary" size="icon">
        <Layers className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MapControls;
