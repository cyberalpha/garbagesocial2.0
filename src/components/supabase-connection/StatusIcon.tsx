
import React from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export interface StatusIconProps {
  isConnected: boolean | null;
  isLoading: boolean;
}

const StatusIcon = ({ isConnected, isLoading }: StatusIconProps) => {
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
