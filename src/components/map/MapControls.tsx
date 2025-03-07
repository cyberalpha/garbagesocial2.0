
import React from 'react';
import { Button } from '@/components/ui/button';
import { Locate, Layers, ZoomIn, ZoomOut, Route as RouteIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="icon" onClick={onZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Acercar</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="icon" onClick={onZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Alejar</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="icon" onClick={onCenterUser}>
              <Locate className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mi ubicación</p>
          </TooltipContent>
        </Tooltip>

        {showRouteTools && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={isRoutingMode ? "default" : "secondary"} 
                size="icon"
                onClick={onToggleRoutingMode}
              >
                <RouteIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isRoutingMode ? "Desactivar modo ruta" : "Activar modo ruta"}</p>
            </TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="icon">
              <Layers className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Capas del mapa</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default MapControls;
