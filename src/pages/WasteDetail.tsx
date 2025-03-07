import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Waste, 
  User, 
  WasteStatus 
} from '../types';
import {
  getWasteById,
  getUserById,
  commitToCollect
} from '../services/mockData';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Clock, AlertCircle, Check, X, User as UserIcon, Star } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import Map from "@/components/Map";

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
    
    const wasteData = getWasteById(id);
    if (wasteData) {
      setWaste(wasteData);
      
      // Get publisher data
      const publisherData = getUserById(wasteData.userId);
      if (publisherData) {
        setPublisher(publisherData);
      }
      
      // Get recycler data if available
      if (wasteData.pickupCommitment?.recyclerId) {
        const recyclerData = getUserById(wasteData.pickupCommitment.recyclerId);
        if (recyclerData) {
          setRecycler(recyclerData);
        }
      }
    }
    
    setLoading(false);
  }, [id]);
  
  const handleCommitToCollect = () => {
    if (!waste) return;
    
    setCommitting(true);
    
    // Simulating API call
    setTimeout(() => {
      try {
        const updatedWaste = commitToCollect(waste.id, "current-user-id");
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
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo registrar el compromiso",
          variant: "destructive"
        });
      } finally {
        setCommitting(false);
      }
    }, 1000);
  };
  
  const getWasteTypeText = (type: string) => {
    switch(type) {
      case 'organic': return 'Orgánico';
      case 'paper': return 'Papel';
      case 'glass': return 'Vidrio';
      case 'plastic': return 'Plástico';
      case 'metal': return 'Metal';
      case 'sanitary': return 'Control Sanitario';
      case 'dump': return 'Basural';
      default: return 'Varios';
    }
  };
  
  const getWasteTypeColor = (type: string) => {
    switch(type) {
      case 'organic': return 'bg-waste-organic';
      case 'paper': return 'bg-waste-paper';
      case 'glass': return 'bg-waste-glass';
      case 'plastic': return 'bg-waste-plastic';
      case 'metal': return 'bg-waste-metal';
      case 'sanitary': return 'bg-waste-sanitary';
      case 'dump': return 'bg-waste-dump';
      default: return 'bg-waste-various';
    }
  };
  
  const getStatusText = (status: WasteStatus) => {
    switch(status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En proceso';
      case 'collected': return 'Retirado';
      case 'canceled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };
  
  const getStatusColor = (status: WasteStatus) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'collected': return 'bg-green-500';
      case 'canceled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(waste.status)} text-white`}
                >
                  {getStatusText(waste.status)}
                </Badge>
              </div>
              <CardDescription>
                <div className="flex items-center mt-1">
                  <Badge 
                    className={`${getWasteTypeColor(waste.type)} text-white mr-2`}
                  >
                    {getWasteTypeText(waste.type)}
                  </Badge>
                  <Clock className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-gray-500 text-sm">
                    Publicado el {formatDate(waste.publicationDate)}
                  </span>
                </div>
              </CardDescription>
            </CardHeader>
            
            {waste.imageUrl && (
              <CardContent className="p-0">
                <div className="h-72 overflow-hidden">
                  <img 
                    src={waste.imageUrl} 
                    alt={waste.description} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            )}
            
            <CardContent className="pt-6 space-y-4">
              <div className="text-gray-700">{waste.description}</div>
              
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>
                  Latitud: {waste.location.coordinates[1].toFixed(6)}, 
                  Longitud: {waste.location.coordinates[0].toFixed(6)}
                </span>
              </div>
              
              {waste.pickupCommitment && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium text-blue-800 mb-2">Compromiso de Retiro</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-blue-600 mr-2" />
                      <span>Fecha: {formatDate(waste.pickupCommitment.commitmentDate)}</span>
                    </div>
                    
                    {recycler && (
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 text-blue-600 mr-2" />
                        <span>Reciclador: {recycler.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="pt-0 pb-4">
              {waste.status === 'pending' && (
                <Button 
                  className="w-full"
                  disabled={committing}
                  onClick={handleCommitToCollect}
                >
                  {committing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Registrando compromiso...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Comprometerme a Retirar
                    </>
                  )}
                </Button>
              )}
              
              {waste.status === 'in_progress' && !waste.pickupCommitment?.recyclerId && (
                <div className="w-full flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar Compromiso
                  </Button>
                  <Button className="flex-1">
                    <Check className="mr-2 h-4 w-4" />
                    Confirmar Recolección
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-64">
              <Map
                initialOptions={{
                  center: waste.location.coordinates,
                  zoom: 15
                }}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publicador</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                onClick={() => navigate(`/profile/${publisher.id}`)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={publisher.profileImage} 
                    alt={publisher.name} 
                  />
                  <AvatarFallback>{publisher.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{publisher.name}</div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                    {publisher.averageRating.toFixed(1)}
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/profile/${publisher.id}`)}
              >
                Ver Perfil
              </Button>
            </CardContent>
          </Card>
          
          {recycler && (
            <Card>
              <CardHeader>
                <CardTitle>Reciclador</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div 
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                  onClick={() => navigate(`/profile/${recycler.id}`)}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={recycler.profileImage} 
                      alt={recycler.name} 
                    />
                    <AvatarFallback>{recycler.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{recycler.name}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      {recycler.averageRating.toFixed(1)}
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/profile/${recycler.id}`)}
                >
                  Ver Perfil
                </Button>
              </CardContent>
            </Card>
          )}
          
          <Tabs defaultValue="actions">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="actions">Acciones</TabsTrigger>
              <TabsTrigger value="ratings">Calificaciones</TabsTrigger>
            </TabsList>
            <TabsContent value="actions" className="p-2">
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-yellow-600"
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Reportar publicación
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar publicación
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="ratings" className="p-2">
              <p className="text-center text-gray-500 py-4">
                No hay calificaciones disponibles
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WasteDetail;
