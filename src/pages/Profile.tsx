import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserProfile from "@/components/UserProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Waste } from "@/types";
import { ArrowLeft } from "lucide-react";
import { getUserById, getWastesByUserId } from "@/services/mockData";
import WasteCard from "@/components/WasteCard";

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      // Get user data
      const userData = getUserById(id);
      if (userData) {
        setUser(userData);
        
        // Get user's wastes
        const userWastes = getWastesByUserId(id);
        setWastes(userWastes);
      }
    }
    setLoading(false);
  }, [id]);
  
  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl py-8 px-4 text-center">
        <p>Cargando perfil...</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto max-w-2xl py-8 px-4 text-center">
        <p>Usuario no encontrado</p>
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
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>
      
      <UserProfile user={user} />
      
      <div className="mt-8">
        <Tabs defaultValue="published">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="published">Publicaciones</TabsTrigger>
            <TabsTrigger value="collected">Recolecciones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="published" className="mt-4">
            {wastes.length > 0 ? (
              <div className="space-y-4">
                {wastes.map(waste => (
                  <Card key={waste.id}>
                    <CardContent className="p-4">
                      <WasteCard 
                        waste={waste} 
                        onClick={() => navigate(`/waste/${waste.id}`)} 
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No hay publicaciones para mostrar
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="collected" className="mt-4">
            <p className="text-center py-8 text-muted-foreground">
              No hay recolecciones para mostrar
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
