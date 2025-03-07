
import { useState, useCallback } from 'react';
import { Waste } from '@/types';
import { useToast } from '@/components/ui/use-toast';

// Hook to manage waste selection state
const useWasteSelection = () => {
  const [selectedWaste, setSelectedWaste] = useState<Waste | null>(null);
  const [showInfoWindow, setShowInfoWindow] = useState<boolean>(false);
  
  const resetSelection = useCallback(() => {
    setSelectedWaste(null);
    setShowInfoWindow(false);
  }, []);
  
  return {
    selectedWaste,
    setSelectedWaste,
    showInfoWindow,
    setShowInfoWindow,
    resetSelection
  };
};

// Hook to manage map state
const useMapStatus = () => {
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [wastes, setWastes] = useState<Waste[]>([]);
  
  return {
    mapInitialized,
    setMapInitialized,
    mapLoaded,
    setMapLoaded,
    wastes,
    setWastes
  };
};

// Hook to manage routing mode
const useRoutingMode = () => {
  const [isRoutingMode, setIsRoutingMode] = useState(false);
  
  const toggleRoutingMode = useCallback(() => {
    setIsRoutingMode(prev => !prev);
  }, []);
  
  return {
    isRoutingMode,
    toggleRoutingMode
  };
};

// Main hook that composes the smaller hooks
export const useMapState = () => {
  const { toast } = useToast();
  const { 
    selectedWaste, 
    setSelectedWaste, 
    showInfoWindow, 
    setShowInfoWindow,
    resetSelection
  } = useWasteSelection();
  
  const {
    mapInitialized,
    setMapInitialized,
    mapLoaded,
    setMapLoaded,
    wastes,
    setWastes
  } = useMapStatus();
  
  const { isRoutingMode, toggleRoutingMode } = useRoutingMode();

  // Handler for marker click events
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
  }, [isRoutingMode, setSelectedWaste, setShowInfoWindow, toast]);

  // Combined hook that exposes all necessary state and functions
  return {
    // Waste selection
    selectedWaste,
    setSelectedWaste,
    showInfoWindow,
    setShowInfoWindow,
    
    // Map status
    mapInitialized,
    setMapInitialized,
    mapLoaded,
    setMapLoaded,
    wastes,
    setWastes,
    
    // Routing mode
    isRoutingMode,
    toggleRoutingMode,
    
    // Actions
    handleMarkerClick
  };
};
