
import { useRef, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { GeoLocation, MapOptions } from '@/types';

interface UseMapControlsProps {
  mapOptions: MapOptions;
  location: GeoLocation | null;
}

export const useMapControls = ({ mapOptions, location }: UseMapControlsProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const { toast } = useToast();

  const onMapLoad = useCallback((map: google.maps.Map) => {
    console.log("Mapa cargado correctamente");
    mapRef.current = map;
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

  const centerOnUser = useCallback(() => {
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
  }, [location, toast]);

  return {
    mapRef,
    onMapLoad,
    zoomIn,
    zoomOut,
    centerOnUser
  };
};
