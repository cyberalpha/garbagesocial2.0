
import React from 'react';
import { Waste, MapOptions } from '../types';
import useGeolocation from '../hooks/useGeolocation';
import useRouteOptimization from '../hooks/useRouteOptimization';
import MapContainer from './map/MapContainer';
import MapConfig from './map/MapConfig';
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
  
  return (
    <MapConfig>
      {({ isLoaded, loadError }) => {
        if (loadError) {
          return <ErrorMessage message={loadError.message || "Error desconocido al cargar el mapa"} />;
        }
        
        if (!isLoaded) {
          return <LoadingOverlay />;
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
      }}
    </MapConfig>
  );
};

export default Map;
