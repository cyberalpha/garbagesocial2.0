
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { RecycleIcon, Map, UserIcon, Upload } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  // Redirigir a Home después de un breve delay
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/20 to-background">
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mb-8 animate-pulse">
          <RecycleIcon className="h-24 w-24 mx-auto text-primary" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Recycle Realm
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Conectando recicladores con residuos. Una plataforma para un mundo más limpio y sustentable.
        </p>
        
        <p className="text-lg">Redireccionando...</p>
      </div>
    </div>
  );
};

export default Index;
