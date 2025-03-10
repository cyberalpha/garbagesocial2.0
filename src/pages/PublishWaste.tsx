
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
  
  const handleSubmit = async (data: {
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
      console.log("Creando nuevo residuo con datos:", data);
      console.log("Usuario actual:", currentUser);
      
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
      
      console.log("Datos del residuo a guardar:", newWasteData);
      
      // Usar la función addWaste actualizada que ahora es async
      const newWaste = await addWaste(newWasteData);
      console.log("Residuo creado exitosamente:", newWaste);
      
      // Show success message
      toast({
        title: "Publicación exitosa",
        description: "Tu residuo ha sido publicado correctamente",
      });
      
      // Esperar un momento antes de redirigir para asegurar que los datos se hayan guardado
      setTimeout(() => {
        setIsSubmitting(false);
        // Redirigir al perfil del usuario
        const profilePath = `/profile/${currentUser.id}`;
        console.log("Redirigiendo a:", profilePath);
        navigate(profilePath);
      }, 500);
    } catch (error) {
      console.error("Error al publicar residuo:", error);
      // Mostrar mensaje de error
      toast({
        title: "Error",
        description: "Ha ocurrido un error al publicar el residuo. Intenta de nuevo.",
        variant: "destructive"
      });
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
