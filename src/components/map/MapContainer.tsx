import React, { useState, useEffect } from 'react';
import { Waste, MapOptions, GeoLocation } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useMapState } from '@/hooks/useMapState';
import { useMapControls } from '@/hooks/useMapControls';
import { useMapRouteHandling } from '@/hooks/useMapRouteHandling';
import GoogleMapWrapper from './GoogleMapWrapper';
import MapControls from './MapControls';
import MapMarkers from './MapMarkers';
import MapRoutePolyline from './MapRoutePolyline';
import SelectedWasteCard from './SelectedWasteCard';
import RoutePlanningPanel from './RoutePlanningPanel';
import { getAllWastes } from '@/services/wastes';

interface MapContainerProps {
  initialOptions?: Partial<MapOptions>;
  onMarkerClick?: (waste: Waste) => void;
  showRouteTools?: boolean;
  useGeolocation: {
    location: GeoLocation | null;
    error: string | null;
    loading: boolean;
  };
  useRouteOptimization: {
    selectedWastes: Waste[];
    optimizedRoute: Waste[];
    isOptimizing: boolean;
    selectWaste: (waste: Waste) => void;
    deselectWaste: (wasteId: string) => void;
    optimizeRoute: (startLocation: GeoLocation) => void;
    clearRoute: () => void;
  };
}

const MapContainer = ({ 
  initialOptions, 
  onMarkerClick,
  showRouteTools = false,
  useGeolocation: { location },
  useRouteOptimization: {
    selectedWastes,
    optimizedRoute,
    isOptimizing,
    selectWaste,
    deselectWaste,
    optimizeRoute,
    clearRoute
  }
}: MapContainerProps) => {
  const { toast } = useToast();
  const {
    wastes,
    setWastes,
    selectedWaste,
    setSelectedWaste,
    showInfoWindow,
    setShowInfoWindow,
    isRoutingMode,
    setMapLoaded,
    handleMarkerClick,
    toggleRoutingMode
  } = useMapState();

  console.log("MapContainer rendering, wastes:", wastes.length);

  const [mapOptions] = useState<MapOptions>({
    center: initialOptions?.center || [-58.3816, -34.6037],
    zoom: initialOptions?.zoom || 13
  });

  const { mapRef, onMapLoad: handleMapLoad, zoomIn, zoomOut, centerOnUser } = useMapControls({
    mapOptions,
    location
  });

  const { handleOptimizeRoute } = useMapRouteHandling({
    location,
    optimizeRoute,
    clearRoute
  });

  const onMapLoad = (map: google.maps.Map) => {
    handleMapLoad(map);
    setMapLoaded(true);
    console.log("Map loaded successfully");
  };

  useEffect(() => {
    const loadWastes = async () => {
      try {
        const data = getAllWastes();
        console.log("Residuos cargados:", data.length);
        setWastes(data);
      } catch (error) {
        console.error("Error al cargar residuos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los puntos de residuos",
          variant: "destructive"
        });
      }
    };
    
    loadWastes();
  }, [setWastes, toast]);

  useEffect(() => {
    if (location && mapRef.current) {
      console.log("Centrando mapa en ubicación del usuario:", location.coordinates);
      mapRef.current.panTo({ 
        lat: location.coordinates[1], 
        lng: location.coordinates[0] 
      });
      toast({
        title: "Ubicación encontrada",
        description: "El mapa se ha centrado en tu ubicación",
      });
    }
  }, [location, mapRef, toast]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-gray-100 rounded-lg overflow-hidden">
      <GoogleMapWrapper
        mapOptions={mapOptions}
        onMapLoad={onMapLoad}
      >
        <MapMarkers 
          wastes={wastes}
          selectedWastes={selectedWastes}
          optimizedRoute={optimizedRoute}
          location={location}
          selectedWaste={selectedWaste}
          showInfoWindow={showInfoWindow}
          isRoutingMode={isRoutingMode}
          onMarkerClick={(waste) => handleMarkerClick(waste, selectWaste)}
          onInfoWindowClose={() => setShowInfoWindow(false)}
        />
        
        <MapRoutePolyline 
          isRoutingMode={isRoutingMode}
          optimizedRoute={optimizedRoute}
          location={location}
        />
      </GoogleMapWrapper>
      
      <MapControls 
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onCenterUser={centerOnUser}
        onToggleRoutingMode={toggleRoutingMode}
        showRouteTools={showRouteTools}
        isRoutingMode={isRoutingMode}
      />
      
      {selectedWaste && !isRoutingMode && (
        <SelectedWasteCard 
          selectedWaste={selectedWaste}
          isRoutingMode={isRoutingMode}
          onClose={() => setSelectedWaste(null)}
          onCommit={() => {
            toast({
              title: "Compromiso de recogida",
              description: "Has decidido recoger este residuo. ¡Gracias por tu contribución!",
            });
          }}
        />
      )}
      
      {isRoutingMode && (
        <RoutePlanningPanel
          selectedWastes={selectedWastes}
          optimizedRoute={optimizedRoute}
          onRemove={deselectWaste}
          onClearAll={clearRoute}
          onOptimize={handleOptimizeRoute}
          isOptimizing={isOptimizing}
        />
      )}
    </div>
  );
};

export default MapContainer;
