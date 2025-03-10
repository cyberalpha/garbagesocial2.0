
import React, { memo } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { MapOptions } from '@/types';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Bibliotecas necesarias para Google Maps
const libraries = ['places', 'geometry'] as any;

interface GoogleMapWrapperProps {
  children: React.ReactNode;
  mapOptions: MapOptions;
  onMapLoad: (map: google.maps.Map) => void;
}

// Opciones fijas para el mapa de Google
const defaultMapOptions = {
  fullscreenControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  zoomControl: false,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

const GoogleMapWrapper = ({ children, mapOptions, onMapLoad }: GoogleMapWrapperProps) => {
  // Usar la API key proporcionada
  const GOOGLE_MAPS_API_KEY = "AIzaSyDw-oZruoaJzPckh5ZE2wpJBblpWSuYdUQ";

  console.log("Using Google Maps API Key:", GOOGLE_MAPS_API_KEY ? "Key is present" : "No key found");

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
    language: "es",
    region: "AR"
  });

  console.log("GoogleMapWrapper:", isLoaded ? "API loaded" : "Loading API", loadError ? `Error: ${loadError.message}` : "No errors");

  if (loadError) {
    return <ErrorState message={`Error al cargar Google Maps: ${loadError.message || "Comprueba que has configurado la API Key correctamente"}`} />;
  }

  if (!isLoaded) {
    return <LoadingState message="Cargando mapa..." />;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{
        lat: mapOptions.center[1],
        lng: mapOptions.center[0]
      }}
      zoom={mapOptions.zoom}
      onLoad={onMapLoad}
      options={defaultMapOptions}
    >
      {children}
    </GoogleMap>
  );
};

// Uso de memo para evitar renderizados innecesarios
export default memo(GoogleMapWrapper);
