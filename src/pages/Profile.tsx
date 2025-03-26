
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Settings, 
  Edit2, 
  LogOut, 
  AlertCircle, 
  UserX 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, logout, updateProfile, deleteProfile } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Determinar si este perfil pertenece al usuario actual
  const isCurrentUserProfile = currentUser?.id === id;
  
  // Cargar datos iniciales
  useEffect(() => {
    if (currentUser && isCurrentUserProfile) {
      setName(currentUser.name || '');
      setProfileImage(currentUser.profileImage || '');
    }
  }, [currentUser, isCurrentUserProfile]);
  
  // Función para actualizar perfil
  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    
    try {
      const updatedUser = await updateProfile({
        ...currentUser,
        name,
        profileImage
      });
      
      setIsEditing(false);
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado correctamente."
      });
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      toast({
        title: "Error actualizando perfil",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    }
  };
  
  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };
  
  // Función para eliminar perfil
  const handleDeleteProfile = async () => {
    try {
      // Removemos el argumento para que coincida con la firma esperada
      await deleteProfile();
      navigate('/');
    } catch (error) {
      console.error('Error eliminando perfil:', error);
    }
  };
  
  // Si no hay usuario autenticado, mostrar mensaje
  if (!currentUser) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Usuario no encontrado</h2>
              <p className="text-muted-foreground mb-4">
                No se ha encontrado el perfil solicitado o no tienes permiso para verlo.
              </p>
              <Button onClick={() => navigate('/')}>Volver al inicio</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader className="relative">
          <div className="absolute right-4 top-4 flex gap-2">
            {isCurrentUserProfile && (
              <>
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar perfil</DialogTitle>
                      <DialogDescription>
                        Actualiza tus datos personales
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input 
                          id="name" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="profileImage">URL de imagen</Label>
                        <Input 
                          id="profileImage" 
                          value={profileImage} 
                          onChange={(e) => setProfileImage(e.target.value)} 
                        />
                      </div>
                      
                      <div className="mt-2">
                        <Label>Vista previa</Label>
                        <div className="mt-2 flex justify-center">
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={profileImage} />
                            <AvatarFallback>{name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleUpdateProfile}>
                        Guardar cambios
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="text-red-500">
                      <UserX className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Quieres eliminar tu perfil?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tienes dos opciones: desactivar tu cuenta (podrás recuperarla más tarde) o eliminarla permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <Button
                        variant="outline"
                        className="border-amber-500 text-amber-500 hover:text-amber-500 hover:bg-amber-50"
                        onClick={handleDeleteProfile}
                      >
                        Desactivar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteProfile}
                      >
                        Eliminar permanentemente
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <Button variant="outline" size="icon" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={currentUser.profileImage} />
              <AvatarFallback>{currentUser.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-center mb-1">{currentUser.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            <div className="flex items-center mt-2">
              {currentUser.isOrganization && (
                <span className="bg-primary/10 text-primary text-xs rounded-full px-2 py-1 font-medium">
                  Organización
                </span>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="wastes">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wastes">Mis residuos</TabsTrigger>
          <TabsTrigger value="collections">Mis recolecciones</TabsTrigger>
        </TabsList>
        <TabsContent value="wastes">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No has publicado residuos todavía
                </p>
                {isCurrentUserProfile && (
                  <Button className="mt-4" onClick={() => navigate('/publish')}>
                    Publicar nuevo residuo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="collections">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No has realizado recolecciones
                </p>
                {isCurrentUserProfile && (
                  <Button className="mt-4" onClick={() => navigate('/map')}>
                    Ver mapa de residuos
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
