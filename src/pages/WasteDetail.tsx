
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Waste, User } from '../types';
import { getWasteById, commitToCollect } from '@/services/wastes';
import { getUserById } from '@/services/users';
import { toast } from "@/hooks/use-toast";
import DetailHeader from '@/components/waste-detail/DetailHeader';
import DetailMainContent from '@/components/waste-detail/DetailMainContent';
import DetailMapSection from '@/components/waste-detail/DetailMapSection';
import DetailSidebar from '@/components/waste-detail/DetailSidebar';
import LoadingView from '@/components/waste-detail/LoadingView';
import NotFoundView from '@/components/waste-detail/NotFoundView';

const WasteDetail = () => {
  const { id } = useParams<{ id: string }>();
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
    return <LoadingView />;
  }
  
  if (!waste || !publisher) {
    return <NotFoundView />;
  }
  
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <DetailHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DetailMainContent 
            waste={waste} 
            recycler={recycler} 
            committing={committing} 
            onCommit={handleCommitToCollect} 
          />
          
          <DetailMapSection waste={waste} />
        </div>
        
        <DetailSidebar 
          publisher={publisher} 
          recycler={recycler} 
        />
      </div>
    </div>
  );
};

export default WasteDetail;
