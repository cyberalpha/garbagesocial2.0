
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { RecycleIcon, Map, UserIcon, Upload } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/20 to-background">
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <RecycleIcon className="h-24 w-24 mx-auto text-primary" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Recycle Realm
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Conectando recicladores con residuos. Una plataforma para un mundo más limpio y sustentable.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="rounded-full px-8 py-6 shadow-lg"
            asChild
          >
            <Link to="/map">Ver Mapa</Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full px-8 py-6 shadow-lg"
            asChild
          >
            <Link to="/publish">Publicar Residuo</Link>
          </Button>
          
          <Button 
            variant="secondary" 
            size="lg" 
            className="rounded-full px-8 py-6 shadow-lg"
            asChild
          >
            <Link to="/login">Iniciar Sesión</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
