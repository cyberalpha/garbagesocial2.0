
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

    navigator.geolocation.getCurrentPosition(
      (position) => {
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
