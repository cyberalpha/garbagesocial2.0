import { useState, useEffect, useRef } from 'react';
import useGeolocation from '../hooks/useGeolocation';
import { Waste, MapOptions } from '../types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MapMarker from './MapMarker';
import WasteCard from './WasteCard';
import { Locate, Layers, ZoomIn, ZoomOut, X } from 'lucide-react';

const sampleWastes: Waste[] = [
  {
    id: '1',
    userId: 'user123456789',
    type: 'plastic',
    description: 'Botellas de plástico',
    imageUrl: 'https://images.unsplash.com/photo-1605600659453-128bfdb3a5eb?w=600&auto=format&fit=crop',
    location: {
      type: 'Point',
      coordinates: [-58.3816, -34.6037]
    },
    publicationDate: new Date('2023-05-15T10:30:00'),
    status: 'pending'
  },
  {
    id: '2',
    userId: 'user987654321',
    type: 'paper',
    description: 'Cajas de cartón',
    imageUrl: 'https://images.unsplash.com/photo-1607625004976-fe1049860b6b?w=600&auto=format&fit=crop',
    location: {
      type: 'Point',
      coordinates: [-58.3712, -34.6083]
    },
    publicationDate: new Date('2023-05-14T14:45:00'),
    status: 'pending'
  },
  {
    id: '3',
    userId: 'user246813579',
    type: 'organic',
    description: 'Restos de poda',
    location: {
      type: 'Point',
      coordinates: [-58.3948, -34.6011]
    },
    publicationDate: new Date('2023-05-16T09:15:00'),
    status: 'in_progress',
    pickupCommitment: {
      recyclerId: 'recycler123',
      commitmentDate: new Date('2023-05-16T11:00:00')
    }
  }
];

interface MapProps {
  initialOptions?: Partial<MapOptions>;
  onMarkerClick?: (waste: Waste) => void;
}

const Map = ({ initialOptions, onMarkerClick }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { location, error, loading } = useGeolocation();
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [selectedWaste, setSelectedWaste] = useState<Waste | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  const [mapOptions, setMapOptions] = useState<MapOptions>({
    center: initialOptions?.center || [-58.3816, -34.6037],
    zoom: initialOptions?.zoom || 13
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setWastes(sampleWastes);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (location && !mapInitialized) {
      setMapOptions(prev => ({
        ...prev,
        center: location.coordinates
      }));
      setMapInitialized(true);
    }
  }, [location, mapInitialized]);

  const zoomIn = () => {
    setMapOptions(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom + 1, 18)
    }));
  };

  const zoomOut = () => {
    setMapOptions(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom - 1, 1)
    }));
  };

  const centerOnUser = () => {
    if (location) {
      setMapOptions(prev => ({
        ...prev,
        center: location.coordinates
      }));
    }
  };

  const handleMarkerClick = (waste: Waste) => {
    setSelectedWaste(waste);
    if (onMarkerClick) {
      onMarkerClick(waste);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[400px] bg-gray-100 rounded-lg overflow-hidden">
      <div 
        ref={mapRef} 
        className="w-full h-full bg-[#CCDAE6] relative"
        style={{
          backgroundImage: 'url("https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-58.3816,-34.6037,12,0/1200x800?access_token=pk.eyJ1IjoibG92YWJsZXRlc3QiLCJhIjoiY2xzaGx3NTQ3MDkycjJsbm9nNTR5b2ZiNCJ9.QANl9BQ-yV5sjQ6-hpYxXQ")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {wastes.map(waste => (
          <div 
            key={waste.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${50 + (waste.location.coordinates[0] - mapOptions.center[0]) * 5 * mapOptions.zoom}%`,
              top: `${50 - (waste.location.coordinates[1] - mapOptions.center[1]) * 5 * mapOptions.zoom}%`,
            }}
          >
            <MapMarker 
              waste={waste} 
              onClick={() => handleMarkerClick(waste)}
            />
          </div>
        ))}
        
        {location && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${50 + (location.coordinates[0] - mapOptions.center[0]) * 5 * mapOptions.zoom}%`,
              top: `${50 - (location.coordinates[1] - mapOptions.center[1]) * 5 * mapOptions.zoom}%`,
            }}
          >
            <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            </div>
          </div>
        )}
      </div>
      
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <Button variant="secondary" size="icon" onClick={zoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={zoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={centerOnUser}>
          <Locate className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon">
          <Layers className="h-4 w-4" />
        </Button>
      </div>
      
      {selectedWaste && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80">
          <Card className="shadow-lg relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 z-10"
              onClick={() => setSelectedWaste(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <WasteCard 
              waste={selectedWaste} 
              onCommit={(waste) => {
                console.log('Compromiso para retirar:', waste);
                // Aquí iría la lógica para registrar el compromiso
              }} 
            />
          </Card>
        </div>
      )}
      
      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white p-4 rounded-md shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm">Obteniendo ubicación...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
