
import { Badge } from "@/components/ui/badge";
import { WasteStatus } from '@/types';

interface StatusBadgeProps {
  status: WasteStatus;
}

export const getStatusText = (status: WasteStatus) => {
  switch(status) {
    case 'pending': return 'Pendiente';
    case 'in_progress': return 'En proceso';
    case 'collected': return 'Retirado';
    case 'canceled': return 'Cancelado';
    default: return 'Desconocido';
  }
};

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
