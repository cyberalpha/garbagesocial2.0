
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Waste } from "@/types";

interface CardActionsProps {
  waste: Waste;
  isExpanded: boolean;
  onToggleExpand: (e: React.MouseEvent) => void;
  onCommit?: (waste: Waste) => void;
}

const CardActions = ({ waste, isExpanded, onToggleExpand, onCommit }: CardActionsProps) => {
  return (
    <div className="flex justify-between">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onToggleExpand}
      >
        {isExpanded ? 'Ver menos' : 'Ver más'}
      </Button>
      
      {waste.status === 'pending' && onCommit && (
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onCommit(waste);
          }}
          size="sm"
          className="gap-1"
        >
          <AlertCircle className="h-4 w-4" />
          Comprometerme
        </Button>
      )}
    </div>
  );
};

export default CardActions;
