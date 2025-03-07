import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DataSyncStatusProps {
  className?: string;
}

const DataSyncStatus = ({ className }: DataSyncStatusProps) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSynced, setIsSynced] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { toast } = useToast();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check Supabase connection on mount and when online status changes
  useEffect(() => {
    if (isOnline) {
      checkSupabaseConnection();
    } else {
      setIsSynced(false);
    }
  }, [isOnline]);

  const checkSupabaseConnection = async () => {
    try {
      const { error } = await supabase.from('wastes').select('id').limit(1);
      setIsSynced(!error);
      if (!error) {
        setLastSyncTime(new Date());
      }
    } catch (error) {
      setIsSynced(false);
      console.error("Error checking Supabase connection:", error);
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      toast({
        title: "Sin conexión",
        description: "No es posible sincronizar sin conexión a internet",
        variant: "destructive"
      });
      return;
    }

    setIsSyncing(true);
    try {
      // Aquí iría la lógica de sincronización real
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulación
      await checkSupabaseConnection();
      
      toast({
        title: "Sincronización completada",
        description: "Datos sincronizados correctamente",
      });
    } catch (error) {
      console.error("Error during sync:", error);
      toast({
        title: "Error de sincronización",
        description: "No se pudieron sincronizar los datos",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusVariant = () => {
    if (isOnline && isSynced) return "secondary";
    if (isOnline && !isSynced) return "destructive";
    if (!isOnline) return "outline"; // Changed from "warning" to "outline"
    return "secondary";
  };

  const getStatusText = () => {
    if (isOnline && isSynced) return "Conectado";
    if (isOnline && !isSynced) return "Sin sincronizar";
    if (!isOnline) return "Sin conexión";
    return "Desconocido";
  };

  const getStatusIcon = () => {
    if (isOnline) {
      return isSynced ? <Check className="h-3 w-3 mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />;
    }
    return <WifiOff className="h-3 w-3 mr-1" />;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={getStatusVariant()} className="flex items-center">
        {getStatusIcon()}
        {getStatusText()}
      </Badge>
      
      {isOnline && !isSynced && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2" 
          onClick={handleSync}
          disabled={isSyncing}
        >
          <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="ml-1">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
        </Button>
      )}
      
      {lastSyncTime && (
        <span className="text-xs text-muted-foreground">
          Última sincronización: {lastSyncTime.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default DataSyncStatus;
