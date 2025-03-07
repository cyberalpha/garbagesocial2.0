
import { Badge } from "@/components/ui/badge";
import { Award, Star, Recycle, Upload, BarChart3 } from 'lucide-react';

const ProfileAchievements = () => {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
        <Award className="h-4 w-4 text-primary" />
        Logros
      </h3>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="bg-yellow-100">
          <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
          Publicador Estrella
        </Badge>
        <Badge variant="outline" className="bg-green-100">
          <Recycle className="h-3 w-3 mr-1 text-green-500" />
          Eco Amigo
        </Badge>
        <Badge variant="outline" className="bg-blue-100">
          <Upload className="h-3 w-3 mr-1 text-blue-500" />
          10 Publicaciones
        </Badge>
        <Badge variant="outline" className="bg-purple-100">
          <BarChart3 className="h-3 w-3 mr-1 text-purple-500" />
          Top 10%
        </Badge>
      </div>
    </div>
  );
};

export default ProfileAchievements;
