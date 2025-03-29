
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Waste, WasteType } from "@/types";
import { getAllWastes, getWastesByType } from "@/services/wastes";
import { Filter, Plus, Route, Trash } from "lucide-react";
import Map from "@/components/Map";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import WasteTypeFilter from '@/components/map/WasteTypeFilter';
import DataSyncIndicator from '@/components/DataSyncIndicator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const MapView = () => {
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [selectedType, setSelectedType] = useState<WasteType | null>(null);
  const [showRouteTools, setShowRouteTools] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Verificar autenticación
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Cargar residuos de forma asíncrona
    loadWastes();
  }, [currentUser, navigate]);

  const loadWastes = async (type: WasteType | null = null) => {
    try {
      setIsLoading(true);
      console.log(`Cargando residuos${type ? ` de tipo ${type}` : ''}`);
      
      const loadedWastes = type 
        ? await getWastesByType(type) 
        : await getAllWastes();
      
      setWastes(loadedWastes);
      console.log("Residuos cargados:", loadedWastes.length);
    } catch (error) {
      console.error("Error al cargar residuos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los residuos. Intente de nuevo más tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = async (type: WasteType | null) => {
    setSelectedType(type);
    await loadWastes(type);
    
    if (type) {
      toast({
        title: "Filtro aplicado",
        description: `Mostrando residuos de tipo: ${type}`,
      });
    } else {
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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="relative h-[calc(100vh-8rem)] w-full bg-background mt-16">
        <Map 
          onMarkerClick={handleWasteClick}
          showRouteTools={showRouteTools}
        />
        
        {/* Map controls - Panel de controles superior */}
        <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap">
          <Card className="bg-white/90 backdrop-blur-sm shadow-md p-1 flex gap-2">
            <WasteTypeFilter
              selectedType={selectedType}
              onSelectType={handleFilterChange}
            />
            
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
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute top-16 left-4 z-10">
            <Card className="bg-white/90 p-2">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <span className="text-sm">Cargando...</span>
              </div>
            </Card>
          </div>
        )}
        
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
              onClick={() => handleFilterChange(null)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Limpiar filtro
            </Button>
          </div>
        )}
        
        {/* Sync indicator */}
        <DataSyncIndicator />
      </div>
      <Footer />
    </div>
  );
};

export default MapView;
