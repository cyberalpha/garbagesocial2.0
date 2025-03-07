
import { useState } from 'react';
import { Waste, MapOptions } from '../types';
import useGeolocation from '../hooks/useGeolocation';
import useRouteOptimization from '../hooks/useRouteOptimization';
import MapContainer from './map/MapContainer';

interface MapProps {
  initialOptions?: Partial<MapOptions>;
  onMarkerClick?: (waste: Waste) => void;
  showRouteTools?: boolean;
}

const Map = ({ initialOptions, onMarkerClick, showRouteTools = false }: MapProps) => {
  const geolocation = useGeolocation();
  const routeOptimization = useRouteOptimization();
  
  return (
    <MapContainer
      initialOptions={initialOptions}
      onMarkerClick={onMarkerClick}
      showRouteTools={showRouteTools}
      useGeolocation={geolocation}
      useRouteOptimization={routeOptimization}
    />
  );
};

export default Map;
