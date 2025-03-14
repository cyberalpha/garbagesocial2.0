
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Waste, WasteType } from "@/types";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import WasteForm from "@/components/WasteForm";
import { addWaste } from "@/services/wastes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const PublishWaste = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, isLoading } = useAuth();
  const { toast } = useToast();
  
  // Add effect to ensure the user is authenticated
  useEffect(() => {
    if (!isLoading && !currentUser) {
      console.log("No hay usuario autenticado, redirigiendo a login");
      toast({
        title: "Acceso denegado",
        description: "Debes iniciar sesión para publicar un residuo",
        variant: "destructive"
      });
      navigate('/login');
    } else if (currentUser) {
      console.log("Usuario autenticado:", currentUser);
    }
  }, [currentUser, isLoading, navigate, toast]);
  
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
    setError(null);
    
    try {
      console.log("Creando nuevo residuo con datos:", data);
      console.log("Usuario actual:", currentUser);
      
      // Create new waste object con el ID de usuario verificado
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
      
      // Redirigir al perfil del usuario
      setTimeout(() => {
        setIsSubmitting(false);
        navigate(`/profile/${currentUser.id}`);
      }, 1000);
    } catch (error: any) {
      console.error("Error al publicar residuo:", error);
      // Mostrar mensaje de error
      setError(error.message || "Ha ocurrido un error al publicar el residuo. Intenta de nuevo.");
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al publicar el residuo. Intenta de nuevo.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };
  
  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl py-8 px-4 text-center">
        <p>Cargando...</p>
      </div>
    );
  }
  
  // Si no hay usuario autenticado, mostrar un mensaje y un botón para ir al login
  if (!currentUser) {
    return (
      <div className="container mx-auto max-w-2xl py-8 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Debes iniciar sesión para publicar un residuo
          </AlertDescription>
        </Alert>
        
        <Button onClick={() => navigate('/login')}>
          Iniciar sesión
        </Button>
      </div>
    );
  }
  
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
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
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
