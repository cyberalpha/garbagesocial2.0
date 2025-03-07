
import React from 'react';
import { Waste, MapOptions } from '../types';
import useGeolocation from '../hooks/useGeolocation';
import useRouteOptimization from '../hooks/useRouteOptimization';
import MapContainer from './map/MapContainer';
import LoadingState from './map/LoadingState';
import ErrorState from './map/ErrorState';

interface MapProps {
  initialOptions?: Partial<MapOptions>;
  onMarkerClick?: (waste: Waste) => void;
  showRouteTools?: boolean;
}

const Map = ({ initialOptions, onMarkerClick, showRouteTools = false }: MapProps) => {
  const geolocation = useGeolocation();
  const routeOptimization = useRouteOptimization();
  
  console.log("Map rendering, geolocation:", geolocation.location ? "available" : "unavailable");
  
  if (geolocation.error) {
    return <ErrorState message={geolocation.error} />;
  }
  
  if (geolocation.loading) {
    return <LoadingState message="Obteniendo ubicación..." />;
  }
  
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
