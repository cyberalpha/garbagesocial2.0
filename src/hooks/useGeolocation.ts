
import { useState, useEffect } from 'react';
import { GeoLocation } from '@/types';
import { saveToStorage, getFromStorage } from '@/services/localStorage';

const GEOLOCATION_STORAGE_KEY = 'user_geolocation';

interface GeolocationState {
  location: GeoLocation | null;
  error: string | null;
  loading: boolean;
}

const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: getFromStorage<GeoLocation | null>(GEOLOCATION_STORAGE_KEY, null),
    error: null,
    loading: !getFromStorage<GeoLocation | null>(GEOLOCATION_STORAGE_KEY, null)
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      const defaultLocation: GeoLocation = {
        type: 'Point',
        coordinates: [-58.3816, -34.6037] // Buenos Aires por defecto
      };
      
      // Guardar en localStorage
      saveToStorage(GEOLOCATION_STORAGE_KEY, defaultLocation);
      
      setState({
        error: 'La geolocalización no está soportada por tu navegador',
        loading: false,
        location: defaultLocation
      });
      return;
    }

    console.log("Iniciando solicitud de geolocalización...");
    
    // Agregar timeout para la solicitud de geolocalización - aumentado a 15 segundos
    const timeoutId = setTimeout(() => {
      setState(prev => {
        if (prev.loading) {
          console.log("Geolocation request timed out, using default location");
          const defaultLocation: GeoLocation = {
            type: 'Point',
            coordinates: [-58.3816, -34.6037] // Default to Buenos Aires
          };
          
          // Guardar en localStorage
          saveToStorage(GEOLOCATION_STORAGE_KEY, defaultLocation);
          
          return {
            ...prev,
            error: 'La solicitud de ubicación ha tardado demasiado. Usando ubicación predeterminada.',
            loading: false,
            location: defaultLocation
          };
        }
        return prev;
      });
    }, 15000); // 15 segundos de timeout (aumentado de 8s para dar más tiempo)

    const geoSuccess = (position: GeolocationPosition) => {
      clearTimeout(timeoutId);
      console.log("Geolocation obtained successfully:", position.coords.latitude, position.coords.longitude);
      
      const newLocation: GeoLocation = {
        type: 'Point',
        coordinates: [position.coords.longitude, position.coords.latitude]
      };
      
      // Guardar en localStorage
      saveToStorage(GEOLOCATION_STORAGE_KEY, newLocation);
      
      setState({
        location: newLocation,
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
          errorMessage = 'La solicitud para obtener la ubicación expiró. Puedes continuar usando una ubicación predeterminada.';
          break;
      }
      
      console.log("Usando ubicación predeterminada debido a error:", errorMessage);
      
      const defaultLocation: GeoLocation = {
        type: 'Point',
        coordinates: [-58.3816, -34.6037] // Buenos Aires por defecto
      };
      
      // Guardar en localStorage incluso en caso de error
      saveToStorage(GEOLOCATION_STORAGE_KEY, defaultLocation);
      
      setState({
        error: errorMessage,
        loading: false,
        // Proveer ubicación por defecto incluso en caso de error
        location: defaultLocation
      });
    };

    // Si ya tenemos una ubicación en localStorage, no necesitamos iniciar
    // una solicitud de geolocalización inmediatamente
    if (state.location) {
      setState(prev => ({ ...prev, loading: false }));
    } else {
      navigator.geolocation.getCurrentPosition(
        geoSuccess,
        geoError,
        {
          enableHighAccuracy: true,
          timeout: 12000, // Aumentado a 12 segundos
          maximumAge: 0
        }
      );
    }

    return () => clearTimeout(timeoutId);
  }, []);

  return state;
};

export default useGeolocation;
