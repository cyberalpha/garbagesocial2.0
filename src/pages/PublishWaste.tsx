
import { useState, useEffect } from 'react';
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
  
  // Add effect to ensure the user is authenticated
  useEffect(() => {
    if (!currentUser) {
      console.log("No hay usuario autenticado, redirigiendo a login");
      toast({
        title: "Error",
        description: "Debes iniciar sesión para publicar un residuo",
        variant: "destructive"
      });
      navigate('/login');
    } else {
      console.log("Usuario autenticado:", currentUser);
    }
  }, [currentUser, navigate]);
  
  const handleSubmit = async (data: {
    type: WasteType;
    description: string;
    imageUrl?: string;
    location: { lat: number; lng: number };
  }) => {
    // Double check user is authenticated
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para publicar un residuo",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Creando nuevo residuo con datos:", data);
      console.log("Usuario actual:", currentUser);
      
      // Ensure the user's ID is properly saved to localStorage before proceeding
      if (currentUser) {
        localStorage.setItem('auth_user_data', JSON.stringify(currentUser));
        console.log("Usuario guardado en localStorage:", JSON.parse(localStorage.getItem('auth_user_data') || '{}'));
      }
      
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
      
      // Add waste and handle response
      const newWaste = await addWaste(newWasteData);
      console.log("Residuo creado exitosamente:", newWaste);
      
      // Show success message
      toast({
        title: "Publicación exitosa",
        description: "Tu residuo ha sido publicado correctamente",
      });
      
      // Ensure user data is preserved in session before redirecting
      setTimeout(() => {
        setIsSubmitting(false);
        
        if (!currentUser || !currentUser.id) {
          console.error("Error: ID de usuario no válido al intentar redirigir");
          toast({
            title: "Error",
            description: "Hubo un problema con tu sesión. Volviendo al inicio.",
            variant: "destructive"
          });
          navigate('/');
          return;
        }
        
        // Double check localStorage before redirecting
        const storedUser = JSON.parse(localStorage.getItem('auth_user_data') || '{}');
        console.log("Usuario en localStorage antes de redirigir:", storedUser);
        
        // Redirigir al perfil del usuario
        const profilePath = `/profile/${currentUser.id}`;
        console.log("Redirigiendo a:", profilePath);
        navigate(profilePath);
      }, 2000); // Increased to 2 seconds to ensure data is saved
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
