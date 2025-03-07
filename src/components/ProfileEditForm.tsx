
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
} from '@/components/ui/alert-dialog';
import { Save, X, Trash2, Camera, ImagePlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ProfileEditFormProps {
  user: User;
  onCancel: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ user, onCancel }) => {
  const { updateProfile, deleteProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    isOrganization: user.isOrganization,
    profileImage: user.profileImage || '',
  });
  const [previewImage, setPreviewImage] = useState<string | undefined>(user.profileImage);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isOrganization: checked }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen no debe superar los 5MB",
          variant: "destructive"
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "El archivo debe ser una imagen",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewImage(result);
        setFormData(prev => ({ ...prev, profileImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateProfile(formData);
    if (result) {
      onCancel(); // Return to view mode after successful update
    }
  };

  const handleDelete = async () => {
    const success = await deleteProfile();
    if (success) {
      navigate('/'); // Redirect to home after successful deactivation
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Perfil</CardTitle>
        <CardDescription>Actualiza tus datos personales</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg cursor-pointer" onClick={handleImageClick}>
                {previewImage ? (
                  <AvatarImage src={previewImage} alt={formData.name} />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {formData.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                  <Camera className="h-4 w-4" />
                </div>
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            <span className="text-sm text-muted-foreground">Haz clic para cambiar la foto</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tu nombre"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isOrganization"
              checked={formData.isOrganization}
              onCheckedChange={handleToggleChange}
            />
            <Label htmlFor="isOrganization">Soy una organización</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Desactivar cuenta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tu cuenta será desactivada y no podrás acceder a ella. Sin embargo, tus publicaciones seguirán visibles.
                    Puedes reactivar tu cuenta registrándote nuevamente con el mismo correo electrónico.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Sí, desactivar mi cuenta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <Button type="submit" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Guardar cambios
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProfileEditForm;
