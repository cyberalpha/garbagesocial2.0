
import { useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { GeoLocation, MapOptions } from '@/types';

interface UseMapControlsProps {
  mapOptions: MapOptions;
  location: GeoLocation | null;
}

export const useMapControls = ({ mapOptions, location }: UseMapControlsProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const { toast } = useToast();
  const locationApplied = useRef(false);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    console.log("Mapa cargado correctamente");
    mapRef.current = map;
    
    // Intentar centrar en la ubicación del usuario si ya está disponible
    if (location && !locationApplied.current) {
      console.log("Centrando mapa en ubicación del usuario durante carga:", location.coordinates);
      map.setCenter({ 
        lat: location.coordinates[1], 
        lng: location.coordinates[0] 
      });
      locationApplied.current = true;
    }
  }, [location]);

  // Efecto para centrar el mapa cuando la ubicación cambia
  useEffect(() => {
    if (location && mapRef.current && !locationApplied.current) {
      console.log("Centrando mapa en ubicación actualizada del usuario:", location.coordinates);
      mapRef.current.setCenter({ 
        lat: location.coordinates[1], 
        lng: location.coordinates[0] 
      });
      locationApplied.current = true;
      
      toast({
        title: "Ubicación encontrada",
        description: "El mapa se ha centrado en tu ubicación",
      });
    }
  }, [location, toast]);

  const zoomIn = useCallback(() => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || mapOptions.zoom;
      mapRef.current.setZoom(currentZoom + 1);
    }
  }, [mapOptions.zoom]);

  const zoomOut = useCallback(() => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || mapOptions.zoom;
      mapRef.current.setZoom(currentZoom - 1);
    }
  }, [mapOptions.zoom]);

  const centerOnUser = useCallback(() => {
    if (!location || !mapRef.current) {
      toast({
        title: "Ubicación no disponible",
        description: "No se pudo encontrar tu ubicación",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Centrando manualmente en la ubicación del usuario:", location.coordinates);
    mapRef.current.panTo({ 
      lat: location.coordinates[1], 
      lng: location.coordinates[0] 
    });
    
    toast({
      title: "Centrado en tu ubicación",
      description: "El mapa se ha centrado en tu posición actual",
    });
  }, [location, toast]);

  return {
    mapRef,
    onMapLoad,
    zoomIn,
    zoomOut,
    centerOnUser
  };
};
