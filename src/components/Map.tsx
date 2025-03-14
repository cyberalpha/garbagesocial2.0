
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
  
  console.log("Map rendering, geolocation:", geolocation.location ? 
    `disponible (${geolocation.location.coordinates[1]}, ${geolocation.location.coordinates[0]})` : 
    "no disponible");
  
  if (geolocation.error) {
    console.log("Error de geolocalización:", geolocation.error);
    return <ErrorState message={geolocation.error} />;
  }
  
  if (geolocation.loading) {
    console.log("Cargando geolocalización...");
    return <LoadingState message="Obteniendo ubicación..." />;
  }
  
  // Si tenemos la ubicación, asegurarnos de que el mapa se inicialice con ella
  const enhancedInitialOptions = geolocation.location ? {
    ...initialOptions,
    center: geolocation.location.coordinates
  } : initialOptions;
  
  console.log("Opciones iniciales del mapa:", enhancedInitialOptions);
  
  return (
    <MapContainer
      initialOptions={enhancedInitialOptions}
      onMarkerClick={onMarkerClick}
      showRouteTools={showRouteTools}
      useGeolocation={geolocation}
      useRouteOptimization={routeOptimization}
    />
  );
};

export default Map;
