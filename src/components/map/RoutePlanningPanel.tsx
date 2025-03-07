
import React from 'react';
import { Waste } from '@/types';
import RouteDisplay from '../RouteDisplay';

interface RoutePlanningPanelProps {
  selectedWastes: Waste[];
  optimizedRoute: Waste[];
  onRemove: (wasteId: string) => void;
  onClearAll: () => void;
  onOptimize: () => void;
  isOptimizing: boolean;
}

const RoutePlanningPanel = ({
  selectedWastes,
  optimizedRoute,
  onRemove,
  onClearAll,
  onOptimize,
  isOptimizing
}: RoutePlanningPanelProps) => {
  return (
    <div className="absolute bottom-4 left-4 right-4 md:w-96">
      <RouteDisplay 
        selectedWastes={selectedWastes}
        optimizedRoute={optimizedRoute}
        onRemove={onRemove}
        onClearAll={onClearAll}
        onOptimize={onOptimize}
        isOptimizing={isOptimizing}
      />
    </div>
  );
};

export default RoutePlanningPanel;
