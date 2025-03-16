
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Waste } from '@/types';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from 'lucide-react';
import WasteCard from '@/components/WasteCard';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';
import { Skeleton } from "@/components/ui/skeleton";

interface WasteTabsProps {
  wastes: Waste[];
  isEditable: boolean;
}

const WasteTabs = ({ wastes, isEditable }: WasteTabsProps) => {
  const [activeTab, setActiveTab] = useState('published');
  const [localWastes, setLocalWastes] = useState<Waste[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOfflineMode } = useSupabaseConnection();
  
  // Simular un tiempo de carga mínimo para evitar parpadeos
  useEffect(() => {
    let isComponentMounted = true;
    
    const loadWastes = async () => {
      // Forzar un tiempo mínimo de carga para estabilizar la interfaz
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 800));
      
      // Esperar a que los residuos estén disponibles y haya pasado el tiempo mínimo
      await minLoadTime;
      
      if (isComponentMounted) {
        setLocalWastes(wastes);
        setIsLoading(false);
      }
    };
    
    setIsLoading(true);
    loadWastes();
    
    return () => {
      isComponentMounted = false;
    };
  }, [wastes]);
  
  // Cuenta de residuos memoizada para evitar recálculos
  const wasteCounts = useMemo(() => {
    const total = localWastes.length;
    const pending = localWastes.filter(w => w.status === 'pending').length;
    const collected = localWastes.filter(w => w.status === 'collected').length;
    
    return { total, pending, collected };
  }, [localWastes]);
  
  // Usar useMemo para filtrar los residuos solo cuando cambia la lista local o la pestaña activa
  const filteredWastes = useMemo(() => {
    if (!localWastes || localWastes.length === 0) {
      return [];
    }
    
    return localWastes.filter(waste => {
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
  }, [localWastes, activeTab]);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <Tabs defaultValue="published" onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full grid grid-cols-3 mb-4">
        <TabsTrigger value="published">
          Todos ({wasteCounts.total})
        </TabsTrigger>
        <TabsTrigger value="pending">
          Pendientes ({wasteCounts.pending})
        </TabsTrigger>
        <TabsTrigger value="collected">
          Recolectados ({wasteCounts.collected})
        </TabsTrigger>
      </TabsList>
      
      {['published', 'pending', 'collected'].map(tab => (
        <TabsContent key={tab} value={tab} className="mt-6 min-h-[200px]">
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
