import React, { useCallback, useRef, useEffect } from 'react';
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
  useGeolocation: { location, error, loading },
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
    mapInitialized,
    setMapInitialized,
    isRoutingMode,
    mapLoaded,
    setMapLoaded,
    handleMarkerClick,
    toggleRoutingMode
  } = useMapState();

  const [mapOptions, setMapOptions] = useState<MapOptions>({
    center: initialOptions?.center || [-58.3816, -34.6037],
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

  useEffect(() => {
    return () => {
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWastes([
        {
          id: '1',
          userId: 'user123456789',
          type: 'plastic',
          description: 'Botellas de plástico',
          imageUrl: 'https://images.unsplash.com/photo-1605600659453-128bfdb3a5eb?w=600&auto=format&fit=crop',
          location: {
            type: 'Point',
            coordinates: [-58.3816, -34.6037]
          },
          publicationDate: new Date('2023-05-15T10:30:00'),
          status: 'pending'
        },
        {
          id: '2',
          userId: 'user987654321',
          type: 'paper',
          description: 'Cajas de cartón',
          imageUrl: 'https://images.unsplash.com/photo-1607625004976-fe1049860b6b?w=600&auto=format&fit=crop',
          location: {
            type: 'Point',
            coordinates: [-58.3712, -34.6083]
          },
          publicationDate: new Date('2023-05-14T14:45:00'),
          status: 'pending'
        },
        {
          id: '3',
          userId: 'user246813579',
          type: 'organic',
          description: 'Restos de poda',
          location: {
            type: 'Point',
            coordinates: [-58.3948, -34.6011]
          },
          publicationDate: new Date('2023-05-16T09:15:00'),
          status: 'in_progress',
          pickupCommitment: {
            recyclerId: 'recycler123',
            commitmentDate: new Date('2023-05-16T11:00:00')
          }
        }
      ]);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (location && mapLoaded && mapRef.current) {
      console.log("Centrando mapa en ubicación del usuario:", location.coordinates);
      mapRef.current.panTo({ 
        lat: location.coordinates[1], 
        lng: location.coordinates[0] 
      });
      setMapInitialized(true);
      toast({
        title: "Ubicación encontrada",
        description: `Posición actual: ${location.coordinates[1].toFixed(4)}, ${location.coordinates[0].toFixed(4)}`,
      });
    }
  }, [location, mapLoaded, toast, setMapInitialized]);

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
        description: "El mapa se ha centrado en tu posición actual.",
      });
    } else {
      toast({
        title: "Ubicación no disponible",
        description: "No se pudo encontrar tu ubicación.",
        variant: "destructive"
      });
    }
  };

  const handleOptimizeRoute = () => {
    if (location) {
      optimizeRoute(location);
      toast({
        title: "Ruta optimizada",
        description: `Se ha calculado la ruta óptima para ${selectedWastes.length} puntos.`,
      });
    } else {
      toast({
        title: "No se pudo optimizar",
        description: "Se necesita tu ubicación para calcular la ruta óptima.",
        variant: "destructive"
      });
    }
  };

  if (loadError) {
    return <ErrorMessage message={loadError.message || "Error desconocido"} />;
  }

  if (!isLoaded) {
    return <LoadingOverlay />;
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
        }}
      >
        {mapLoaded && (
          <>
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
          </>
        )}
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
        onCommit={() => {}}
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
      
      {error && <ErrorMessage message={error} />}
      {loading && <LoadingOverlay />}
    </div>
  );
};

export default MapContainer;
