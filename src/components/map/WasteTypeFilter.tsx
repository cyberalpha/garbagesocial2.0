
import React from 'react';
import { WasteType } from '@/types';
import { Button } from "@/components/ui/button";
import { Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WasteTypeFilterProps {
  selectedType: WasteType | null;
  onSelectType: (type: WasteType | null) => void;
}

const WasteTypeFilter = ({ selectedType, onSelectType }: WasteTypeFilterProps) => {
  const wasteTypes: WasteType[] = [
    'organic', 'paper', 'glass', 'plastic', 'metal', 'sanitary', 'dump', 'various'
  ];
  
  const getTypeLabel = (type: WasteType) => {
    const labels: Record<WasteType, string> = {
      organic: 'Orgánico',
      paper: 'Papel',
      glass: 'Vidrio',
      plastic: 'Plástico',
      metal: 'Metal',
      sanitary: 'Sanitario',
      dump: 'Basural',
      various: 'Varios'
    };
    return labels[type];
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={selectedType ? "default" : "secondary"} 
          size="sm"
        >
          <Filter className="mr-2 h-4 w-4" />
          {selectedType ? getTypeLabel(selectedType) : 'Filtrar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {wasteTypes.map((type) => (
          <DropdownMenuItem 
            key={type} 
            onClick={() => onSelectType(type)}
            className={selectedType === type ? "bg-accent" : ""}
          >
            {getTypeLabel(type)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WasteTypeFilter;
