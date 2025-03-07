import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useGeolocation from '../hooks/useGeolocation';
import { WasteType, GeoLocation } from '../types';
import { Camera, Trash2, MapPin, Upload, Loader } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const WasteForm = () => {
  const { toast } = useToast();
  const { location, error, loading } = useGeolocation();
  
  const [wasteType, setWasteType] = useState<WasteType | ''>('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [customLocation, setCustomLocation] = useState<GeoLocation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Para futura implementación: usar la ubicación personalizada
  const [usingCustomLocation, setUsingCustomLocation] = useState(false);
  
  // Maneja la subida de imágenes
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
    
    setImage(file);
    
    // Crear vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Elimina la imagen seleccionada
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };
  
  // Traduce el tipo de residuo
  const getWasteTypeText = (type: WasteType) => {
    switch(type) {
      case 'organic': return 'Orgánico';
      case 'paper': return 'Papel';
      case 'glass': return 'Vidrio';
      case 'plastic': return 'Plástico';
      case 'metal': return 'Metal';
      case 'sanitary': return 'Control Sanitario';
      case 'dump': return 'Basural';
      default: return 'Varios';
    }
  };
  
  // Determina el color según el tipo de residuo
  const getWasteTypeColor = (type: WasteType) => {
    switch(type) {
      case 'organic': return 'bg-waste-organic';
      case 'paper': return 'bg-waste-paper';
      case 'glass': return 'bg-waste-glass';
      case 'plastic': return 'bg-waste-plastic';
      case 'metal': return 'bg-waste-metal';
      case 'sanitary': return 'bg-waste-sanitary';
      case 'dump': return 'bg-waste-dump';
      default: return 'bg-waste-various';
    }
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
    
    setIsSubmitting(true);
    
    // Simular envío a API
    setTimeout(() => {
      console.log({
        type: wasteType,
        description,
        image,
        location: customLocation || location
      });
      
      // Notificar éxito
      toast({
        title: "Publicación exitosa",
        description: "Tu residuo ha sido publicado correctamente",
      });
      
      // Reiniciar formulario
      setWasteType('');
      setDescription('');
      setImage(null);
      setImagePreview(null);
      setCustomLocation(null);
      setIsSubmitting(false);
    }, 1500);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Tipo de residuo */}
        <div className="space-y-2">
          <Label htmlFor="waste-type">Tipo de Residuo</Label>
          <Select 
            value={wasteType} 
            onValueChange={(value) => setWasteType(value as WasteType)}
          >
            <SelectTrigger id="waste-type" className="w-full">
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Tipos de Residuos</SelectLabel>
                {(['organic', 'paper', 'glass', 'plastic', 'metal', 'sanitary', 'dump', 'various'] as WasteType[]).map((type) => (
                  <SelectItem 
                    key={type} 
                    value={type}
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getWasteTypeColor(type)}`} />
                      {getWasteTypeText(type)}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
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
        
        {/* Ubicación */}
        <div className="space-y-2">
          <Label>Ubicación</Label>
          <Card>
            <CardContent className="pt-4">
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader className="h-5 w-5 text-primary animate-spin mr-2" />
                  <span className="text-sm">Obteniendo ubicación...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 p-3 rounded-md text-red-800 text-sm">
                  {error}
                </div>
              ) : location ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>
                      Latitud: {location.coordinates[1].toFixed(6)}, 
                      Longitud: {location.coordinates[0].toFixed(6)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Utilizando tu ubicación actual. Para más precisión, 
                    confirma que has concedido permisos de ubicación a tu navegador.
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 p-3 rounded-md text-yellow-800 text-sm">
                  No se pudo obtener tu ubicación. Intenta de nuevo o introduce la ubicación manualmente.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
