
import { useState, useEffect } from 'react';
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

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadProfileData = async () => {
      try {
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
          setError("No se pudo obtener un ID de usuario válido");
          setLoading(false);
          return;
        }
        
        console.log('Cargando perfil para ID:', userId);
        
        let userData: User | null = null;
        
        // Si el ID del perfil corresponde al usuario actual, usarlo directamente
        if (currentUser && currentUser.id === userId) {
          console.log('Usando datos del usuario actual:', currentUser);
          userData = currentUser;
        } else {
          // Intentar obtener datos del usuario de Supabase
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          
          if (profileError) {
            console.error('Error fetching profile from Supabase:', profileError);
            throw new Error('Error al obtener el perfil: ' + profileError.message);
          } 
          
          if (profileData) {
            console.log('Profile found in Supabase:', profileData);
            
            // Verificar si el perfil está desactivado
            if (profileData.name && profileData.name.startsWith('DELETED_')) {
              setError("Este perfil ha sido desactivado");
              setLoading(false);
              return;
            }
            
            // Convert Supabase profile to User format
            userData = {
              id: profileData.id,
              name: profileData.name || 'Usuario',
              email: profileData.email || '',
              isOrganization: profileData.is_organization || false,
              averageRating: profileData.average_rating || 0,
              profileImage: profileData.profile_image || '',
              emailVerified: true,
              active: true
            };
          } else {
            // Fallback to service
            try {
              userData = await getUserById(userId);
              
              if (!userData) {
                throw new Error('Usuario no encontrado');
              }
            } catch (getUserError) {
              console.error('Error al obtener usuario por ID:', getUserError);
              throw new Error('Usuario no encontrado');
            }
          }
        }
        
        if (!userData) {
          throw new Error('No se encontraron datos para el usuario');
        }
        
        setUser(userData);
        
        // Get user's wastes from Supabase
        try {
          const { data: wasteData, error: wasteError } = await supabase
            .from('wastes')
            .select('*')
            .eq('user_id', userId);
          
          if (wasteError) {
            console.error('Error fetching wastes from Supabase:', wasteError);
            // No throw here, just log and continue
            toast({
              title: "Advertencia",
              description: "No se pudieron cargar los residuos del usuario",
              variant: "destructive"
            });
          } else if (wasteData && wasteData.length > 0) {
            console.log('Wastes found in Supabase:', wasteData);
            // Transform Supabase waste format to our application's Waste type
            const transformedWastes = wasteData.map(waste => transformSupabaseWaste(waste));
            setWastes(transformedWastes);
          } else {
            // Fallback to service
            try {
              const userWastes = await getWastesByUserId(userId);
              setWastes(userWastes);
            } catch (getWastesError) {
              console.error('Error getting wastes from service:', getWastesError);
              // Show toast but don't block profile display
              toast({
                title: "Advertencia",
                description: "No se pudieron cargar los residuos del usuario",
                variant: "destructive"
              });
            }
          }
        } catch (wasteErr) {
          console.error('Error getting wastes:', wasteErr);
          // We don't throw here to avoid blocking profile display if wastes fail
          toast({
            title: "Advertencia",
            description: "No se pudieron cargar los residuos del usuario",
            variant: "destructive"
          });
        }
      } catch (error: any) {
        console.error('Error al cargar los datos del perfil:', error);
        setError(error.message || "Error al cargar los datos del perfil");
      } finally {
        setLoading(false);
      }
    };
    
    loadProfileData();
  }, [id, currentUser, navigate, toast]);
  
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
