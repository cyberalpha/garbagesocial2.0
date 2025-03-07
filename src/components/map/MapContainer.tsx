
import React, { useCallback, useRef, useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { GeoLocation, MapOptions, Waste } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import MapControls from './MapControls';
import MapMarkers from './MapMarkers';
import MapRoutePolyline from './MapRoutePolyline';
import SelectedWasteCard from './SelectedWasteCard';
import LoadingOverlay from './LoadingOverlay';
import ErrorMessage from './ErrorMessage';
import RoutePlanningPanel from './RoutePlanningPanel';
import { useMapState } from '@/hooks/useMapState';
import { getAllWastes } from '@/services/mockData';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const GOOGLE_MAPS_API_KEY = "AIzaSyBpySf9Hxcg-Awq6VK00R5RGmn3_D9-W9g";
const libraries = ['places', 'geometry'] as any;

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
  const mapRef = useRef<google.maps.Map | null>(null);
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

  // Opciones del mapa predeterminadas centradas en Buenos Aires
  const [mapOptions] = useState<MapOptions>({
    center: initialOptions?.center || [-58.3816, -34.6037], // Buenos Aires por defecto
    zoom: initialOptions?.zoom || 13
  });

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
    language: "es",
    region: "AR"
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    console.log("Mapa cargado correctamente");
    mapRef.current = map;
    setMapLoaded(true);
  }, [setMapLoaded]);

  // Cargar los datos de residuos
  useEffect(() => {
    const loadWastes = async () => {
      try {
        const data = getAllWastes();
        console.log("Residuos cargados:", data);
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
    
    if (isLoaded) {
      loadWastes();
    }
  }, [isLoaded, setWastes, toast]);

  // Centrar el mapa en la ubicación del usuario cuando esté disponible
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
  }, [location, toast]);

  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom((mapRef.current.getZoom() || mapOptions.zoom) + 1);
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom((mapRef.current.getZoom() || mapOptions.zoom) - 1);
    }
  };

  const centerOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.panTo({ 
        lat: location.coordinates[1], 
        lng: location.coordinates[0] 
      });
      toast({
        title: "Centrado en tu ubicación",
        description: "El mapa se ha centrado en tu posición actual",
      });
    } else {
      toast({
        title: "Ubicación no disponible",
        description: "No se pudo encontrar tu ubicación",
        variant: "destructive"
      });
    }
  };

  const handleOptimizeRoute = () => {
    if (location) {
      optimizeRoute(location);
      toast({
        title: "Ruta optimizada",
        description: `Se ha calculado la ruta óptima para ${selectedWastes.length} puntos`,
      });
    } else {
      toast({
        title: "No se pudo optimizar",
        description: "Se necesita tu ubicación para calcular la ruta óptima",
        variant: "destructive"
      });
    }
  };

  if (loadError) {
    return <ErrorMessage message={loadError.message || "Error al cargar Google Maps"} />;
  }

  if (!isLoaded) {
    return <LoadingOverlay message="Cargando mapa..." />;
  }

  return (
    <div className="relative w-full h-full min-h-[400px] bg-gray-100 rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{
          lat: mapOptions.center[1],
          lng: mapOptions.center[0]
        }}
        zoom={mapOptions.zoom}
        onLoad={onMapLoad}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        }}
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
      </GoogleMap>
      
      <MapControls 
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onCenterUser={centerOnUser}
        onToggleRoutingMode={toggleRoutingMode}
        showRouteTools={showRouteTools}
        isRoutingMode={isRoutingMode}
      />
      
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
