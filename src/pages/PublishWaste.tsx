
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Waste, WasteType } from "@/types";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/services/mockData";
import WasteForm from "@/components/WasteForm";

const PublishWaste = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (data: {
    type: WasteType;
    description: string;
    imageUrl?: string;
    location: { lat: number; lng: number };
  }) => {
    setIsSubmitting(true);
    
    // Simulating API call
    setTimeout(() => {
      // Get current user
      const currentUser = getCurrentUser();
      
      // Create new waste object
      const newWaste: Partial<Waste> = {
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
      
      // Show success message
      toast({
        title: "Publicación exitosa",
        description: "Tu residuo ha sido publicado correctamente",
      });
      
      setIsSubmitting(false);
      navigate('/');
    }, 1500);
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
