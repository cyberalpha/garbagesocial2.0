
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
        error: 'Geolocalización no soportada por su navegador',
        loading: false
      }));
      return;
    }

    // Add timeout for geolocation request
    const timeoutId = setTimeout(() => {
      setState(prev => {
        if (prev.loading) {
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
    }, 10000); // 10 second timeout

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        setState({
          location: {
            type: 'Point',
            coordinates: [position.coords.longitude, position.coords.latitude]
          },
          error: null,
          loading: false
        });
      },
      (error) => {
        clearTimeout(timeoutId);
        console.error('Geolocation error:', error);
        setState(prev => ({
          ...prev,
          error: `Error de geolocalización: ${error.message}`,
          loading: false,
          // Provide default location on error
          location: {
            type: 'Point',
            coordinates: [-58.3816, -34.6037] // Default to Buenos Aires
          }
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0
      }
    );

    return () => clearTimeout(timeoutId);
  }, []);

  return state;
};

export default useGeolocation;
