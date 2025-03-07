
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Waste, WasteType } from "@/types";
import { getAllWastes } from "@/services/mockData";
import { Filter, Plus, Route, Trash } from "lucide-react";
import Map from "@/components/Map";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";

const MapView = () => {
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [selectedType, setSelectedType] = useState<WasteType | null>(null);
  const [showRouteTools, setShowRouteTools] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Verificar autenticación
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const allWastes = getAllWastes();
    setWastes(allWastes);
    console.log("Wastes loaded:", allWastes.length);
  }, [currentUser, navigate]);

  const handleFilterClick = (type: WasteType | null) => {
    setSelectedType(type);
    if (type) {
      const filtered = getAllWastes().filter(waste => waste.type === type);
      setWastes(filtered);
      toast({
        title: "Filtro aplicado",
        description: `Mostrando residuos de tipo: ${type}`,
      });
    } else {
      setWastes(getAllWastes());
      toast({
        title: "Filtros eliminados",
        description: "Mostrando todos los residuos",
      });
    }
  };

  const handlePublishClick = () => {
    navigate('/publish');
  };

  const handleWasteClick = (waste: Waste) => {
    navigate(`/waste/${waste.id}`);
  };

  const toggleRouteMode = () => {
    setShowRouteTools(!showRouteTools);
    toast({
      title: showRouteTools ? "Modo ruta desactivado" : "Modo ruta activado",
      description: showRouteTools ? 
        "Ya no estás en modo planificación de ruta" : 
        "Selecciona residuos para crear una ruta óptima",
      variant: "default",
    });
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full bg-background">
      <Map 
        onMarkerClick={handleWasteClick}
        showRouteTools={showRouteTools}
      />
      
      {/* Map controls - Panel de controles superior */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap">
        <Card className="bg-white/90 backdrop-blur-sm shadow-md p-1 flex gap-2">
          <Button 
            variant={selectedType ? "default" : "secondary"} 
            size="sm"
            onClick={() => handleFilterClick(selectedType ? null : 'plastic')}
          >
            <Filter className="mr-2 h-4 w-4" />
            {selectedType ? `${selectedType}` : 'Filtrar'}
          </Button>
          
          <Button 
            variant={showRouteTools ? "default" : "secondary"} 
            size="sm"
            onClick={toggleRouteMode}
          >
            <Route className="mr-2 h-4 w-4" />
            {showRouteTools ? 'Desactivar ruta' : 'Crear ruta'}
          </Button>
        </Card>
      </div>
      
      {/* Publish button - Botón de publicar */}
      <div className="absolute bottom-24 right-4 z-10">
        <Button 
          onClick={handlePublishClick}
          size="lg" 
          className="rounded-full w-14 h-14 shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Clear filters button - Botón para limpiar filtros */}
      {selectedType && (
        <div className="absolute top-20 left-4 z-10">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 shadow-md"
            onClick={() => handleFilterClick(null)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Limpiar filtro
          </Button>
        </div>
      )}
    </div>
  );
};

export default MapView;
