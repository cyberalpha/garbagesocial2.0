
import { ConnectionStatus } from '@/hooks/useSupabaseConnection';

/**
 * Obtiene el color de fondo para el estado de conexión
 */
export const getStatusColor = (status: ConnectionStatus): string => {
  switch (status) {
    case 'connected':
      return 'bg-green-500 hover:bg-green-600';
    case 'connecting':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'disconnected':
      return 'bg-red-500 hover:bg-red-600';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
};
