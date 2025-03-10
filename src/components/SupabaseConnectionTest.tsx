
import React from 'react';
import { Button } from "@/components/ui/button";
import { SUPABASE_CONFIG } from '@/integrations/supabase/client';
import { useSupabaseConnectionTest } from '@/hooks/useSupabaseConnectionTest';
import ConnectionStatusDisplay from './supabase-connection/ConnectionStatusDisplay';
import StatusIcon from './supabase-connection/StatusIcon';
import OfflineModeToggle from './OfflineModeToggle';

const SupabaseConnectionTest = () => {
  const { 
    isConnected, 
    isLoading, 
    errorMessage, 
    testConnection 
  } = useSupabaseConnectionTest();

  return (
    <div className="w-full max-w-xl mx-auto bg-white shadow-md rounded-lg p-6 my-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">Conexión a Supabase</h3>
        <p className="text-sm text-gray-600 mb-4">
          URL: {SUPABASE_CONFIG.url}
        </p>
        
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
            <OfflineModeToggle />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Estado:</span>
              <StatusIcon isConnected={isConnected} isLoading={isLoading} />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testConnection} 
              disabled={isLoading}
            >
              {isLoading ? 'Verificando...' : 'Probar conexión'}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <ConnectionStatusDisplay 
          isConnected={isConnected} 
          isLoading={isLoading} 
          errorMessage={errorMessage} 
        />
      </div>
    </div>
  );
};

export default SupabaseConnectionTest;
