
import { useState } from 'react';
import { User, Waste } from '../types';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ProfileEditForm from './profile/ProfileEditForm';
import { useAuth } from '@/hooks/useAuth';
import ProfileHeader from './profile/ProfileHeader';
import ProfileStatistics from './profile/ProfileStatistics';
import ProfileAchievements from './profile/ProfileAchievements';
import WasteTabs from './profile/WasteTabs';

interface UserProfileProps {
  userId?: string;
  isEditable?: boolean;
  user: User;
  wastes?: Waste[];
}

const UserProfile = ({ userId, isEditable = false, user, wastes = [] }: UserProfileProps) => {
  const { deleteProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    console.log('Edit profile clicked');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    console.log('Cancel edit profile');
    setIsEditing(false);
  };

  if (isEditing && isEditable) {
    return (
      <div className="mb-8">
        <ProfileEditForm user={user} onCancel={handleCancelEdit} />
      </div>
    );
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
          
          <ProfileAchievements user={user} wastes={wastes} />
        </CardContent>
      </Card>
      
      <WasteTabs wastes={wastes} isEditable={isEditable} />
    </div>
  );
};

export default UserProfile;
