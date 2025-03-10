
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { User, Waste } from "@/types";
import { ArrowLeft } from "lucide-react";
import { getUserById, getWastesByUserId } from "@/services/users";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { transformSupabaseWaste } from '@/services/wastes/utils';

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
    
    setLoading(true);

    const loadProfileData = async () => {
      try {
        console.log('Obteniendo datos del usuario con ID:', userId);
        
        // Si el ID del perfil corresponde al usuario actual, usarlo directamente
        if (currentUser && currentUser.id === userId) {
          console.log('Usando datos del usuario actual:', currentUser);
          setUser(currentUser);
        } else {
          // Try to get user data directly from Supabase
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          
          if (profileError) {
            console.error('Error fetching profile from Supabase:', profileError);
            // Fallback to our service
            const userData = await getUserById(userId);
            
            if (userData) {
              console.log('Datos del usuario encontrados desde servicio:', userData);
              setUser(userData);
            } else {
              console.error('No se encontraron datos para el usuario con ID:', userId);
              toast({
                title: "Error",
                description: "Usuario no encontrado",
                variant: "destructive"
              });
            }
          } else if (profileData) {
            console.log('Profile found in Supabase:', profileData);
            // Convert Supabase profile to User format
            const userData: User = {
              id: profileData.id,
              name: profileData.name || 'Usuario',
              email: profileData.email || '',
              isOrganization: profileData.is_organization || false,
              averageRating: profileData.average_rating || 0,
              profileImage: profileData.profile_image || '',
              emailVerified: true,
              active: true
            };
            setUser(userData);
          } else {
            // Fallback to our service if no profile found in Supabase
            const userData = await getUserById(userId);
            
            if (userData) {
              console.log('Datos del usuario encontrados desde servicio:', userData);
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
        }
        
        // Get user's wastes from Supabase
        try {
          const { data: wasteData, error: wasteError } = await supabase
            .from('wastes')
            .select('*')
            .eq('user_id', userId);
          
          if (wasteError) {
            console.error('Error fetching wastes from Supabase:', wasteError);
            // Fallback to our service
            const userWastes = await getWastesByUserId(userId);
            console.log('Residuos del usuario encontrados desde servicio:', userWastes);
            setWastes(userWastes);
          } else if (wasteData) {
            console.log('Wastes found in Supabase:', wasteData);
            // Transform Supabase waste format to our application's Waste type
            const transformedWastes = wasteData.map(waste => transformSupabaseWaste(waste));
            setWastes(transformedWastes);
          }
        } catch (wasteErr) {
          console.error('Error getting wastes:', wasteErr);
          // Fallback to our service
          const userWastes = await getWastesByUserId(userId);
          console.log('Residuos del usuario encontrados desde servicio:', userWastes);
          setWastes(userWastes);
        }
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
      
      <UserProfile user={user} isEditable={currentUser && user?.id === currentUser?.id} wastes={wastes} />
    </div>
  );
};

export default Profile;
