
import React from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = "AIzaSyBpySf9Hxcg-Awq6VK00R5RGmn3_D9-W9g";
const libraries = ['places', 'geometry'] as any;

interface MapConfigProps {
  children: (props: {
    isLoaded: boolean;
    loadError: Error | undefined;
  }) => React.ReactNode;
  language?: string;
  region?: string;
}

const MapConfig = ({ 
  children, 
  language = "es", 
  region = "AR" 
}: MapConfigProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
    language,
    region
  });

  return <>{children({ isLoaded, loadError })}</>;
};

export default MapConfig;
