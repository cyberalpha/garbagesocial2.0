
import { User } from '@/types';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Star } from 'lucide-react';

interface ProfileHeaderProps {
  user: User;
  isEditable: boolean;
  onEditClick: () => void;
}

const ProfileHeader = ({ user, isEditable, onEditClick }: ProfileHeaderProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-5 w-5 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="relative pt-0">
      <div className="flex flex-col md:flex-row md:items-end -mt-16 md:-mt-12 mb-4 gap-4">
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img 
              src={user.profileImage || 'https://via.placeholder.com/150'} 
              alt={user.name} 
              className="w-full h-full object-cover"
            />
          </div>
          {isEditable && (
            <Button 
              size="icon" 
              variant="secondary" 
              className="absolute bottom-0 right-0"
              onClick={onEditClick}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            {user.isOrganization && (
              <Badge className="bg-blue-500 text-white">Organización</Badge>
            )}
          </div>
          <div className="text-gray-500 text-sm mb-2">{user.email}</div>
          <div className="flex items-center gap-1">
            {renderStars(user.averageRating)}
            <span className="ml-2 text-sm font-medium">{user.averageRating.toFixed(1)}</span>
          </div>
        </div>
        
        {isEditable && (
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button size="sm" onClick={onEditClick}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
