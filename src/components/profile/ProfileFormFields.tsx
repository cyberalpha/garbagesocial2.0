
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ProfileFormFieldsProps {
  name: string;
  email: string;
  isOrganization: boolean;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIsOrganizationChange: (checked: boolean) => void;
}

const ProfileFormFields: React.FC<ProfileFormFieldsProps> = ({
  name,
  email,
  isOrganization,
  onNameChange,
  onEmailChange,
  onIsOrganizationChange
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={onNameChange}
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
          value={email}
          onChange={onEmailChange}
          placeholder="tu@email.com"
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="isOrganization"
          checked={isOrganization}
          onCheckedChange={onIsOrganizationChange}
        />
        <Label htmlFor="isOrganization">Soy una organización</Label>
      </div>
    </>
  );
};

export default ProfileFormFields;
