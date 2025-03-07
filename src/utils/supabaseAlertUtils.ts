
import { ConnectionStatus } from '@/hooks/useSupabaseConnection';
import { cn } from '@/lib/utils';

/**
 * Determina el color del estado de conexión de Supabase
 */
export const getStatusColor = (status: ConnectionStatus): string => {
  switch (status) {
    case 'connected':
      return "bg-green-500/80 hover:bg-green-500";
    case 'disconnected':
      return "bg-destructive/80 hover:bg-destructive animate-pulse";
    case 'connecting':
      return "bg-amber-500/80 hover:bg-amber-500";
    default:
      return "bg-slate-500/80 hover:bg-slate-500";
  }
};
