
import React from 'react';
import { WasteType } from '@/types';
import { Button } from "@/components/ui/button";
import { Check, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WasteTypeFilterProps {
  selectedType: WasteType | null;
  onSelectType: (type: WasteType | null) => void;
}

const wasteTypes: {label: string; value: WasteType}[] = [
  { label: 'Orgánico', value: 'organic' },
  { label: 'Papel', value: 'paper' },
  { label: 'Vidrio', value: 'glass' },
  { label: 'Plástico', value: 'plastic' },
  { label: 'Metal', value: 'metal' },
  { label: 'Sanitario', value: 'sanitary' },
  { label: 'Escombros', value: 'dump' },
  { label: 'Varios', value: 'various' },
];

const WasteTypeFilter: React.FC<WasteTypeFilterProps> = ({ selectedType, onSelectType }) => {
  const getTypeLabel = (type: WasteType | null): string => {
    if (!type) return 'Todos';
    const found = wasteTypes.find(t => t.value === type);
    return found ? found.label : 'Todos';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-white/90 shadow-sm">
          <Filter className="h-4 w-4" />
          <span>{getTypeLabel(selectedType)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem 
            className="gap-2"
            onClick={() => onSelectType(null)}
          >
            {!selectedType && <Check className="h-4 w-4" />}
            <span className={!selectedType ? "font-medium" : ""}>Todos los tipos</span>
          </DropdownMenuItem>
          
          {wasteTypes.map((type) => (
            <DropdownMenuItem 
              key={type.value}
              className="gap-2"
              onClick={() => onSelectType(type.value)}
            >
              {selectedType === type.value && <Check className="h-4 w-4" />}
              <span className={selectedType === type.value ? "font-medium" : ""}>{type.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WasteTypeFilter;
