
import React from 'react';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';
import { Database, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ConnectionIndicator = () => {
  const { isOfflineMode, toggleOfflineMode, status } = useSupabaseConnection();

  const handleClick = () => {
    toggleOfflineMode();
  };

  return (
    <Button 
      onClick={handleClick}
      variant={isOfflineMode ? "destructive" : "success"}
      size="sm"
      className={cn(
        "flex items-center gap-1 text-xs px-2 py-1",
        isOfflineMode 
          ? "bg-red-500 hover:bg-red-600 text-white" 
          : "bg-green-500 hover:bg-green-600 text-white"
      )}
    >
      {isOfflineMode ? (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Local</span>
        </>
      ) : (
        <>
          <Database className="h-3 w-3" />
          <span>Conectado</span>
        </>
      )}
    </Button>
  );
};

export default ConnectionIndicator;
