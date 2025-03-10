
import React from 'react';
import { useInternetConnection } from '@/hooks/useInternetConnection';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface InternetConnectionAlertProps {
  className?: string;
}

/**
 * Componente que muestra un indicador del estado de conexión a internet
 */
const InternetConnectionAlert = ({ className }: InternetConnectionAlertProps) => {
  const { isOnline } = useInternetConnection();

  return (
    <div 
      className={cn(
        "fixed bottom-4 right-52 z-50 transition-all duration-300",
        className
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "p-2 rounded-full shadow-md flex items-center justify-center transition-colors",
            isOnline 
              ? "bg-green-500/80 hover:bg-green-500" 
              : "bg-destructive/80 hover:bg-destructive animate-pulse"
          )}>
            {isOnline ? (
              <Wifi className="h-5 w-5 text-white" />
            ) : (
              <WifiOff className="h-5 w-5 text-white" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{isOnline ? "Conectado a internet" : "Sin conexión a internet"}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default InternetConnectionAlert;
