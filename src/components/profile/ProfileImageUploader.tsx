
import React, { useRef, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ProfileImageUploaderProps {
  currentImage?: string;
  userName: string;
  onImageChange: (imageDataUrl: string) => void;
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  currentImage,
  userName,
  onImageChange
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | undefined>(currentImage);

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
        onImageChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        <Avatar className="w-24 h-24 border-4 border-white shadow-lg cursor-pointer" onClick={handleImageClick}>
          {previewImage ? (
            <AvatarImage src={previewImage} alt={userName} />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {userName.substring(0, 2).toUpperCase()}
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
  );
};

export default ProfileImageUploader;
