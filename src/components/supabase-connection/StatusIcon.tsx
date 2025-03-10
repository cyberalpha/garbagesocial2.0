
import React from 'react';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ConnectionStatus } from '@/hooks/useSupabaseConnection';

export interface StatusIconProps {
  isConnected?: boolean | null;
  isLoading?: boolean;
  status?: ConnectionStatus;
}

const StatusIcon = ({ isConnected, isLoading, status }: StatusIconProps) => {
  // Si se proporciona status, usarlo para determinar el icono
  if (status) {
    switch (status) {
      case 'connecting':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  }

  // Comportamiento anterior para compatibilidad
  if (isLoading) {
    return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
  }

  if (isConnected === null) {
    return <div className="h-4 w-4 rounded-full bg-gray-300"></div>;
  }

  if (isConnected) {
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  }

  return <XCircle className="h-4 w-4 text-red-500" />;
};

export default StatusIcon;
