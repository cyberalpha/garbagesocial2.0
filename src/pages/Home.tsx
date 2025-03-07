
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Waste } from "@/types";
import { MapPin, Upload, Filter } from "lucide-react";
import { getAllWastes } from "@/services/mockData";
import Hero from "@/components/Hero";
import WasteCard from "@/components/WasteCard";
import Footer from "@/components/Footer";

const Home = () => {
  const navigate = useNavigate();
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_progress' | 'collected'>('all');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    // Simular carga de datos
    const timer = setTimeout(() => {
      const fetchedWastes = getAllWastes();
      setWastes(fetchedWastes);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleNavigateToPublish = () => {
    navigate('/publish');
  };
  
  const handleNavigateToMap = () => {
    navigate('/map');
  };
  
  const handleWasteClick = (wasteId: string) => {
    navigate(`/waste/${wasteId}`);
  };
  
  // Filtrar los residuos según la pestaña activa
  const filteredWastes = wastes.filter(waste => {
    if (activeTab === 'all') return true;
    return waste.status === activeTab;
  });
  
  // Obtener wastes destacados
  const featuredWastes = wastes.slice(0, 3);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      
      <main className="flex-grow container mx-auto py-8 px-4 md:px-6">
        {/* Sección de acciones */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Button 
            className="flex-1 h-auto py-6 bg-primary/90 hover:bg-primary"
            onClick={handleNavigateToPublish}
          >
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 mb-2" />
              <span className="text-lg font-medium">Publicar Residuo</span>
              <span className="text-xs mt-1 text-white/80">
                Comparte tus desechos para reciclar
              </span>
            </div>
          </Button>
          
          <Button 
            variant="outline"
            className="flex-1 h-auto py-6 border-primary/20"
            onClick={handleNavigateToMap}
          >
            <div className="flex flex-col items-center">
              <MapPin className="h-8 w-8 mb-2 text-primary" />
              <span className="text-lg font-medium">Ver Mapa</span>
              <span className="text-xs mt-1 text-muted-foreground">
                Encuentra residuos para recolectar
              </span>
            </div>
          </Button>
        </div>
        
        {/* Residuos destacados */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Publicaciones Recientes</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="h-80 animate-pulse">
                  <CardContent className="p-0">
                    <div className="h-40 bg-gray-200 rounded-t-lg" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-5/6" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredWastes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredWastes.map(waste => (
                <WasteCard 
                  key={waste.id} 
                  waste={waste} 
                  onClick={() => handleWasteClick(waste.id)} 
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No hay publicaciones para mostrar
              </p>
              <Button onClick={handleNavigateToPublish}>
                <Upload className="mr-2 h-4 w-4" />
                Publicar mi primer residuo
              </Button>
            </Card>
          )}
          
          {featuredWastes.length > 0 && (
            <div className="text-center mt-6">
              <Button variant="outline" onClick={handleNavigateToMap}>
                Ver todas las publicaciones
              </Button>
            </div>
          )}
        </section>
        
        {/* Lista completa de residuos */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Todos los Residuos</h2>
            <Button variant="ghost" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
          </div>
          
          <Tabs 
            defaultValue="all" 
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as any)}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pending">Pendientes</TabsTrigger>
              <TabsTrigger value="in_progress">En Proceso</TabsTrigger>
              <TabsTrigger value="collected">Recolectados</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 gap-4 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="h-24">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/3" />
                          <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                        <div className="h-8 w-8 bg-gray-200 rounded-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredWastes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredWastes.map(waste => (
                    <WasteCard 
                      key={waste.id} 
                      waste={waste} 
                      onClick={() => handleWasteClick(waste.id)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    No hay residuos {activeTab !== 'all' ? `con estado "${activeTab}"` : ''} para mostrar
                  </p>
                  <Button onClick={handleNavigateToPublish}>
                    <Upload className="mr-2 h-4 w-4" />
                    Publicar un residuo
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
