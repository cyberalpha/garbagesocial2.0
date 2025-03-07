
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ConnectionTestButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const ConnectionTestButton = ({ onClick, isLoading }: ConnectionTestButtonProps) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={isLoading}
      className="px-6"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Verificando...
        </>
      ) : (
        'Probar Conexión de Nuevo'
      )}
    </Button>
  );
};

export default ConnectionTestButton;
