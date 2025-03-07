
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Waste } from "@/types";
import { useLanguage } from '@/components/LanguageContext';

interface CardActionsProps {
  waste: Waste;
  isExpanded: boolean;
  onToggleExpand: (e: React.MouseEvent) => void;
  onCommit?: (waste: Waste) => void;
}

const CardActions = ({ waste, isExpanded, onToggleExpand, onCommit }: CardActionsProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex justify-between">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onToggleExpand}
      >
        {isExpanded ? t('waste.seeLess') : t('waste.seeMore')}
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
          {t('waste.commit')}
        </Button>
      )}
    </div>
  );
};

export default CardActions;
