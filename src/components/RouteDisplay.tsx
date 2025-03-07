
import React from 'react';
import { Waste } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, RotateCcw, Route } from 'lucide-react';

interface RouteDisplayProps {
  selectedWastes: Waste[];
  optimizedRoute: Waste[];
  onRemove: (wasteId: string) => void;
  onClearAll: () => void;
  onOptimize: () => void;
  isOptimizing: boolean;
}

const RouteDisplay = ({
  selectedWastes,
  optimizedRoute,
  onRemove,
  onClearAll,
  onOptimize,
  isOptimizing
}: RouteDisplayProps) => {
  if (selectedWastes.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-h-64 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">
          Puntos seleccionados ({selectedWastes.length})
        </h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onOptimize}
            disabled={selectedWastes.length < 2 || isOptimizing}
          >
            <Route className="mr-1 h-4 w-4" />
            {isOptimizing ? 'Optimizando...' : 'Optimizar ruta'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearAll}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        {(optimizedRoute.length > 0 ? optimizedRoute : selectedWastes).map((waste, index) => (
          <div 
            key={waste.id} 
            className="flex items-center justify-between border rounded-md p-2"
          >
            <div className="flex items-center">
              {optimizedRoute.length > 0 && (
                <Badge variant="outline" className="mr-2">
                  {index + 1}
                </Badge>
              )}
              <div>
                <p className="text-sm font-medium capitalize">{waste.type}</p>
                <p className="text-xs text-gray-500 truncate">{waste.description}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onRemove(waste.id)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteDisplay;
