
import React from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { MapOptions } from '@/types';
import LoadingOverlay from './LoadingOverlay';
import ErrorMessage from './ErrorMessage';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Definimos las bibliotecas que necesitamos para Google Maps
const libraries = ['places', 'geometry'] as any;

// Usamos la variable de entorno o un valor por defecto (para desarrollo)
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBpySf9Hxcg-Awq6VK00R5RGmn3_D9-W9g";

interface GoogleMapWrapperProps {
  children: React.ReactNode;
  mapOptions: MapOptions;
  onMapLoad: (map: google.maps.Map) => void;
}

const GoogleMapWrapper = ({ children, mapOptions, onMapLoad }: GoogleMapWrapperProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
    language: "es",
    region: "AR"
  });

  console.log("GoogleMapWrapper:", isLoaded ? "API loaded" : "Loading API", loadError ? `Error: ${loadError.message}` : "No errors");

  if (loadError) {
    return <ErrorMessage message={loadError.message || "Error al cargar Google Maps"} />;
  }

  if (!isLoaded) {
    return <LoadingOverlay message="Cargando mapa..." />;
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
      options={{
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
      }}
    >
      {children}
    </GoogleMap>
  );
};

export default GoogleMapWrapper;
