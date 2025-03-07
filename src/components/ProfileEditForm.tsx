
import React, { useState } from 'react';
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
import { Save, X, Trash2 } from 'lucide-react';

interface ProfileEditFormProps {
  user: User;
  onCancel: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ user, onCancel }) => {
  const { updateProfile, deleteProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    isOrganization: user.isOrganization,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isOrganization: checked }));
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
      navigate('/'); // Redirect to home after successful deletion
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
                  Eliminar cuenta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente tu cuenta
                    y todos tus datos asociados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Sí, eliminar mi cuenta
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
