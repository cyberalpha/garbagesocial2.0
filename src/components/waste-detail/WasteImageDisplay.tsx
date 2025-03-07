
import { CardContent } from "@/components/ui/card";

interface WasteImageDisplayProps {
  imageUrl: string;
  description: string;
}

const WasteImageDisplay = ({ imageUrl, description }: WasteImageDisplayProps) => {
  if (!imageUrl) return null;
  
  return (
    <CardContent className="p-0">
      <div className="h-72 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={description} 
          className="w-full h-full object-cover"
        />
      </div>
    </CardContent>
  );
};

export default WasteImageDisplay;
