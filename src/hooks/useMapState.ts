
import { useState, useCallback } from 'react';
import { Waste } from '@/types';
import { useToast } from '@/components/ui/use-toast';

export const useMapState = () => {
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [selectedWaste, setSelectedWaste] = useState<Waste | null>(null);
  const [showInfoWindow, setShowInfoWindow] = useState<boolean>(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [isRoutingMode, setIsRoutingMode] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { toast } = useToast();

  const handleMarkerClick = useCallback((waste: Waste, selectWaste?: (waste: Waste) => void) => {
    if (isRoutingMode && selectWaste) {
      selectWaste(waste);
      toast({
        title: "Punto agregado a la ruta",
        description: `${waste.type} - ${waste.description}`,
      });
    } else {
      setSelectedWaste(waste);
      setShowInfoWindow(true);
    }
  }, [isRoutingMode, toast]);

  const toggleRoutingMode = useCallback(() => {
    setIsRoutingMode(!isRoutingMode);
    setSelectedWaste(null);
    setShowInfoWindow(false);
  }, [isRoutingMode]);

  return {
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
  };
};
