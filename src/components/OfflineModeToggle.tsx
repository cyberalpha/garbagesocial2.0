
import React from 'react';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfflineModeToggleProps {
  className?: string;
}

const OfflineModeToggle = ({ className }: OfflineModeToggleProps) => {
  const { isOfflineMode, toggleOfflineMode } = useSupabaseConnection();

  return (
    <div className={cn("flex items-center space-x-2 p-2 rounded-md", className)}>
      <Switch 
        id="offline-mode" 
        checked={isOfflineMode} 
        onCheckedChange={toggleOfflineMode} 
      />
      <Label 
        htmlFor="offline-mode" 
        className="flex items-center cursor-pointer"
      >
        <WifiOff className={cn(
          "h-4 w-4 mr-2", 
          isOfflineMode ? "text-orange-500" : "text-gray-400"
        )} />
        <span className={cn(
          "text-sm font-medium",
          isOfflineMode ? "text-orange-600" : "text-gray-600"
        )}>
          Modo offline {isOfflineMode ? "activado" : "desactivado"}
        </span>
      </Label>
    </div>
  );
};

export default OfflineModeToggle;
