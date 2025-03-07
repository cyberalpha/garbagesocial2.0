
import { Badge } from "@/components/ui/badge";
import { WasteStatus } from "@/types";
import { useLanguage } from '@/components/LanguageContext';

interface StatusBadgeProps {
  status: WasteStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { t } = useLanguage();
  
  // Traduce el estado
  const getStatusText = () => {
    switch(status) {
      case 'pending': return t('waste.status.pending');
      case 'in_progress': return t('waste.status.in_progress');
      case 'collected': return t('waste.status.collected');
      case 'canceled': return t('waste.status.canceled');
      default: return t('waste.status.unknown');
    }
  };
  
  // Color del estado
  const getStatusColor = () => {
    switch(status) {
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'collected': return 'bg-green-500';
      case 'canceled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getStatusColor()} text-white`}
    >
      {getStatusText()}
    </Badge>
  );
};

export default StatusBadge;
