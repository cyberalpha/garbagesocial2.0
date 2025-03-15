
import { useState, useEffect, useCallback } from 'react';
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

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Función para cargar los residuos de un usuario
  const loadUserWastes = useCallback(async (userId: string) => {
    try {
      if (!userId) return [];
      
      console.log(`Cargando residuos para usuario: ${userId}`);
      
      if (offlineMode()) {
        // En modo offline, intentar usar la memoria local primero
        const userWastes = await getWastesByUserId(userId);
        return userWastes;
      }
      
      // Intentar obtener datos de Supabase directamente
      const { data: wasteData, error: wasteError } = await supabase
        .from('wastes')
        .select('*')
        .eq('user_id', userId);
      
      if (wasteError) {
        console.error('Error fetching wastes from Supabase:', wasteError);
        throw wasteError;
      }
      
      if (wasteData && wasteData.length > 0) {
        console.log(`Encontrados ${wasteData.length} residuos para el usuario ${userId}`);
        return wasteData.map(transformSupabaseWaste);
      }
      
      // Si no hay datos en Supabase, usar el servicio como respaldo
      return await getWastesByUserId(userId);
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
      
      // Si estamos en modo offline, intentar obtener de la memoria local
      if (offlineMode()) {
        return await getUserById(profileId);
      }
      
      // Intentar obtener de Supabase directamente
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error al obtener perfil de Supabase:', profileError);
        throw profileError;
      }
      
      if (profileData) {
        // Verificar si el perfil está desactivado
        if (profileData.name && profileData.name.startsWith('DELETED_')) {
          console.log('Este perfil ha sido desactivado');
          return null;
        }
        
        return {
          id: profileData.id,
          name: profileData.name || 'Usuario',
          email: profileData.email || '',
          isOrganization: profileData.is_organization || false,
          averageRating: profileData.average_rating || 0,
          profileImage: profileData.profile_image || '',
          emailVerified: true,
          active: true
        };
      }
      
      // Como último recurso, usar el servicio
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
          setWastes(userWastes);
          setLoading(false);
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
    };
  }, [id, currentUser, navigate, loadUserProfile, loadUserWastes]);
  
  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl py-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
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
