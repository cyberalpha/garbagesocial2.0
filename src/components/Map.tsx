
import React from 'react';
import { Waste, MapOptions } from '../types';
import useGeolocation from '../hooks/useGeolocation';
import useRouteOptimization from '../hooks/useRouteOptimization';
import MapContainer from './map/MapContainer';
import LoadingOverlay from './map/LoadingOverlay';
import ErrorMessage from './map/ErrorMessage';

interface MapProps {
  initialOptions?: Partial<MapOptions>;
  onMarkerClick?: (waste: Waste) => void;
  showRouteTools?: boolean;
}

const Map = ({ initialOptions, onMarkerClick, showRouteTools = false }: MapProps) => {
  const geolocation = useGeolocation();
  const routeOptimization = useRouteOptimization();
  
  console.log("Map rendering, geolocation:", geolocation.location ? "available" : "unavailable");
  
  // Si hay error de geolocalización, mostramos el mensaje
  if (geolocation.error) {
    return <ErrorMessage message={geolocation.error} />;
  }
  
  // Si está cargando la geolocalización, mostramos el overlay de carga
  if (geolocation.loading) {
    return <LoadingOverlay message="Obteniendo ubicación..." />;
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
