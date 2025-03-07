
import { Waste } from '@/types';

interface ProfileStatisticsProps {
  wastes: Waste[];
  averageRating: number;
}

const ProfileStatistics = ({ wastes, averageRating }: ProfileStatisticsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 my-4">
      <div className="bg-muted rounded-lg p-3 text-center">
        <div className="font-bold text-2xl">{wastes.length}</div>
        <div className="text-xs text-gray-500">Publicaciones</div>
      </div>
      <div className="bg-muted rounded-lg p-3 text-center">
        <div className="font-bold text-2xl">
          {wastes.filter(w => w.status === 'collected').length}
        </div>
        <div className="text-xs text-gray-500">Recolectados</div>
      </div>
      <div className="bg-muted rounded-lg p-3 text-center">
        <div className="font-bold text-2xl">{averageRating.toFixed(1)}</div>
        <div className="text-xs text-gray-500">Calificación</div>
      </div>
    </div>
  );
};

export default ProfileStatistics;
