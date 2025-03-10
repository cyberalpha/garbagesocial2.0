
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
    
    const userId = id || (currentUser?.id ?? '');
    console.log("Cargando perfil para ID:", userId);
    
    if (!userId) {
      console.error('No se pudo obtener un ID de usuario válido');
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil. Intenta nuevamente.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }
    
    // También verificar si hay un usuario en el localStorage
    const storedUserData = localStorage.getItem('auth_user_data');
    let storedUser: User | null = null;
    
    if (storedUserData) {
      try {
        storedUser = JSON.parse(storedUserData);
        console.log("Usuario encontrado en localStorage:", storedUser);
      } catch (error) {
        console.error("Error al parsear usuario del localStorage:", error);
      }
    }
    
    setLoading(true);

    const loadProfileData = async () => {
      try {
        console.log('Obteniendo datos del usuario con ID:', userId);
        
        // Si el ID del perfil corresponde al usuario actual o al usuario almacenado, usarlo directamente
        if (currentUser && currentUser.id === userId) {
          console.log('Usando datos del usuario actual:', currentUser);
          setUser(currentUser);
        } else if (storedUser && storedUser.id === userId) {
          console.log('Usando datos del usuario almacenado:', storedUser);
          setUser(storedUser);
        } else {
          // Si no, obtener los datos del usuario desde el servicio
          const userData = await getUserById(userId);
          
          if (userData) {
            console.log('Datos del usuario encontrados:', userData);
            setUser(userData);
          } else {
            console.error('No se encontraron datos para el usuario con ID:', userId);
            toast({
              title: "Error",
              description: "Usuario no encontrado",
              variant: "destructive"
            });
          }
        }
        
        // Get user's wastes
        console.log('Buscando residuos del usuario con ID:', userId);
        const userWastes = await getWastesByUserId(userId);
        console.log('Residuos del usuario encontrados:', userWastes);
        setWastes(userWastes);
      } catch (error) {
        console.error('Error al cargar los datos del perfil:', error);
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
