import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Waste, User, WasteStatus } from "@/types";
import { ArrowLeft, MapPin, Clock, User as UserIcon, Check, X } from "lucide-react";
import { getWasteById, getUserById, getCurrentUser } from "@/services/mockData";
import Map from "@/components/Map";
import { toast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusColors: Record<WasteStatus, string> = {
  pending: 'bg-yellow-500',
  in_progress: 'bg-blue-500',
  collected: 'bg-green-500',
  canceled: 'bg-red-500'
};

const statusLabels: Record<WasteStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En proceso',
  collected: 'Recolectado',
  canceled: 'Cancelado'
};

const WasteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [waste, setWaste] = useState<Waste | null>(null);
  const [publisher, setPublisher] = useState<User | null>(null);
  const [recycler, setRecycler] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser] = useState(getCurrentUser());
  
  useEffect(() => {
    if (id) {
      // Get waste data
      const wasteData = getWasteById(id);
      if (wasteData) {
        setWaste(wasteData);
        
        // Get publisher data
        const publisherData = getUserById(wasteData.userId);
        if (publisherData) {
          setPublisher(publisherData);
        }
        
        // Get recycler data if exists
        if (wasteData.pickupCommitment?.recyclerId) {
          const recyclerData = getUserById(wasteData.pickupCommitment.recyclerId);
          if (recyclerData) {
            setRecycler(recyclerData);
          }
        }
      }
    }
    setLoading(false);
  }, [id]);
  
  const handleCommitToCollect = () => {
    if (!waste) return;
    
    // Update waste status (would be an API call in a real app)
    const updatedWaste = {
      ...waste,
      status: 'in_progress' as WasteStatus,
      pickupCommitment: {
        recyclerId: currentUser.id,
        commitmentDate: new Date()
      }
    };
    
    // Update state
    setWaste(updatedWaste);
    setRecycler(currentUser);
    
    // Show success message
    toast({
      title: "Compromiso registrado",
      description: "Te has comprometido a recolectar este residuo",
    });
  };
  
  const handleMarkAsCollected = () => {
    if (!waste) return;
    
    // Update waste status (would be an API call in a real app)
    const updatedWaste = {
      ...waste,
      status: 'collected' as WasteStatus
    };
    
    // Update state
    setWaste(updatedWaste);
    
    // Show success message
    toast({
      title: "Residuo recolectado",
      description: "Has marcado este residuo como recolectado",
    });
  };
  
  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl py-8 px-4 text-center">
        <p>Cargando detalles...</p>
      </div>
    );
  }
  
  if (!waste || !publisher) {
    return (
      <div className="container mx-auto max-w-2xl py-8 px-4 text-center">
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
  
  const isCurrentUserPublisher = currentUser.id === waste?.userId;
  const isCurrentUserRecycler = waste?.pickupCommitment?.recyclerId === currentUser.id;
  const canCommitToCollect = currentUser.role === 'recycler' && waste?.status === 'pending';
  const canMarkAsCollected = isCurrentUserRecycler && waste?.status === 'in_progress';
  
  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Detalles del Residuo</CardTitle>
            <Badge className={statusColors[waste.status]}>
              {statusLabels[waste.status]}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Waste Image */}
          {waste.imageUrl && (
            <div className="rounded-md overflow-hidden h-64 w-full">
              <img 
                src={waste.imageUrl} 
                alt={waste.description} 
                className="h-full w-full object-cover"
              />
            </div>
          )}
          
          {/* Waste Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Descripción</h3>
              <p>{waste.description}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Tipo</h3>
              <Badge variant="outline" className={`bg-waste-${waste.type} text-white`}>
                {waste.type.charAt(0).toUpperCase() + waste.type.slice(1)}
              </Badge>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Fecha de publicación</h3>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {format(waste.publicationDate, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Publicado por</h3>
              <div className="flex items-center mt-2">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={publisher.profileImage} />
                  <AvatarFallback>{publisher.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{publisher.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {publisher.isOrganization ? 'Organización' : 'Particular'}
                  </p>
                </div>
              </div>
            </div>
            
            {recycler && (
              <div>
                <h3 className="text-lg font-medium">Reciclador</h3>
                <div className="flex items-center mt-2">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={recycler.profileImage} />
                    <AvatarFallback>{recycler.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{recycler.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {recycler.isOrganization ? 'Organización' : 'Particular'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Map */}
          <div className="h-64 rounded-md overflow-hidden">
            <Map 
              wastes={[waste]}
              center={{ 
                lat: waste.location.coordinates[1], 
                lng: waste.location.coordinates[0] 
              }}
              zoom={15}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {canCommitToCollect && (
            <Button onClick={handleCommitToCollect} className="w-full">
              <Check className="mr-2 h-4 w-4" />
              Comprometerme a recolectar
            </Button>
          )}
          
          {canMarkAsCollected && (
            <Button onClick={handleMarkAsCollected} className="w-full">
              <Check className="mr-2 h-4 w-4" />
              Marcar como recolectado
            </Button>
          )}
          
          {!canCommitToCollect && !canMarkAsCollected && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Ver en el mapa
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default WasteDetail;
