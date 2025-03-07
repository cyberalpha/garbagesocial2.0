
import { Badge } from "@/components/ui/badge";
import { WasteType } from '@/types';

interface WasteTypeBadgeProps {
  type: WasteType;
}

export const getWasteTypeText = (type: string) => {
  switch(type) {
    case 'organic': return 'Orgánico';
    case 'paper': return 'Papel';
    case 'glass': return 'Vidrio';
    case 'plastic': return 'Plástico';
    case 'metal': return 'Metal';
    case 'sanitary': return 'Control Sanitario';
    case 'dump': return 'Basural';
    default: return 'Varios';
  }
};

export const getWasteTypeColor = (type: string) => {
  switch(type) {
    case 'organic': return 'bg-waste-organic';
    case 'paper': return 'bg-waste-paper';
    case 'glass': return 'bg-waste-glass';
    case 'plastic': return 'bg-waste-plastic';
    case 'metal': return 'bg-waste-metal';
    case 'sanitary': return 'bg-waste-sanitary';
    case 'dump': return 'bg-waste-dump';
    default: return 'bg-waste-various';
  }
};

const WasteTypeBadge = ({ type }: WasteTypeBadgeProps) => {
  return (
    <Badge className={`${getWasteTypeColor(type)} text-white`}>
      {getWasteTypeText(type)}
    </Badge>
  );
};

export default WasteTypeBadge;
