
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from '@/types';
import { getWastesByUserId } from '@/services/wastes';
import { Waste } from '@/types';
import WastesList from '@/components/waste/WastesList';
import { ArrowLeft, MapPin, Plus, User as UserIcon, Alert } from 'lucide-react';

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const isOwnProfile = currentUser && (id === currentUser.id);
  
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        // Simplemente usamos el usuario actual por ahora
        if (currentUser && id === currentUser.id) {
          setProfileUser(currentUser);
          
          // Cargar residuos del usuario
          const userWastes = await getWastesByUserId(id);
          setWastes(userWastes);
        } else {
          // Aquí se implementaría la obtención del perfil de otro usuario
          // Por ahora, en modo offline, solo se puede ver el propio perfil
          navigate('/'); // Redireccionar a la página principal
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [id, currentUser, navigate]);
  
  const refreshWastes = async () => {
    if (id) {
      const userWastes = await getWastesByUserId(id);
      setWastes(userWastes);
    }
  };
  
  const handlePublishWaste = () => {
    navigate('/publish');
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }
  
  if (!profileUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Perfil no encontrado</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>
      
      <Card className="mb-6">
        <CardHeader className="relative pb-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted">
              {profileUser.profileImage ? (
                <img 
                  src={profileUser.profileImage} 
                  alt={profileUser.name || 'Usuario'} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary/10">
                  <UserIcon className="h-12 w-12 text-primary/40" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <CardTitle className="text-2xl">{profileUser.name || 'Usuario'}</CardTitle>
              <CardDescription>{profileUser.email}</CardDescription>
              
              {profileUser.location && (
                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {profileUser.location.coordinates[1].toFixed(6)}, 
                    {profileUser.location.coordinates[0].toFixed(6)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          {isOwnProfile && (
            <div className="flex flex-wrap gap-2 justify-end mb-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/settings')}
              >
                Editar Perfil
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue="wastes" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="wastes">Residuos Publicados</TabsTrigger>
          <TabsTrigger value="collections">Recolecciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wastes" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Residuos Publicados</h2>
            
            {isOwnProfile && (
              <Button 
                onClick={handlePublishWaste}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Publicar
              </Button>
            )}
          </div>
          
          <WastesList 
            wastes={wastes} 
            isLoading={isLoading}
            emptyMessage={
              isOwnProfile 
                ? "Aún no has publicado ningún residuo. ¡Comienza publicando uno!"
                : "Este usuario aún no ha publicado residuos."
            }
            onWastesChanged={refreshWastes}
          />
        </TabsContent>
        
        <TabsContent value="collections">
          <div className="flex items-center justify-center p-12 text-muted-foreground">
            <Alert className="h-6 w-6 mr-2" />
            <span>Esta sección estará disponible próximamente</span>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
