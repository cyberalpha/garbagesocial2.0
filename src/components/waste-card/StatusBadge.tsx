
import { Badge } from "@/components/ui/badge";
import { WasteStatus } from "@/types";

interface StatusBadgeProps {
  status: WasteStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  // Traduce el estado
  const getStatusText = () => {
    switch(status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En proceso';
      case 'collected': return 'Retirado';
      case 'canceled': return 'Cancelado';
      default: return 'Desconocido';
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
