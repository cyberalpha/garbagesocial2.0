
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { GeoLocation } from '@/types';

interface UseMapRouteHandlingProps {
  location: GeoLocation | null;
  optimizeRoute: (startLocation: GeoLocation) => void;
  clearRoute: () => void;
}

export const useMapRouteHandling = ({
  location,
  optimizeRoute,
  clearRoute
}: UseMapRouteHandlingProps) => {
  const { toast } = useToast();

  const handleOptimizeRoute = useCallback(() => {
    if (location) {
      optimizeRoute(location);
      toast({
        title: "Ruta optimizada",
        description: `Se ha calculado la ruta óptima`,
      });
    } else {
      toast({
        title: "No se pudo optimizar",
        description: "Se necesita tu ubicación para calcular la ruta óptima",
        variant: "destructive"
      });
    }
  }, [location, optimizeRoute, toast]);

  return {
    handleOptimizeRoute,
    clearRoute
  };
};
