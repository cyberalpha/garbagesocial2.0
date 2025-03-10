
import React from 'react';
import { Loader2, CheckCircle, XCircle, WifiOff } from 'lucide-react';

interface ConnectionStatusDisplayProps {
  isConnected: boolean | null;
  isLoading: boolean;
  errorMessage: string | null;
  isOfflineMode?: boolean;
}

const ConnectionStatusDisplay = ({ isConnected, isLoading, errorMessage, isOfflineMode = false }: ConnectionStatusDisplayProps) => {
  if (isOfflineMode) {
    return (
      <div className="flex flex-col items-center gap-2 text-orange-600">
        <WifiOff className="h-12 w-12" />
        <p className="text-lg font-medium">Modo offline activado</p>
        <p className="text-sm text-center mt-2 max-w-xs">
          La aplicación está funcionando en modo offline. Los datos se almacenan localmente.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p>Verificando conexión...</p>
      </div>
    );
  }

  if (isConnected === null) {
    return <p>Esperando verificación...</p>;
  }

  if (isConnected) {
    return (
      <div className="flex flex-col items-center gap-2 text-green-600">
        <CheckCircle className="h-12 w-12" />
        <p className="text-lg font-medium">Conectado a Supabase</p>
        {errorMessage && (
          <p className="text-amber-600 text-sm text-center mt-2 max-w-xs">{errorMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 text-red-600">
      <XCircle className="h-12 w-12" />
      <p className="text-lg font-medium">No se pudo conectar a Supabase</p>
      {errorMessage && (
        <p className="text-sm text-center mt-2 max-w-xs">{errorMessage}</p>
      )}
      <TroubleshootingPanel />
    </div>
  );
};

const TroubleshootingPanel = () => (
  <div className="mt-4 p-4 bg-red-50 rounded-md text-sm">
    <h4 className="font-medium mb-2">Posibles soluciones:</h4>
    <ul className="list-disc pl-5 space-y-1">
      <li>Verificar tu conexión a internet</li>
      <li>Asegurar que tu proyecto de Supabase esté activo</li>
      <li>Limpiar el caché y cookies del navegador</li>
      <li>Verificar problemas de CORS (para desarrollo local)</li>
      <li>Confirmar que la URL y clave de Supabase sean correctas</li>
      <li>Activar el modo offline si el problema persiste</li>
    </ul>
  </div>
);

export default ConnectionStatusDisplay;
