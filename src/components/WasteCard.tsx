
import { useState } from 'react';
import { Waste } from '../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import WasteTypeBadge from './waste-card/WasteTypeBadge';
import StatusBadge from './waste-card/StatusBadge';
import CardImageDisplay from './waste-card/CardImageDisplay';
import WasteMetadata from './waste-card/WasteMetadata';
import CardActions from './waste-card/CardActions';

interface WasteCardProps {
  waste: Waste;
  onCommit?: (waste: Waste) => void;
  onClick?: () => void;
}

const WasteCard = ({ waste, onCommit, onClick }: WasteCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardImageDisplay 
        imageUrl={waste.imageUrl} 
        description={waste.description} 
        type={waste.type} 
      />
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {waste.imageUrl ? waste.description : (
              <div className="flex items-center gap-2">
                <WasteTypeBadge type={waste.type} />
                <span>{waste.description}</span>
              </div>
            )}
          </CardTitle>
          <StatusBadge status={waste.status} />
        </div>
      </CardHeader>
      
      <CardContent className="text-sm space-y-2">
        <WasteMetadata 
          publicationDate={waste.publicationDate}
          location={waste.location}
          userId={waste.userId}
          pickupCommitment={waste.pickupCommitment}
          isExpanded={isExpanded}
        />
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <CardActions 
          waste={waste}
          isExpanded={isExpanded}
          onToggleExpand={handleToggleExpand}
          onCommit={onCommit}
        />
      </CardFooter>
    </Card>
  );
};

export default WasteCard;
