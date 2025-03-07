
import { Badge } from "@/components/ui/badge";
import { WasteType } from "@/types";

interface WasteTypeBadgeProps {
  type: WasteType;
}

const WasteTypeBadge = ({ type }: WasteTypeBadgeProps) => {
  // Traduce el tipo de residuo
  const getWasteTypeText = () => {
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
  
  // Determina el color según el tipo de residuo
  const getWasteTypeColor = () => {
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

  return (
    <Badge 
      className={`${getWasteTypeColor()} text-white`}
    >
      {getWasteTypeText()}
    </Badge>
  );
};

export default WasteTypeBadge;
