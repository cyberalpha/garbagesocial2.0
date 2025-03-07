
import { useState, useEffect } from 'react';
import { GeoLocation } from '@/types';

interface GeolocationState {
  location: GeoLocation | null;
  error: string | null;
  loading: boolean;
}

const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'La geolocalización no está soportada por tu navegador',
        loading: false,
        // Proveer ubicación por defecto
        location: {
          type: 'Point',
          coordinates: [-58.3816, -34.6037] // Buenos Aires por defecto
        }
      }));
      return;
    }

    // Agregar timeout para la solicitud de geolocalización
    const timeoutId = setTimeout(() => {
      setState(prev => {
        if (prev.loading) {
          console.log("Geolocation request timed out, using default location");
          return {
            ...prev,
            error: 'La solicitud de ubicación ha tardado demasiado. Usando ubicación predeterminada.',
            loading: false,
            location: {
              type: 'Point',
              coordinates: [-58.3816, -34.6037] // Default to Buenos Aires
            }
          };
        }
        return prev;
      });
    }, 8000); // 8 segundos de timeout (reducido de 10s para una respuesta más rápida)

    const geoSuccess = (position: GeolocationPosition) => {
      clearTimeout(timeoutId);
      console.log("Geolocation obtained successfully:", position.coords.latitude, position.coords.longitude);
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
      clearTimeout(timeoutId);
      console.error('Geolocation error:', error);
      
      // Mensajes de error más descriptivos según el código de error
      let errorMessage = 'Error al obtener tu ubicación';
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Permiso para geolocalización denegado. Por favor, permita el acceso a su ubicación.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'La información de ubicación no está disponible.';
          break;
        case error.TIMEOUT:
          errorMessage = 'La solicitud para obtener la ubicación expiró.';
          break;
      }
      
      setState({
        error: errorMessage,
        loading: false,
        // Proveer ubicación por defecto
        location: {
          type: 'Point',
          coordinates: [-58.3816, -34.6037] // Buenos Aires por defecto
        }
      });
    };

    navigator.geolocation.getCurrentPosition(
      geoSuccess,
      geoError,
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 0
      }
    );

    return () => clearTimeout(timeoutId);
  }, []);

  return state;
};

export default useGeolocation;
