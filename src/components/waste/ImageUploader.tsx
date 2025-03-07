
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Trash2, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/components/LanguageContext';

interface ImageUploaderProps {
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
}

const ImageUploader = ({ imagePreview, onImageChange }: ImageUploaderProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Verificar si es una imagen
    if (!file.type.startsWith('image/')) {
      toast({
        title: t('general.error'),
        description: t('waste.imageError'),
        variant: "destructive"
      });
      return;
    }
    
    // Verificar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t('general.error'),
        description: t('waste.imageSizeError'),
        variant: "destructive"
      });
      return;
    }
    
    onImageChange(file);
  };
  
  const handleRemoveImage = () => {
    onImageChange(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image">{t('waste.image')}</Label>
      
      {imagePreview ? (
        <div className="relative rounded-md overflow-hidden">
          <img 
            src={imagePreview} 
            alt="Vista previa" 
            className="w-full h-40 object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
          <Camera className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 mb-2">{t('waste.dragImage')}</p>
          <p className="text-xs text-gray-400 mb-4">{t('waste.imageTypes')}</p>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('image')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {t('waste.selectImage')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
