
import { useState, useEffect, useCallback } from 'react';
import { dataSynchronizer } from '@/services/sync/DataSynchronizer';
import { Waste } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { isOnline, offlineMode } from '@/integrations/supabase/client';

// Definir la clave de almacenamiento para residuos
const WASTES_STORAGE_KEY = 'wastes';

export const useDataSynchronizer = () => {
  const { currentUser } = useAuth();
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Cargar residuos
  const loadWastes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let items: Waste[] = [];
      
      // Modo offline: usar localStorage
      if (offlineMode()) {
        const storedItems = localStorage.getItem(WASTES_STORAGE_KEY);
        items = storedItems ? JSON.parse(storedItems) : [];
      } else {
        // Modo online: intentar cargar desde Supabase
        try {
          // Llamada a API o Supabase aquí
          console.log('Cargando residuos desde Supabase (no implementado)');
          const storedItems = localStorage.getItem(WASTES_STORAGE_KEY);
          items = storedItems ? JSON.parse(storedItems) : [];
        } catch (err) {
          console.error('Error cargando datos de Supabase, usando datos locales:', err);
          const storedItems = localStorage.getItem(WASTES_STORAGE_KEY);
          items = storedItems ? JSON.parse(storedItems) : [];
        }
      }

      // Filtrar por usuario si es necesario
      setWastes(items);
    } catch (err) {
      console.error('Error cargando residuos:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido cargando residuos'));
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Guardar residuo
  const saveWaste = useCallback(async (waste: Waste): Promise<Waste> => {
    try {
      // Si no tiene ID, asignar uno
      const wasteToSave: Waste = {
        ...waste,
        id: waste.id || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Cargar residuos actuales
      const currentItems = localStorage.getItem(WASTES_STORAGE_KEY);
      const items: Waste[] = currentItems ? JSON.parse(currentItems) : [];
      
      // Verificar si existe
      const existingIndex = items.findIndex(item => item.id === wasteToSave.id);
      
      if (existingIndex >= 0) {
        // Actualizar existente
        items[existingIndex] = wasteToSave;
      } else {
        // Agregar nuevo
        items.push(wasteToSave);
      }
      
      // Guardar en localStorage
      localStorage.setItem(WASTES_STORAGE_KEY, JSON.stringify(items));
      
      // Modo online: guardar en Supabase
      if (!offlineMode()) {
        try {
          // Llamada a API o Supabase aquí
          console.log('Guardando residuo en Supabase (no implementado):', wasteToSave);
        } catch (err) {
          console.error('Error guardando en Supabase:', err);
          // No bloquear la operación, solo registrar el error
        }
      }
      
      // Recargar para actualizar la lista
      await loadWastes();
      
      return wasteToSave;
    } catch (err) {
      console.error('Error guardando residuo:', err);
      throw err instanceof Error ? err : new Error('Error desconocido guardando residuo');
    }
  }, [loadWastes]);

  // Eliminar residuo
  const deleteWaste = useCallback(async (wasteId: string): Promise<void> => {
    try {
      // Cargar residuos actuales
      const currentItems = localStorage.getItem(WASTES_STORAGE_KEY);
      const items: Waste[] = currentItems ? JSON.parse(currentItems) : [];
      
      // Filtrar para eliminar
      const updatedItems = items.filter(item => item.id !== wasteId);
      
      // Guardar en localStorage
      localStorage.setItem(WASTES_STORAGE_KEY, JSON.stringify(updatedItems));
      
      // Modo online: eliminar en Supabase
      if (!offlineMode()) {
        try {
          // Llamada a API o Supabase aquí
          console.log('Eliminando residuo en Supabase (no implementado):', wasteId);
        } catch (err) {
          console.error('Error eliminando en Supabase:', err);
          // No bloquear la operación, solo registrar el error
        }
      }
      
      // Recargar para actualizar la lista
      await loadWastes();
    } catch (err) {
      console.error('Error eliminando residuo:', err);
      throw err instanceof Error ? err : new Error('Error desconocido eliminando residuo');
    }
  }, [loadWastes]);

  // Inicializar al cargar
  useEffect(() => {
    loadWastes();
  }, [loadWastes]);

  return {
    wastes,
    isLoading,
    error,
    loadWastes,
    saveWaste,
    deleteWaste
  };
};
