
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getUserById } from '@/services/users';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, Edit, Save, Trash2, UserX } from 'lucide-react';
import { offlineMode } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import OfflineModeToggle from '@/components/OfflineModeToggle';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, updateProfile, deleteProfile, isLoading } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    profileImage: '',
  });
  const [isOwn, setIsOwn] = useState(false);
  const { toast } = useToast();

  // Cargar perfil
  useEffect(() => {
    const loadProfile = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        // Si el ID coincide con el usuario actual, usar esos datos
        if (currentUser && currentUser.id === id) {
          setProfileUser(currentUser);
          setIsOwn(true);
          setFormData({
            name: currentUser.name,
            profileImage: currentUser.profileImage || '',
          });
          return;
        }

        // Si no, cargar desde el servicio
        const user = await getUserById(id);
        if (user) {
          setProfileUser(user);
          setFormData({
            name: user.name,
            profileImage: user.profileImage || '',
          });
        } else {
          toast({
            title: "Usuario no encontrado",
            description: "No se pudo encontrar el perfil solicitado.",
            variant: "destructive",
          });
          navigate('/');
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar el perfil. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    };

    loadProfile();
  }, [id, currentUser, navigate, toast]);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!isOwn || !currentUser) {
      toast({
        title: "Error",
        description: "Solo puedes editar tu propio perfil.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updated = await updateProfile({
        name: formData.name,
        profileImage: formData.profileImage,
      });

      if (updated) {
        setIsEditing(false);
        setProfileUser(updated);
        toast({
          title: "Perfil actualizado",
          description: "Tu perfil ha sido actualizado correctamente.",
        });
      }
    } catch (error) {
      console.error("Error al guardar perfil:", error);
    }
  };

  // Eliminar o desactivar perfil
  const handleDeleteOrDeactivate = async (deactivate: boolean) => {
    if (!isOwn || !currentUser) {
      toast({
        title: "Error",
        description: "Solo puedes eliminar tu propio perfil.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteProfile(deactivate);
      // Si llegamos aquí, se ha cerrado sesión automáticamente
      // y deberíamos ser redirigidos
    } catch (error) {
      console.error("Error al eliminar/desactivar perfil:", error);
    }
  };

  // Si no hay perfil, mostrar carga
  if (!profileUser) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Cargando perfil...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Perfil de Usuario</CardTitle>
              <CardDescription>
                {isOwn ? "Tu perfil personal" : `Perfil de ${profileUser.name}`}
              </CardDescription>
            </div>
            {offlineMode() && (
              <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Modo Offline
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isOwn && (
            <div className="mb-6">
              <OfflineModeToggle simplified />
            </div>
          )}

          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="flex flex-col items-center">
              <Avatar className="w-32 h-32 mb-2">
                <AvatarImage src={isEditing ? formData.profileImage : profileUser.profileImage} />
                <AvatarFallback>{profileUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              {profileUser.isOrganization && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">
                  Organización
                </span>
              )}
              
              {profileUser.emailVerified && (
                <div className="flex items-center text-green-600 text-xs mt-2">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Email verificado
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="profileImage">URL de la imagen de perfil</Label>
                    <Input
                      id="profileImage"
                      name="profileImage"
                      value={formData.profileImage}
                      onChange={handleChange}
                      placeholder="https://"
                    />
                    <p className="text-xs text-muted-foreground">
                      Ingresa la URL de una imagen pública para tu perfil
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-medium">{profileUser.name}</h3>
                    <p className="text-sm text-muted-foreground">{profileUser.email}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Calificación promedio</h4>
                    <div className="flex items-center">
                      <span className="text-amber-500 font-bold">{profileUser.averageRating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground ml-1">/ 5.0</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {isOwn && !isEditing && (
            <div className="pt-4">
              <Tabs defaultValue="account">
                <TabsList className="w-full">
                  <TabsTrigger value="account" className="flex-1">Acciones de cuenta</TabsTrigger>
                </TabsList>
                
                <TabsContent value="account" className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar perfil
                    </Button>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-destructive">Zona peligrosa</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant="outline" 
                        className="border-amber-300 text-amber-700 hover:bg-amber-50"
                        onClick={() => handleDeleteOrDeactivate(true)}
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Desactivar cuenta
                      </Button>
                      
                      <Button 
                        variant="destructive"
                        onClick={() => handleDeleteOrDeactivate(false)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar cuenta
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Desactivar tu cuenta te permitirá reactivarla más tarde. 
                      Eliminar tu cuenta borrará permanentemente todos tus datos.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>

        {isEditing && (
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: profileUser.name,
                  profileImage: profileUser.profileImage || '',
                });
              }}
            >
              Cancelar
            </Button>
            
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ProfilePage;
