
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
import { Save, X } from 'lucide-react';
import ProfileImageUploader from './ProfileImageUploader';
import ProfileFormFields from './ProfileFormFields';
import DeleteAccountDialog from './DeleteAccountDialog';

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
    profileImage: user.profileImage || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isOrganization: checked }));
  };

  const handleImageChange = (imageDataUrl: string) => {
    setFormData(prev => ({ ...prev, profileImage: imageDataUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting profile update:', formData);
      const result = await updateProfile(formData);
      console.log('Profile update result:', result);
      
      if (result) {
        onCancel(); // Return to view mode after successful update
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const success = await deleteProfile();
      if (success) {
        navigate('/'); // Redirect to home after successful deactivation
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if button should be disabled
  const isButtonDisabled = isLoading || isSubmitting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Perfil</CardTitle>
        <CardDescription>Actualiza tus datos personales</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <ProfileImageUploader
            currentImage={user.profileImage}
            userName={formData.name}
            onImageChange={handleImageChange}
          />

          <ProfileFormFields
            name={formData.name}
            email={formData.email}
            isOrganization={formData.isOrganization}
            onNameChange={handleChange}
            onEmailChange={handleChange}
            onIsOrganizationChange={handleToggleChange}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isButtonDisabled}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <DeleteAccountDialog onDelete={handleDelete} />
          </div>
          <Button type="submit" disabled={isButtonDisabled} className="min-w-[140px]">
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Guardando...
              </span>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProfileEditForm;
