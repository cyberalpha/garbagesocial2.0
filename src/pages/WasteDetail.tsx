import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Waste, User } from '../types';
import { getWasteById, commitToCollect } from '@/services/wastes';
import { getUserById } from '@/services/users';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import Map from "@/components/Map";
import { formatDate } from "@/utils/formatters";

// Import the new components
import StatusBadge from "@/components/waste-detail/StatusBadge";
import WasteHeaderInfo from "@/components/waste-detail/WasteHeaderInfo";
import WasteImageDisplay from "@/components/waste-detail/WasteImageDisplay";
import LocationInfo from "@/components/waste-detail/LocationInfo";
import PickupCommitmentInfo from "@/components/waste-detail/PickupCommitmentInfo";
import ActionButtons from "@/components/waste-detail/ActionButtons";
import UserCard from "@/components/waste-detail/UserCard";
import ActionTabs from "@/components/waste-detail/ActionTabs";

const WasteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [waste, setWaste] = useState<Waste | null>(null);
  const [publisher, setPublisher] = useState<User | null>(null);
  const [recycler, setRecycler] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [committing, setCommitting] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchWasteData = async () => {
      try {
        const wasteData = await getWasteById(id);
        if (wasteData) {
          setWaste(wasteData);
          
          // Get publisher data
          if (wasteData.userId) {
            const publisherData = getUserById(wasteData.userId);
            if (publisherData) {
              setPublisher(publisherData);
            }
          }
          
          // Get recycler data if available
          if (wasteData.pickupCommitment?.recyclerId) {
            const recyclerData = getUserById(wasteData.pickupCommitment.recyclerId);
            if (recyclerData) {
              setRecycler(recyclerData);
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar el residuo:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del residuo",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWasteData();
  }, [id]);
  
  const handleCommitToCollect = async () => {
    if (!waste) return;
    
    setCommitting(true);
    
    try {
      const updatedWaste = await commitToCollect(waste.id, "current-user-id");
      if (updatedWaste) {
        setWaste(updatedWaste);
        
        // Get recycler data
        if (updatedWaste.pickupCommitment?.recyclerId) {
          const recyclerData = getUserById(updatedWaste.pickupCommitment.recyclerId);
          if (recyclerData) {
            setRecycler(recyclerData);
          }
        }
        
        toast({
          title: "Compromiso registrado",
          description: "Te has comprometido a recoger este residuo",
        });
      }
    } catch (error) {
      console.error("Error al comprometerse:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el compromiso",
        variant: "destructive"
      });
    } finally {
      setCommitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Cargando detalles...</p>
      </div>
    );
  }
  
  if (!waste || !publisher) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Residuo no encontrado</p>
        <Button 
          variant="ghost" 
          className="mt-4" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl font-bold">{waste.description}</CardTitle>
                <StatusBadge status={waste.status} />
              </div>
              <WasteHeaderInfo waste={waste} formatDate={formatDate} />
            </CardHeader>
            
            <WasteImageDisplay imageUrl={waste.imageUrl} description={waste.description} />
            
            <CardContent className="pt-6 space-y-4">
              <div className="text-gray-700">{waste.description}</div>
              
              <LocationInfo location={waste.location} />
              
              {waste.pickupCommitment && (
                <PickupCommitmentInfo 
                  commitment={waste.pickupCommitment} 
                  recycler={recycler} 
                  formatDate={formatDate}
                />
              )}
            </CardContent>
            
            <CardFooter className="pt-0 pb-4">
              <ActionButtons 
                waste={waste} 
                committing={committing} 
                onCommit={handleCommitToCollect} 
              />
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-64">
              {waste && (
                <Map
                  initialOptions={{
                    center: waste.location.coordinates,
                    zoom: 15
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {publisher && (
            <UserCard user={publisher} title="Publicador" />
          )}
          
          {recycler && (
            <UserCard user={recycler} title="Reciclador" />
          )}
          
          <ActionTabs />
        </div>
      </div>
    </div>
  );
};

export default WasteDetail;
