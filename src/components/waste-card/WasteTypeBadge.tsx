
import { Badge } from "@/components/ui/badge";
import { WasteType } from "@/types";
import { useLanguage } from '@/components/LanguageContext';

interface WasteTypeBadgeProps {
  type: WasteType;
}

const WasteTypeBadge = ({ type }: WasteTypeBadgeProps) => {
  const { t } = useLanguage();
  
  // Traduce el tipo de residuo
  const getWasteTypeText = () => {
    switch(type) {
      case 'organic': return t('waste.types.organic');
      case 'paper': return t('waste.types.paper');
      case 'glass': return t('waste.types.glass');
      case 'plastic': return t('waste.types.plastic');
      case 'metal': return t('waste.types.metal');
      case 'sanitary': return t('waste.types.sanitary');
      case 'dump': return t('waste.types.dump');
      default: return t('waste.types.various');
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
