
import { Waste } from '@/types';
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, X } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

interface ActionButtonsProps {
  waste: Waste;
  committing: boolean;
  onCommit: () => void;
}

const ActionButtons = ({ waste, committing, onCommit }: ActionButtonsProps) => {
  const { t } = useLanguage();
  
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
              {t('waste.committing')}
            </>
          ) : (
            <>
              <AlertCircle className="mr-2 h-4 w-4" />
              {t('waste.commit')}
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
            {t('waste.cancelCommitment')}
          </Button>
          <Button className="flex-1">
            <Check className="mr-2 h-4 w-4" />
            {t('waste.confirmCollection')}
          </Button>
        </div>
      )}
    </>
  );
};

export default ActionButtons;
