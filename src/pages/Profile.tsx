
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Waste } from "@/types";
import { ArrowLeft } from "lucide-react";
import { getUserById, getWastesByUserId } from "@/services/users";
import WasteCard from "@/components/WasteCard";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (!currentUser && !id) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    
    const loadProfileData = async () => {
      try {
        // Si no hay ID, usar el usuario actual (si está autenticado)
        if (!id && currentUser) {
          console.log('Using current user data:', currentUser);
          setUser(currentUser);
          const userWastes = await getWastesByUserId(currentUser.id);
          setWastes(userWastes);
          setLoading(false);
          return;
        }
        
        // Si hay ID, buscar el usuario
        if (id) {
          console.log('Fetching user data for ID:', id);
          const userData = getUserById(id);
          
          if (userData) {
            console.log('User data found:', userData);
            setUser(userData);
            
            // Get user's wastes
            const userWastes = await getWastesByUserId(id);
            console.log('User wastes found:', userWastes);
            setWastes(userWastes);
          } else {
            console.log('No user data found for ID:', id);
            toast({
              title: "Error",
              description: "Usuario no encontrado",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        toast({
          title: "Error",
          description: "Error al cargar los datos del perfil",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadProfileData();
  }, [id, currentUser, navigate]);
  
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
  
  // Determinar si el perfil es editable (es el usuario actual)
  const isEditable = currentUser && user.id === currentUser.id;
  
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
      
      <UserProfile user={user} isEditable={isEditable} wastes={wastes} />
    </div>
  );
};

export default Profile;
