
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

interface GoogleMapWrapperProps {
  children: React.ReactNode;
  mapOptions: MapOptions;
  onMapLoad: (map: google.maps.Map) => void;
}

const GoogleMapWrapper = ({ children, mapOptions, onMapLoad }: GoogleMapWrapperProps) => {
  // Usamos la clave API encontrada en el repositorio anterior
  const GOOGLE_MAPS_API_KEY = "AIzaSyDoOHTnpE8apO6OzsrAnbv-JMx3_K1xfNY";

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
    return <ErrorMessage message={`Error al cargar Google Maps: ${loadError.message || "Comprueba que has configurado la API Key correctamente"}`} />;
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
