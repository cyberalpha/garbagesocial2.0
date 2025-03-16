
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from 'lucide-react';
import { WasteType } from '@/types';
import { useToast } from "@/hooks/use-toast";
import useGeolocation from '@/hooks/useGeolocation';
import WasteTypeSelector from './waste/WasteTypeSelector';
import ImageUploader from './waste/ImageUploader';
import LocationDisplay from './waste/LocationDisplay';
import { Skeleton } from '@/components/ui/skeleton';

interface WasteFormProps {
  onSubmit: (data: {
    type: WasteType;
    description: string;
    imageUrl?: string;
    location: { lat: number; lng: number };
  }) => void;
  isSubmitting: boolean;
}

const WasteForm = ({ onSubmit, isSubmitting }: WasteFormProps) => {
  const { toast } = useToast();
  const { location, error, loading } = useGeolocation();
  
  const [wasteType, setWasteType] = useState<WasteType | ''>('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [customLocation, setCustomLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isFormReady, setIsFormReady] = useState(false);
  
  // Para futura implementación: usar la ubicación personalizada
  const [usingCustomLocation] = useState(false);
  
  // Asegurarse de que el formulario no parpadee y tenga un tiempo de carga estable
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFormReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  const handleImageChange = (file: File | null) => {
    setImage(file);
    
    if (!file) {
      setImagePreview(null);
      return;
    }
    
    // Crear vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Maneja el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!wasteType) {
      toast({
        title: "Error",
        description: "Debes seleccionar un tipo de residuo",
        variant: "destructive"
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Debes proporcionar una descripción",
        variant: "destructive"
      });
      return;
    }
    
    if (!location && !customLocation) {
      toast({
        title: "Error",
        description: "No se pudo obtener tu ubicación. Intenta de nuevo o introduce la ubicación manualmente.",
        variant: "destructive"
      });
      return;
    }
    
    // Preparar los datos para enviar
    const formData = {
      type: wasteType as WasteType,
      description,
      imageUrl: imagePreview || undefined,
      location: customLocation || { 
        lat: location?.coordinates[1] || 0, 
        lng: location?.coordinates[0] || 0 
      }
    };
    
    onSubmit(formData);
  };
  
  if (!isFormReady) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Tipo de residuo */}
        <WasteTypeSelector 
          value={wasteType}
          onChange={(value) => setWasteType(value)}
        />
        
        {/* Descripción */}
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Describe el residuo (tipo, cantidad, estado, etc.)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        {/* Subida de imagen */}
        <ImageUploader 
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
        />
        
        {/* Ubicación */}
        <LocationDisplay 
          location={location}
          loading={loading}
          error={error}
        />
      </div>
      
      {/* Botón de envío */}
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting || (!location && !customLocation)}
      >
        {isSubmitting ? (
          <>
            <Loader className="h-4 w-4 mr-2 animate-spin" />
            Publicando...
          </>
        ) : 'Publicar Residuo'}
      </Button>
    </form>
  );
};

export default WasteForm;
