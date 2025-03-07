
import { useState, useEffect, useCallback } from 'react';
import { useInternetConnection } from './useInternetConnection';
import { useSupabaseConnection } from './useSupabaseConnection';
import { useToast } from '@/components/ui/use-toast';
import { Waste } from '@/types';
import { WASTES_STORAGE_KEY } from '@/services/wastes/constants';
import { getFromStorage } from '@/services/localStorage';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

interface UseDataSynchronizerResult {
  isSynchronizing: boolean;
  lastSyncTime: Date | null;
  forceSynchronize: () => Promise<void>;
}

/**
 * Hook para sincronizar datos locales con Supabase cuando se restablece la conexión
 */
export const useDataSynchronizer = (): UseDataSynchronizerResult => {
  const [isSynchronizing, setIsSynchronizing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { isOnline, wasOffline } = useInternetConnection();
  const { status: supabaseStatus } = useSupabaseConnection();
  const { toast } = useToast();

  // Función para transformar waste al formato de Supabase
  const transformWasteForSupabase = (waste: Waste) => {
    return {
      id: waste.id,
      user_id: waste.userId,
      type: waste.type,
      description: waste.description,
      image_url: waste.imageUrl,
      location: waste.location as unknown as Json,
      publication_date: waste.publicationDate instanceof Date 
        ? waste.publicationDate.toISOString() 
        : waste.publicationDate,
      status: waste.status,
      pickup_commitment: waste.pickupCommitment as unknown as Json
    };
  };

  // Función para sincronizar datos de localStorage con Supabase
  const synchronizeData = useCallback(async () => {
    if (!isOnline || supabaseStatus !== 'connected' || isSynchronizing) {
      return;
    }

    setIsSynchronizing(true);
    console.log('Iniciando sincronización de datos...');

    try {
      // Obtener datos de localStorage
      const localWastes = getFromStorage<Waste[]>(WASTES_STORAGE_KEY, []);
      
      if (localWastes.length === 0) {
        console.log('No hay datos locales para sincronizar');
        setIsSynchronizing(false);
        return;
      }

      console.log(`Sincronizando ${localWastes.length} residuos desde localStorage a Supabase...`);
      
      // Convertir a formato de Supabase
      const supabaseData = localWastes.map(transformWasteForSupabase);
      
      // Upsert en bloques de 50 para evitar límites de tamaño de payload
      const chunkSize = 50;
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < supabaseData.length; i += chunkSize) {
        const chunk = supabaseData.slice(i, i + chunkSize);
        
        const { error } = await supabase
          .from('wastes')
          .upsert(chunk, { onConflict: 'id' });
        
        if (error) {
          console.error('Error al sincronizar chunk:', error);
          errorCount += chunk.length;
        } else {
          successCount += chunk.length;
        }
      }
      
      console.log(`Sincronización completada: ${successCount} exitosos, ${errorCount} con errores`);
      
      if (successCount > 0) {
        toast({
          title: 'Sincronización completada',
          description: `Se han sincronizado ${successCount} residuos con Supabase.`,
        });
      }
      
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Error durante la sincronización:', error);
      toast({
        title: 'Error de sincronización',
        description: 'No se pudieron sincronizar todos los datos con Supabase.',
        variant: 'destructive'
      });
    } finally {
      setIsSynchronizing(false);
    }
  }, [isOnline, supabaseStatus, isSynchronizing, toast]);

  // Sincronizar cuando la conexión se restablece
  useEffect(() => {
    if (isOnline && wasOffline && supabaseStatus === 'connected') {
      synchronizeData();
    }
  }, [isOnline, wasOffline, supabaseStatus, synchronizeData]);

  // Función para forzar sincronización manualmente
  const forceSynchronize = useCallback(async () => {
    if (!isOnline || supabaseStatus !== 'connected') {
      toast({
        title: 'Sincronización no disponible',
        description: 'No se puede sincronizar sin conexión a internet o a Supabase.',
        variant: 'destructive'
      });
      return;
    }
    
    await synchronizeData();
  }, [isOnline, supabaseStatus, synchronizeData, toast]);

  return {
    isSynchronizing,
    lastSyncTime,
    forceSynchronize
  };
};
