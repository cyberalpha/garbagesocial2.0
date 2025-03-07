
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Waste } from "@/types";
import { ArrowLeft } from "lucide-react";
import { getUserById, getWastesByUserId } from "@/services/mockData";
import WasteCard from "@/components/WasteCard";
import UserProfile from "@/components/UserProfile";

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
  
  const handleNavigateToWaste = (wasteId: string) => {
    navigate(`/waste/${wasteId}`);
  };
  
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
    </div>
  );
};

export default Profile;
