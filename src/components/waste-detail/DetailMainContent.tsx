
import { Waste, User } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "./StatusBadge";
import WasteHeaderInfo from "./WasteHeaderInfo";
import WasteImageDisplay from "./WasteImageDisplay";
import LocationInfo from "./LocationInfo";
import PickupCommitmentInfo from "./PickupCommitmentInfo";
import ActionButtons from "./ActionButtons";
import { formatDate } from "@/utils/formatters";

interface DetailMainContentProps {
  waste: Waste;
  recycler: User | null;
  committing: boolean;
  onCommit: () => void;
}

const DetailMainContent = ({ 
  waste, 
  recycler, 
  committing, 
  onCommit 
}: DetailMainContentProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl font-bold">{waste.description}</CardTitle>
          <StatusBadge status={waste.status} />
        </div>
        <WasteHeaderInfo waste={waste} formatDate={formatDate} />
      </CardHeader>
      
      <WasteImageDisplay imageUrl={waste.imageUrl} description={waste.description} />
      
      <CardContent className="pt-6 space-y-4">
        <div className="text-gray-700">{waste.description}</div>
        
        <LocationInfo location={waste.location} />
        
        {waste.pickupCommitment && (
          <PickupCommitmentInfo 
            commitment={waste.pickupCommitment} 
            recycler={recycler} 
            formatDate={formatDate}
          />
        )}
      </CardContent>
      
      <CardFooter className="pt-0 pb-4">
        <ActionButtons 
          waste={waste} 
          committing={committing} 
          onCommit={onCommit} 
        />
      </CardFooter>
    </Card>
  );
};

export default DetailMainContent;
