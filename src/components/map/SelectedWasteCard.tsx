
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Waste } from '@/types';
import WasteCard from '../WasteCard';

interface SelectedWasteCardProps {
  selectedWaste: Waste | null;
  isRoutingMode: boolean;
  onClose: () => void;
  onCommit: (waste: Waste) => void;
}

const SelectedWasteCard = ({ 
  selectedWaste, 
  isRoutingMode,
  onClose,
  onCommit
}: SelectedWasteCardProps) => {
  if (!selectedWaste || isRoutingMode) {
    return null;
  }

  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80">
      <Card className="shadow-lg relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 z-10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <WasteCard 
          waste={selectedWaste} 
          showActions={false}
        />
        <div className="p-3 pt-0">
          <Button 
            variant="default" 
            size="sm" 
            className="w-full"
            onClick={() => onCommit(selectedWaste)}
          >
            Comprometerme a recolectar
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SelectedWasteCard;
