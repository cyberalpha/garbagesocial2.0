
import { useState, useEffect } from 'react';

interface GeolocationState {
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  error: string | null;
  loading: boolean;
}

const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          },
          error: null,
          loading: false
        });
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error: error.message,
          loading: false
        }));
      }
    );
  }, []);

  return state;
};

export default useGeolocation;
