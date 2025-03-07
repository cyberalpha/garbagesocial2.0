
import React from 'react';
import { Database, CloudOff, RefreshCw } from 'lucide-react';
import { ConnectionStatus } from '@/hooks/useSupabaseConnection';

interface StatusIconProps {
  status: ConnectionStatus;
}

const StatusIcon = ({ status }: StatusIconProps) => {
  switch (status) {
    case 'connected':
      return <Database className="h-5 w-5 text-white" />;
    case 'disconnected':
      return <CloudOff className="h-5 w-5 text-white" />;
    case 'connecting':
      return <RefreshCw className="h-5 w-5 text-white animate-spin" />;
    default:
      return <CloudOff className="h-5 w-5 text-white" />;
  }
};

export default StatusIcon;
