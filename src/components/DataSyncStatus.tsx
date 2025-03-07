
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RefreshCw, Check, CloudOff } from "lucide-react";
import { useDataSynchronizer } from '@/hooks/useDataSynchronizer';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente para mostrar el estado de sincronización de datos
 * y permitir la sincronización manual
 */
const DataSyncStatus = () => {
  const { isSynchronizing, lastSyncTime, forceSynchronize } = useDataSynchronizer();
  const { status: supabaseStatus } = useSupabaseConnection();
  const [showDetails, setShowDetails] = useState(false);

  const getStatusText = () => {
    if (supabaseStatus !== 'connected') {
      return 'Sin conexión';
    }
    if (isSynchronizing) {
      return 'Sincronizando...';
    }
    if (lastSyncTime) {
      return `Última sincronización: ${formatDistanceToNow(lastSyncTime, { addSuffix: true, locale: es })}`;
    }
    return 'No sincronizado';
  };

  const getStatusIcon = () => {
    if (supabaseStatus !== 'connected') {
      return <CloudOff className="h-4 w-4" />;
    }
    if (isSynchronizing) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    if (lastSyncTime) {
      return <Check className="h-4 w-4" />;
    }
    return <RefreshCw className="h-4 w-4" />;
  };

  const getStatusColor = () => {
    if (supabaseStatus !== 'connected') {
      return 'destructive';
    }
    if (isSynchronizing) {
      return 'warning';
    }
    if (lastSyncTime) {
      return 'success';
    }
    return 'secondary';
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusColor()}>
              <span className="flex items-center">
                {getStatusIcon()}
                <span className="ml-1">
                  {supabaseStatus === 'connected' ? 'Supabase' : 'Offline'}
                </span>
              </span>
            </Badge>
            <span className="text-sm text-muted-foreground">{getStatusText()}</span>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => forceSynchronize()}
                disabled={isSynchronizing || supabaseStatus !== 'connected'}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Sincronizar ahora</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sincronizar datos ahora</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSyncStatus;
