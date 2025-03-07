
import { WasteType } from '@/types';
import { Label } from "@/components/ui/label";
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

export const getWasteTypeText = (type: WasteType) => {
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
  return (
    <div className="space-y-2">
      <Label htmlFor="waste-type">Tipo de Residuo</Label>
      <Select 
        value={value} 
        onValueChange={(value) => onChange(value as WasteType)}
      >
        <SelectTrigger id="waste-type" className="w-full">
          <SelectValue placeholder="Selecciona un tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Tipos de Residuos</SelectLabel>
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
