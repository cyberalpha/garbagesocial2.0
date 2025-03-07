
import { useState } from 'react';
import { User, Waste } from '../types';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ProfileEditForm from './ProfileEditForm';
import { useAuth } from '@/hooks/useAuth';
import ProfileHeader from './profile/ProfileHeader';
import ProfileStatistics from './profile/ProfileStatistics';
import ProfileAchievements from './profile/ProfileAchievements';
import WasteTabs from './profile/WasteTabs';

interface UserProfileProps {
  userId?: string;
  isEditable?: boolean;
  user: User;
}

const UserProfile = ({ userId, isEditable = false, user }: UserProfileProps) => {
  const { deleteProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [wastes] = useState<Waste[]>([
    {
      id: '1',
      userId: user.id,
      type: 'plastic',
      description: 'Botellas de plástico',
      imageUrl: 'https://images.unsplash.com/photo-1605600659453-128bfdb3a5eb?w=600&auto=format&fit=crop',
      location: {
        type: 'Point',
        coordinates: [-58.3816, -34.6037]
      },
      publicationDate: new Date('2023-05-15T10:30:00'),
      status: 'pending'
    },
    {
      id: '2',
      userId: user.id,
      type: 'paper',
      description: 'Cajas de cartón',
      imageUrl: 'https://images.unsplash.com/photo-1607625004976-fe1049860b6b?w=600&auto=format&fit=crop',
      location: {
        type: 'Point',
        coordinates: [-58.3712, -34.6083]
      },
      publicationDate: new Date('2023-05-14T14:45:00'),
      status: 'pending'
    },
    {
      id: '3',
      userId: user.id,
      type: 'organic',
      description: 'Restos de poda',
      location: {
        type: 'Point',
        coordinates: [-58.3948, -34.6011]
      },
      publicationDate: new Date('2023-05-16T09:15:00'),
      status: 'collected',
      pickupCommitment: {
        recyclerId: 'recycler123',
        commitmentDate: new Date('2023-05-16T11:00:00')
      }
    }
  ]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (isEditing && isEditable) {
    return <ProfileEditForm user={user} onCancel={handleCancelEdit} />;
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/30 to-accent/30"></div>
        <CardContent className="relative pt-0">
          <ProfileHeader 
            user={user} 
            isEditable={isEditable} 
            onEditClick={handleEditClick} 
          />
          
          <ProfileStatistics 
            wastes={wastes} 
            averageRating={user.averageRating} 
          />
          
          <Separator className="my-4" />
          
          <ProfileAchievements />
        </CardContent>
      </Card>
      
      <WasteTabs wastes={wastes} isEditable={isEditable} />
    </div>
  );
};

export default UserProfile;
