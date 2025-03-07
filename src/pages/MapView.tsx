
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Waste, WasteType } from "@/types";
import { getAllWastes } from "@/services/mockData";
import { MapPin, Filter, Plus, Route } from "lucide-react";
import useGeolocation from "@/hooks/useGeolocation";
import WasteCard from "@/components/WasteCard";
import Map from "@/components/Map";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";

const MapView = () => {
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [selectedWaste, setSelectedWaste] = useState<Waste | null>(null);
  const [selectedType, setSelectedType] = useState<WasteType | null>(null);
  const [showRouteTools, setShowRouteTools] = useState(false);
  const { location, loading, error } = useGeolocation();
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
  }, [currentUser, navigate]);

  const handleWasteClick = (waste: Waste) => {
    setSelectedWaste(waste);
  };

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

  const handleNavigateToWaste = (wasteId: string) => {
    navigate(`/waste/${wasteId}`);
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
    <div className="relative h-screen w-full">
      <Map 
        initialOptions={{
          center: location ? location.coordinates : [-58.3816, -34.6037],
          zoom: 13
        }}
        onMarkerClick={handleWasteClick}
        showRouteTools={showRouteTools}
      />
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button 
          variant="secondary" 
          size="sm" 
          className="bg-white shadow-md"
          onClick={() => handleFilterClick(selectedType ? null : 'plastic')}
        >
          <Filter className="mr-2 h-4 w-4" />
          {selectedType ? `Filtrando: ${selectedType}` : 'Filtrar'}
        </Button>
        
        <Button 
          variant={showRouteTools ? "default" : "secondary"} 
          size="sm" 
          className={showRouteTools ? "shadow-md" : "bg-white shadow-md"}
          onClick={toggleRouteMode}
        >
          <Route className="mr-2 h-4 w-4" />
          {showRouteTools ? 'Desactivar ruta' : 'Planificar ruta'}
        </Button>
      </div>
      
      {/* Publish button */}
      <div className="absolute bottom-24 right-4 z-10">
        <Button 
          onClick={handlePublishClick}
          size="lg" 
          className="rounded-full w-14 h-14 shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Selected waste card */}
      {selectedWaste && !showRouteTools && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <WasteCard 
                waste={selectedWaste} 
                onClick={() => handleNavigateToWaste(selectedWaste.id)}
              />
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Location button */}
      {location && (
        <div className="absolute bottom-24 left-4 z-10">
          <Button variant="outline" size="sm" className="bg-white shadow-md">
            <MapPin className="mr-2 h-4 w-4 text-blue-500" />
            Mi ubicación
          </Button>
        </div>
      )}
      
      {/* Loading or error message */}
      {(loading || error) && (
        <div className="absolute top-16 left-0 right-0 mx-auto w-3/4 z-10 text-center">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              {loading && <p>Cargando mapa...</p>}
              {error && <p className="text-red-500">Error: {error}</p>}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MapView;
