
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Waste, WasteType } from "@/types";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import WasteForm from "@/components/WasteForm";
import { addWaste } from "@/services/wastes";

const PublishWaste = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  
  const handleSubmit = (data: {
    type: WasteType;
    description: string;
    imageUrl?: string;
    location: { lat: number; lng: number };
  }) => {
    setIsSubmitting(true);
    
    // Verificar que el usuario esté autenticado
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para publicar un residuo",
        variant: "destructive"
      });
      setIsSubmitting(false);
      navigate('/login');
      return;
    }
    
    try {
      // Create new waste object
      const newWasteData: Partial<Waste> = {
        userId: currentUser.id,
        type: data.type,
        description: data.description,
        imageUrl: data.imageUrl,
        location: {
          type: "Point",
          coordinates: [data.location.lng, data.location.lat]
        },
        publicationDate: new Date(),
        status: "pending"
      };
      
      // Agregar el residuo usando la función del servicio
      const newWaste = addWaste(newWasteData);
      
      // Show success message
      toast({
        title: "Publicación exitosa",
        description: "Tu residuo ha sido publicado correctamente",
      });
      
      // Redirigir a la página principal
      navigate('/');
    } catch (error) {
      // Mostrar mensaje de error
      toast({
        title: "Error",
        description: "Ha ocurrido un error al publicar el residuo. Intenta de nuevo.",
        variant: "destructive"
      });
      console.error("Error al publicar residuo:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Publicar Residuo</CardTitle>
        </CardHeader>
        <CardContent>
          <WasteForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PublishWaste;
