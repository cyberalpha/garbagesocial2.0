
import { WasteType } from '@/types';
import { Label } from "@/components/ui/label";
import { useLanguage } from '@/components/LanguageContext';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WasteTypeSelectorProps {
  value: WasteType | '';
  onChange: (value: WasteType) => void;
}

export const getWasteTypeColor = (type: WasteType) => {
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

const WasteTypeSelector = ({ value, onChange }: WasteTypeSelectorProps) => {
  const { t } = useLanguage();
  
  const getWasteTypeText = (type: WasteType) => {
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

  return (
    <div className="space-y-2">
      <Label htmlFor="waste-type">{t('waste.type')}</Label>
      <Select 
        value={value} 
        onValueChange={(value) => onChange(value as WasteType)}
      >
        <SelectTrigger id="waste-type" className="w-full">
          <SelectValue placeholder={t('waste.selectType')} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{t('waste.typeGroups')}</SelectLabel>
            {(['organic', 'paper', 'glass', 'plastic', 'metal', 'sanitary', 'dump', 'various'] as WasteType[]).map((type) => (
              <SelectItem 
                key={type} 
                value={type}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getWasteTypeColor(type)}`} />
                  {getWasteTypeText(type)}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default WasteTypeSelector;
