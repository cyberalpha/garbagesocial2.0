
import { ConnectionStatus } from '@/hooks/useSupabaseConnection';

/**
 * Obtiene el color de fondo para el estado de conexión
 */
export const getStatusColor = (status: ConnectionStatus): string => {
  switch (status) {
    case 'connected':
      return 'bg-green-100 hover:bg-green-200';
    case 'connecting':
      return 'bg-blue-100 hover:bg-blue-200';
    case 'disconnected':
      return 'bg-red-100 hover:bg-red-200';
    default:
      return 'bg-gray-100 hover:bg-gray-200';
  }
};
