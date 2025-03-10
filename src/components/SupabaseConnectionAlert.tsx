
import React from 'react';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import StatusIcon from './supabase-connection/StatusIcon';
import StatusTooltipContent from './supabase-connection/StatusTooltipContent';
import { getStatusColor } from '@/utils/supabaseAlertUtils';

interface SupabaseConnectionAlertProps {
  className?: string;
}

/**
 * Componente que muestra un indicador del estado de conexión con Supabase
 */
const SupabaseConnectionAlert = ({ className }: SupabaseConnectionAlertProps) => {
  const { status, error, lastChecked, checkConnection } = useSupabaseConnection();

  const handleManualCheck = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Verificación manual iniciada');
    checkConnection();
  };

  return (
    <div 
      className={cn(
        "fixed bottom-20 right-4 z-50 transition-all duration-300", // Cambiado de bottom-4 a bottom-20
        className
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "p-2 rounded-full shadow-md flex items-center justify-center transition-colors",
              getStatusColor(status),
              status === 'connecting' && "animate-pulse",
              status === 'disconnected' && "animate-bounce"
            )}
            onClick={handleManualCheck}
          >
            <StatusIcon status={status} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs p-4">
          <StatusTooltipContent 
            status={status}
            error={error}
            lastChecked={lastChecked}
            onManualCheck={handleManualCheck}
          />
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default SupabaseConnectionAlert;
