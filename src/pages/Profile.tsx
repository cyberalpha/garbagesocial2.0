
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { User, Waste } from "@/types";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { getUserById, getWastesByUserId } from "@/services/users";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { transformSupabaseWaste } from '@/services/wastes/utils';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { offlineMode } from '@/integrations/supabase/client';
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const loadingTimeoutRef = useRef<number | null>(null);
  
  // Función para cargar los residuos de un usuario
  const loadUserWastes = useCallback(async (userId: string) => {
    try {
      if (!userId) return [];
      
      console.log(`Cargando residuos para usuario: ${userId}`);
      
      // En modo offline, siempre usar la memoria local para mayor estabilidad
      const userWastes = await getWastesByUserId(userId);
      return userWastes;
      
    } catch (error) {
      console.error(`Error al cargar residuos para el usuario ${userId}:`, error);
      return [];
    }
  }, []);
  
  // Función para cargar el perfil de usuario
  const loadUserProfile = useCallback(async (profileId: string): Promise<User | null> => {
    try {
      if (!profileId) return null;
      
      console.log(`Cargando perfil para usuario: ${profileId}`);
      
      // Si el perfil es del usuario actual, usar esos datos directamente
      if (currentUser && currentUser.id === profileId) {
        console.log('Usando datos del usuario actual para el perfil');
        return currentUser;
      }
      
      // Siempre usar la memoria local para mayor estabilidad
      return await getUserById(profileId);
      
    } catch (error) {
      console.error(`Error al cargar perfil para el usuario ${profileId}:`, error);
      return null;
    }
  }, [currentUser]);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadProfileData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);
        
        // Verificar si el usuario está autenticado
        if (!currentUser && !id) {
          console.log('No hay usuario autenticado y no se especificó ID, redirigiendo a login');
          navigate('/login');
          return;
        }
        
        const userId = id || (currentUser?.id ?? '');
        
        if (!userId) {
          console.error('No se pudo obtener un ID de usuario válido');
          if (isMounted) {
            setError("No se pudo obtener un ID de usuario válido");
            setLoading(false);
          }
          return;
        }
        
        console.log('Cargando datos para el perfil con ID:', userId);
        
        // Cargar datos del usuario (con caché si es offline)
        const userData = await loadUserProfile(userId);
        
        if (!userData) {
          if (isMounted) {
            setError('Usuario no encontrado o perfil desactivado');
            setLoading(false);
          }
          return;
        }
        
        if (isMounted) {
          setUser(userData);
          
          // Cargar los residuos del usuario (también con caché si es offline)
          const userWastes = await loadUserWastes(userId);
          
          // Configurar un tiempo mínimo de carga para evitar parpadeos
          // Asegurar que la interfaz de carga se muestre al menos por 800ms
          const loadingStartTime = Date.now();
          const minLoadingTime = 800; // milisegundos
          const timeElapsed = Date.now() - loadingStartTime;
          
          if (timeElapsed < minLoadingTime) {
            loadingTimeoutRef.current = window.setTimeout(() => {
              if (isMounted) {
                setWastes(userWastes);
                setLoading(false);
              }
            }, minLoadingTime - timeElapsed);
          } else {
            setWastes(userWastes);
            setLoading(false);
          }
        }
      } catch (error: any) {
        console.error('Error al cargar los datos del perfil:', error);
        if (isMounted) {
          setError(error.message || "Error al cargar los datos del perfil");
          setLoading(false);
        }
      }
    };
    
    loadProfileData();
    
    return () => {
      isMounted = false;
      if (loadingTimeoutRef.current !== null) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [id, currentUser, navigate, loadUserProfile, loadUserWastes]);
  
  if (loading) {
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
        
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }
  
  if (error) {
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
        
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <div className="text-center mt-8">
          <Button onClick={() => navigate('/')}>Ir al inicio</Button>
        </div>
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
