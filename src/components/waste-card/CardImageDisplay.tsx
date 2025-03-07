
import { Badge } from "@/components/ui/badge";
import WasteTypeBadge from "./WasteTypeBadge";
import { WasteType } from "@/types";

interface CardImageDisplayProps {
  imageUrl?: string;
  description: string;
  type: WasteType;
}

const CardImageDisplay = ({ imageUrl, description, type }: CardImageDisplayProps) => {
  if (!imageUrl) return null;
  
  return (
    <div className="relative h-48 overflow-hidden">
      <img 
        src={imageUrl} 
        alt={description} 
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      />
      <div className="absolute top-2 right-2">
        <WasteTypeBadge type={type} />
      </div>
    </div>
  );
};

export default CardImageDisplay;
