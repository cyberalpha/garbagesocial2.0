
import { useState, useCallback, useRef, useEffect } from 'react';
import { MapOptions, GeoLocation } from '@/types';
import { useToast } from '@/components/ui/use-toast';

export const useMapInteractions = (initialOptions?: Partial<MapOptions>) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const { toast } = useToast();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);

  const [mapOptions, setMapOptions] = useState<MapOptions>({
    center: initialOptions?.center || [-58.3816, -34.6037],
    zoom: initialOptions?.zoom || 13
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

  const centerMap = useCallback((location: GeoLocation) => {
    if (mapRef.current) {
      mapRef.current.panTo({ 
        lat: location.coordinates[1], 
        lng: location.coordinates[0] 
      });
      return true;
    }
    return false;
  }, []);

  const zoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setZoom((mapRef.current.getZoom() || mapOptions.zoom) + 1);
    }
  }, [mapOptions.zoom]);

  const zoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setZoom((mapRef.current.getZoom() || mapOptions.zoom) - 1);
    }
  }, [mapOptions.zoom]);

  const centerOnLocation = useCallback((location: GeoLocation | null, showToast = true) => {
    if (location && mapRef.current) {
      mapRef.current.panTo({ 
        lat: location.coordinates[1], 
        lng: location.coordinates[0] 
      });
      if (showToast) {
        toast({
          title: "Centrado en ubicación",
          description: `Posición: ${location.coordinates[1].toFixed(4)}, ${location.coordinates[0].toFixed(4)}`,
        });
      }
      return true;
    } else if (showToast) {
      toast({
        title: "Ubicación no disponible",
        description: "No se pudo encontrar la ubicación solicitada.",
        variant: "destructive"
      });
    }
    return false;
  }, [toast]);

  return {
    mapRef,
    mapLoaded,
    mapInitialized,
    mapOptions,
    setMapOptions,
    setMapLoaded,
    setMapInitialized,
    onMapLoad,
    zoomIn,
    zoomOut,
    centerMap,
    centerOnLocation
  };
};
