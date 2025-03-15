
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Waste } from '@/types';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from 'lucide-react';
import WasteCard from '@/components/WasteCard';

interface WasteTabsProps {
  wastes: Waste[];
  isEditable: boolean;
}

const WasteTabs = ({ wastes, isEditable }: WasteTabsProps) => {
  const [activeTab, setActiveTab] = useState('published');
  
  // Usar useMemo para filtrar los residuos solo cuando cambia la lista o la pestaña activa
  const filteredWastes = useMemo(() => {
    console.log(`Filtrando residuos, tab: ${activeTab}, cantidad: ${wastes.length}`);
    
    if (!wastes || wastes.length === 0) {
      return [];
    }
    
    return wastes.filter(waste => {
      switch (activeTab) {
        case 'published':
          return true;
        case 'pending':
          return waste.status === 'pending';
        case 'collected':
          return waste.status === 'collected';
        default:
          return true;
      }
    });
  }, [wastes, activeTab]);
  
  return (
    <Tabs defaultValue="published" onValueChange={setActiveTab}>
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="published">Todos ({wastes.length})</TabsTrigger>
        <TabsTrigger value="pending">
          Pendientes ({wastes.filter(w => w.status === 'pending').length})
        </TabsTrigger>
        <TabsTrigger value="collected">
          Recolectados ({wastes.filter(w => w.status === 'collected').length})
        </TabsTrigger>
      </TabsList>
      
      {['published', 'pending', 'collected'].map(tab => (
        <TabsContent key={tab} value={tab} className="mt-6">
          {filteredWastes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWastes.map(waste => (
                <WasteCard 
                  key={waste.id} 
                  waste={waste} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-gray-400 mb-2">
                No hay residuos {tab === 'pending' ? 'pendientes' : 
                  tab === 'collected' ? 'recolectados' : ''}
              </div>
              {isEditable && (
                <Button variant="outline" asChild>
                  <Link to="/publish">
                    <Upload className="h-4 w-4 mr-2" />
                    Publicar Residuo
                  </Link>
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default WasteTabs;
