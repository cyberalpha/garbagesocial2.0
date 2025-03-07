
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Map from "@/components/Map";
import { Waste } from '@/types';

interface DetailMapSectionProps {
  waste: Waste;
}

const DetailMapSection = ({ waste }: DetailMapSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubicación</CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-64">
        {waste && (
          <Map
            initialOptions={{
              center: waste.location.coordinates,
              zoom: 15
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DetailMapSection;
