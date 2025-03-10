
import { ConnectionStatus } from '@/hooks/useSupabaseConnection';

export const getStatusColor = (status: ConnectionStatus): string => {
  switch (status) {
    case 'connected':
      return 'bg-green-100 text-green-600 hover:bg-green-200';
    case 'disconnected':
      return 'bg-red-100 text-red-600 hover:bg-red-200';
    case 'connecting':
      return 'bg-blue-100 text-blue-600 hover:bg-blue-200';
    case 'offline':
      return 'bg-orange-100 text-orange-600 hover:bg-orange-200';
    default:
      return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  }
};

export const getStatusMessage = (status: ConnectionStatus): string => {
  switch (status) {
    case 'connected':
      return 'Conectado a Supabase';
    case 'disconnected':
      return 'Sin conexión a Supabase';
    case 'connecting':
      return 'Verificando conexión...';
    case 'offline':
      return 'Modo offline activado';
    default:
      return 'Estado de conexión desconocido';
  }
};
