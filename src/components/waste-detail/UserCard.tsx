
import { User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star } from 'lucide-react';

interface UserCardProps {
  user: User;
  title: string;
}

const UserCard = ({ user, title }: UserCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
          onClick={() => navigate(`/profile/${user.id}`)}
        >
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={user.profileImage} 
              alt={user.name} 
            />
            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
              {user.averageRating.toFixed(1)}
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate(`/profile/${user.id}`)}
        >
          Ver Perfil
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserCard;
