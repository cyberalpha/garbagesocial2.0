import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from "@/components/Map";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Waste, WasteType } from "@/types";
import { getAllWastes } from "@/services/mockData";
import { MapPin, Filter, Plus } from "lucide-react";
import useGeolocation from "@/hooks/useGeolocation";
import WasteCard from "@/components/WasteCard";

const MapView = () => {
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [selectedWaste, setSelectedWaste] = useState<Waste | null>(null);
  const [selectedType, setSelectedType] = useState<WasteType | null>(null);
  const { coordinates, loading, error } = useGeolocation();
  const navigate = useNavigate();

  useEffect(() => {
    const allWastes = getAllWastes();
    setWastes(allWastes);
  }, []);

  const handleWasteClick = (waste: Waste) => {
    setSelectedWaste(waste);
  };

  const handleFilterClick = (type: WasteType | null) => {
    setSelectedType(type);
    if (type) {
      const filtered = getAllWastes().filter(waste => waste.type === type);
      setWastes(filtered);
    } else {
      setWastes(getAllWastes());
    }
  };

  const handlePublishClick = () => {
    navigate('/publish');
  };

  return (
    <div className="relative h-screen w-full">
      <Map 
        wastes={wastes}
        userLocation={coordinates ? { lat: coordinates.latitude, lng: coordinates.longitude } : undefined}
        onWasteClick={handleWasteClick}
      />
      
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="secondary" 
          size="sm" 
          className="bg-white shadow-md"
          onClick={() => handleFilterClick(selectedType ? null : 'plastic')}
        >
          <Filter className="mr-2 h-4 w-4" />
          {selectedType ? `Filtrando: ${selectedType}` : 'Filtrar'}
        </Button>
      </div>
      
      <div className="absolute bottom-24 right-4 z-10">
        <Button 
          onClick={handlePublishClick}
          size="lg" 
          className="rounded-full w-14 h-14 shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
      
      {selectedWaste && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <WasteCard waste={selectedWaste} onClick={() => navigate(`/waste/${selectedWaste.id}`)} />
            </CardContent>
          </Card>
        </div>
      )}
      
      {coordinates && (
        <div className="absolute bottom-24 left-4 z-10">
          <Button variant="outline" size="sm" className="bg-white shadow-md">
            <MapPin className="mr-2 h-4 w-4 text-blue-500" />
            Mi ubicación
          </Button>
        </div>
      )}
      
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
