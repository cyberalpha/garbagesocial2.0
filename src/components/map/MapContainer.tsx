import React, { useCallback, useRef, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { GeoLocation, MapOptions, Waste } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import MapControls from './MapControls';
import MapMarkers from './MapMarkers';
import MapRoutePolyline from './MapRoutePolyline';
import SelectedWasteCard from './SelectedWasteCard';
import RouteDisplay from '../RouteDisplay';

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
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [selectedWaste, setSelectedWaste] = useState<Waste | null>(null);
  const [showInfoWindow, setShowInfoWindow] = useState<boolean>(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [isRoutingMode, setIsRoutingMode] = useState(false);
  const { toast } = useToast();
  const [mapLoaded, setMapLoaded] = useState(false);

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
  }, []);

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
  }, [location, mapLoaded, toast]);

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

  const handleMarkerClick = (waste: Waste) => {
    if (isRoutingMode) {
      selectWaste(waste);
      toast({
        title: "Punto agregado a la ruta",
        description: `${waste.type} - ${waste.description}`,
      });
    } else {
      setSelectedWaste(waste);
      setShowInfoWindow(true);
      if (onMarkerClick) {
        onMarkerClick(waste);
      }
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

  const toggleRoutingMode = () => {
    setIsRoutingMode(!isRoutingMode);
    setSelectedWaste(null);
    setShowInfoWindow(false);
    if (!isRoutingMode) {
      clearRoute();
      toast({
        title: "Modo ruta activado",
        description: "Selecciona puntos para crear tu ruta de recolección.",
      });
    } else {
      toast({
        title: "Modo ruta desactivado",
        description: "Has salido del modo de planificación de ruta.",
      });
    }
  };

  const handleWasteCommit = (waste: Waste) => {
    console.log('Compromiso para retirar:', waste);
    // Aquí iría la lógica para registrar el compromiso
  };

  if (loadError) {
    console.error("Error loading Google Maps API:", loadError);
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md">
          <h3 className="font-bold">Error al cargar Google Maps</h3>
          <p>No se pudo cargar el mapa. Por favor, intente de nuevo más tarde.</p>
          <p className="text-xs mt-2">Detalles técnicos: {loadError.message || "Error desconocido"}</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-600">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px] bg-gray-100 rounded-lg overflow-hidden">
      {isLoaded && (
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
                onMarkerClick={handleMarkerClick}
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
      )}
      
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
        onCommit={handleWasteCommit}
      />
      
      {isRoutingMode && (
        <div className="absolute bottom-4 left-4 right-4 md:w-96">
          <RouteDisplay 
            selectedWastes={selectedWastes}
            optimizedRoute={optimizedRoute}
            onRemove={deselectWaste}
            onClearAll={clearRoute}
            onOptimize={handleOptimizeRoute}
            isOptimizing={isOptimizing}
          />
        </div>
      )}
      
      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white p-4 rounded-md shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm">Obteniendo ubicación...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapContainer;
