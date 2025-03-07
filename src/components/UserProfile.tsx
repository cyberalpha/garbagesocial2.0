import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Waste } from '../types';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Award, Recycle, Upload, BarChart3, Pencil } from 'lucide-react';
import WasteCard from './WasteCard';
import ProfileEditForm from './ProfileEditForm';
import { useAuth } from '@/hooks/useAuth';

interface UserProfileProps {
  userId?: string;
  isEditable?: boolean;
  user: User;
}

const UserProfile = ({ userId, isEditable = false, user }: UserProfileProps) => {
  const { deleteProfile } = useAuth();
  const navigate = useNavigate();
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
  const [activeTab, setActiveTab] = useState('published');
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-5 w-5 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };
  
  const filteredWastes = wastes.filter(waste => {
    switch (activeTab) {
      case 'published':
        return true;
      case 'pending':
        return waste.status === 'pending';
      case 'collected':
        return waste.status === 'collected';
      default:
        return true;
    }
  });

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
                  onClick={handleEditClick}
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
                <Button size="sm" onClick={handleEditClick}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              </div>
            )}
          </div>
          
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
              <div className="font-bold text-2xl">{user.averageRating.toFixed(1)}</div>
              <div className="text-xs text-gray-500">Calificación</div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
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
        </CardContent>
      </Card>
      
      <Tabs defaultValue="published" onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="published">Todos</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="collected">Recolectados</TabsTrigger>
        </TabsList>
        
        {['published', 'pending', 'collected'].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-6">
            {filteredWastes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWastes.map(waste => (
                  <WasteCard 
                    key={waste.id} 
                    waste={waste} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-gray-400 mb-2">
                  No hay residuos {tab === 'pending' ? 'pendientes' : 
                    tab === 'collected' ? 'recolectados' : ''}
                </div>
                {isEditable && (
                  <Button variant="outline" asChild>
                    <Link to="/publish">
                      <Upload className="h-4 w-4 mr-2" />
                      Publicar Residuo
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default UserProfile;
