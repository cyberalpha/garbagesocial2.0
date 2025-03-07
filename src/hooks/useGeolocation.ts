
import { useState, useEffect } from 'react';
import { GeoLocation } from '../types';

interface GeolocationState {
  location: GeoLocation | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        location: null,
        error: 'Geolocalización no soportada por este navegador',
        loading: false
      });
      return;
    }

    const geoSuccess = (position: GeolocationPosition) => {
      setState({
        location: {
          type: 'Point',
          coordinates: [position.coords.longitude, position.coords.latitude]
        },
        error: null,
        loading: false
      });
    };

    const geoError = (error: GeolocationPositionError) => {
      let errorMessage = 'Error desconocido al obtener la geolocalización';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Usuario denegó la solicitud de geolocalización';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Información de localización no disponible';
          break;
        case error.TIMEOUT:
          errorMessage = 'Se agotó el tiempo para obtener la localización';
          break;
      }
      
      setState({
        location: null,
        error: errorMessage,
        loading: false
      });
    };

    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    });
  }, []);

  return state;
};
