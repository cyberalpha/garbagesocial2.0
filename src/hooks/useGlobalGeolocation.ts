
import { create } from 'zustand';
import { GeoLocation } from '@/types';
import { saveToStorage, getFromStorage } from '@/services/localStorage';

const GEOLOCATION_STORAGE_KEY = 'user_geolocation';

type GeolocationStatus = 'available' | 'unavailable' | 'denied' | 'loading' | 'error';

interface GeolocationState {
  location: GeoLocation | null;
  status: GeolocationStatus;
  error: string | null;
  isLoading: boolean;
  updateLocation: (location: GeoLocation) => void;
  setStatus: (status: GeolocationStatus) => void;
  setError: (error: string | null) => void;
  startLoading: () => void;
  stopLoading: () => void;
  requestGeolocation: () => Promise<void>;
}

export const useGlobalGeolocation = create<GeolocationState>((set, get) => ({
  location: getFromStorage<GeoLocation | null>(GEOLOCATION_STORAGE_KEY, null),
  status: getFromStorage<GeoLocation | null>(GEOLOCATION_STORAGE_KEY, null) ? 'available' : 'loading',
  error: null,
  isLoading: !getFromStorage<GeoLocation | null>(GEOLOCATION_STORAGE_KEY, null),
  
  updateLocation: (location: GeoLocation) => {
    saveToStorage(GEOLOCATION_STORAGE_KEY, location);
    set({ location, status: 'available', error: null, isLoading: false });
  },
  
  setStatus: (status: GeolocationStatus) => set({ status }),
  setError: (error: string | null) => set({ error, status: error ? 'error' : get().status }),
  startLoading: () => set({ isLoading: true }),
  stopLoading: () => set({ isLoading: false }),
  
  requestGeolocation: async () => {
    const { updateLocation, setStatus, setError, startLoading, stopLoading } = get();
    
    if (!navigator.geolocation) {
      const defaultLocation: GeoLocation = {
        type: 'Point',
        coordinates: [-58.3816, -34.6037] // Buenos Aires por defecto
      };
      
      updateLocation(defaultLocation);
      setStatus('unavailable');
      setError('La geolocalización no está soportada por tu navegador');
      return;
    }
    
    startLoading();
    setStatus('loading');
    
    return new Promise<void>((resolve) => {
      // Timeout para la solicitud
      const timeoutId = setTimeout(() => {
        if (get().isLoading) {
          console.log("Geolocation request timed out, using default location");
          const defaultLocation: GeoLocation = {
            type: 'Point',
            coordinates: [-58.3816, -34.6037] // Default to Buenos Aires
          };
          
          updateLocation(defaultLocation);
          setStatus('error');
          setError('La solicitud de ubicación ha tardado demasiado. Usando ubicación predeterminada.');
          stopLoading();
          resolve();
        }
      }, 15000);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          console.log("Geolocation obtained successfully:", position.coords.latitude, position.coords.longitude);
          
          const newLocation: GeoLocation = {
            type: 'Point',
            coordinates: [position.coords.longitude, position.coords.latitude]
          };
          
          updateLocation(newLocation);
          stopLoading();
          resolve();
        },
        (error) => {
          clearTimeout(timeoutId);
          console.error('Geolocation error:', error);
          
          // Mensajes de error más descriptivos según el código de error
          let errorMessage = 'Error al obtener tu ubicación';
          let statusType: GeolocationStatus = 'error';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permiso para geolocalización denegado. Por favor, permita el acceso a su ubicación.';
              statusType = 'denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'La información de ubicación no está disponible.';
              statusType = 'unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'La solicitud para obtener la ubicación expiró. Puedes continuar usando una ubicación predeterminada.';
              statusType = 'error';
              break;
          }
          
          const defaultLocation: GeoLocation = {
            type: 'Point',
            coordinates: [-58.3816, -34.6037] // Buenos Aires por defecto
          };
          
          updateLocation(defaultLocation);
          setStatus(statusType);
          setError(errorMessage);
          stopLoading();
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0
        }
      );
    });
  }
}));

// Inicializar la geolocalización inmediatamente al importar este hook
if (!getFromStorage<GeoLocation | null>(GEOLOCATION_STORAGE_KEY, null)) {
  useGlobalGeolocation.getState().requestGeolocation();
}
