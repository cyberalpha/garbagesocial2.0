
import { Badge } from "@/components/ui/badge";
import { WasteStatus } from '@/types';
import { useLanguage } from '@/components/LanguageContext';

interface StatusBadgeProps {
  status: WasteStatus;
}

export const getStatusColor = (status: WasteStatus) => {
  switch(status) {
    case 'pending': return 'bg-yellow-500';
    case 'in_progress': return 'bg-blue-500';
    case 'collected': return 'bg-green-500';
    case 'canceled': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { t } = useLanguage();
  
  const getStatusText = (status: WasteStatus) => {
    switch(status) {
      case 'pending': return t('waste.status.pending');
      case 'in_progress': return t('waste.status.in_progress');
      case 'collected': return t('waste.status.collected');
      case 'canceled': return t('waste.status.canceled');
      default: return t('waste.status.unknown');
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getStatusColor(status)} text-white`}
    >
      {getStatusText(status)}
    </Badge>
  );
};

export default StatusBadge;
