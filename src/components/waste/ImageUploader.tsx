
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Trash2, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
}

const ImageUploader = ({ imagePreview, onImageChange }: ImageUploaderProps) => {
  const { toast } = useToast();
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Verificar si es una imagen
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "El archivo debe ser una imagen",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no debe exceder los 5MB",
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
      <Label htmlFor="image">Imagen (opcional)</Label>
      
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
          <p className="text-sm text-gray-500 mb-2">Arrastra una imagen o haz clic para seleccionar</p>
          <p className="text-xs text-gray-400 mb-4">PNG, JPG, GIF hasta 5MB</p>
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
            Seleccionar Imagen
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
