
import React from 'react';
import { Loader2, AlertCircle, CheckCircle, WifiOff } from 'lucide-react';
import { ConnectionStatus } from '@/hooks/useSupabaseConnection';

interface StatusIconProps {
  status: ConnectionStatus;
}

const StatusIcon = ({ status }: StatusIconProps) => {
  switch (status) {
    case 'offline':
      return <WifiOff className="h-5 w-5 text-orange-500" />;
    case 'connected':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'disconnected':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'connecting':
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-400" />;
  }
};

export default StatusIcon;
