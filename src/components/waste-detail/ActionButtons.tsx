
import { Waste } from '@/types';
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, X } from 'lucide-react';

interface ActionButtonsProps {
  waste: Waste;
  committing: boolean;
  onCommit: () => void;
}

const ActionButtons = ({ waste, committing, onCommit }: ActionButtonsProps) => {
  return (
    <>
      {waste.status === 'pending' && (
        <Button 
          className="w-full"
          disabled={committing}
          onClick={onCommit}
        >
          {committing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Registrando compromiso...
            </>
          ) : (
            <>
              <AlertCircle className="mr-2 h-4 w-4" />
              Comprometerme a Retirar
            </>
          )}
        </Button>
      )}
      
      {waste.status === 'in_progress' && !waste.pickupCommitment?.recyclerId && (
        <div className="w-full flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar Compromiso
          </Button>
          <Button className="flex-1">
            <Check className="mr-2 h-4 w-4" />
            Confirmar Recolección
          </Button>
        </div>
      )}
    </>
  );
};

export default ActionButtons;
