
import { useState } from 'react';
import { Waste } from '@/types';

export const useMapState = () => {
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [selectedWaste, setSelectedWaste] = useState<Waste | null>(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [isRoutingMode, setIsRoutingMode] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const handleMarkerClick = (waste: Waste, selectWaste?: (waste: Waste) => void) => {
    setSelectedWaste(waste);
    setShowInfoWindow(true);
    
    if (isRoutingMode && selectWaste) {
      selectWaste(waste);
    }
  };

  const toggleRoutingMode = () => {
    setIsRoutingMode(!isRoutingMode);
    if (selectedWaste) {
      setSelectedWaste(null);
    }
  };

  return {
    wastes,
    setWastes,
    selectedWaste,
    setSelectedWaste,
    showInfoWindow,
    setShowInfoWindow,
    isRoutingMode,
    setIsRoutingMode,
    mapLoaded,
    setMapLoaded,
    handleMarkerClick,
    toggleRoutingMode
  };
};
