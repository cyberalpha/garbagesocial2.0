import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Waste, WasteType } from "@/types";
import Hero from "@/components/Hero";
import WasteCard from "@/components/WasteCard";
import Footer from "@/components/Footer";
import { getAllWastes } from "@/services/mockData";
import { MapPin, Plus, Filter } from "lucide-react";

const wasteTypeLabels: Record<WasteType, string> = {
  organic: 'Orgánico',
  paper: 'Papel',
  glass: 'Vidrio',
  plastic: 'Plástico',
  metal: 'Metal',
  sanitary: 'Sanitario',
  dump: 'Basural',
  various: 'Varios'
};

const Home = () => {
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<WasteType | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get all wastes
    const allWastes = getAllWastes();
    setWastes(allWastes);
    setLoading(false);
  }, []);
  
  const handleFilterClick = (type: WasteType | null) => {
    setSelectedType(type);
    if (type) {
      const filtered = getAllWastes().filter(waste => waste.type === type);
      setWastes(filtered);
    } else {
      setWastes(getAllWastes());
    }
  };
  
  const wasteTypes: WasteType[] = [
    'organic', 'paper', 'glass', 'plastic', 
    'metal', 'sanitary', 'dump', 'various'
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Hero />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Residuos Recientes</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/map')}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Ver Mapa
            </Button>
            <Button 
              onClick={() => navigate('/publish')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Publicar
            </Button>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            <Button 
              variant={selectedType === null ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterClick(null)}
            >
              Todos
            </Button>
            
            {wasteTypes.map(type => (
              <Button 
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                className={selectedType === type ? `bg-waste-${type}` : ""}
                onClick={() => handleFilterClick(type)}
              >
                {wasteTypeLabels[type]}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Wastes List */}
        {loading ? (
          <div className="text-center py-8">
            <p>Cargando residuos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wastes.length > 0 ? (
              wastes.map(waste => (
                <Card key={waste.id} className="h-full">
                  <CardContent className="p-4 h-full">
                    <WasteCard 
                      waste={waste} 
                      onClick={() => navigate(`/waste/${waste.id}`)} 
                    />
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">
                  No hay residuos para mostrar
                </p>
                {selectedType && (
                  <Button 
                    variant="link"
                    onClick={() => handleFilterClick(null)}
                    className="mt-2"
                  >
                    Quitar filtro
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Home;
