
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface UseInternetConnectionResult {
  isOnline: boolean;
  wasOffline: boolean;
}

/**
 * Hook personalizado para verificar el estado de la conexión a internet
 * @returns Un objeto con el estado actual de la conexión y si estuvo offline recientemente
 */
export const useInternetConnection = (): UseInternetConnectionResult => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Manejadores para los eventos online y offline
    const handleOnline = () => {
      console.log('La conexión a internet está disponible');
      setIsOnline(true);
      
      // Si estuvo offline, mostrar notificación de reconexión
      if (wasOffline) {
        toast({
          title: "Conexión restablecida",
          description: "Tu conexión a internet se ha recuperado.",
          variant: "default"
        });
      }
    };

    const handleOffline = () => {
      console.log('La conexión a internet se ha perdido');
      setIsOnline(false);
      setWasOffline(true);
      
      toast({
        title: "Sin conexión",
        description: "Tu dispositivo no está conectado a internet. Algunas funciones pueden no estar disponibles.",
        variant: "destructive"
      });
    };

    // Agregar event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Limpiar event listeners al desmontar
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline, toast]);

  return { isOnline, wasOffline };
};
