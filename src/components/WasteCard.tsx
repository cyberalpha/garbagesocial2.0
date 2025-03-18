
import React from 'react';
import { Waste } from '@/types';
import { Card, CardContent } from "@/components/ui/card";

interface WasteCardProps {
  waste: Waste;
  onCommit?: (waste: Waste) => void;
}

const WasteCard = ({ waste, onCommit }: WasteCardProps) => {
  return (
    <CardContent className="p-4">
      <div className="text-lg font-medium">{waste.description}</div>
      <div className="text-sm text-gray-500">Tipo: {waste.type}</div>
      {onCommit && (
        <button 
          className="mt-2 px-3 py-1 bg-primary text-white rounded-md"
          onClick={() => onCommit(waste)}
        >
          Compromiso
        </button>
      )}
    </CardContent>
  );
};

export default WasteCard;
