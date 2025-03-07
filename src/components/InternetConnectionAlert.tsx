
import React from 'react';
import { useInternetConnection } from '@/hooks/useInternetConnection';
import { AlertCircle, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InternetConnectionAlertProps {
  className?: string;
}

/**
 * Componente que muestra una alerta cuando no hay conexión a internet
 */
const InternetConnectionAlert = ({ className }: InternetConnectionAlertProps) => {
  const { isOnline } = useInternetConnection();

  if (isOnline) {
    return null;
  }

  return (
    <div 
      className={cn(
        "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 bg-destructive text-destructive-foreground px-4 py-3 rounded-md shadow-lg flex items-center gap-2",
        className
      )}
    >
      <WifiOff className="h-5 w-5" />
      <span>Sin conexión a internet</span>
    </div>
  );
};

export default InternetConnectionAlert;
