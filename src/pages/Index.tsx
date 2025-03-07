
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { RecycleIcon, Map, UserIcon, Upload } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/20 to-background">
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mb-8 animate-float">
          <RecycleIcon className="h-24 w-24 mx-auto text-primary" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-slide-up">
          Recycle Realm
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in">
          Conectando recicladores con residuos. Una plataforma para un mundo más limpio y sustentable.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
          <Button 
            variant="outline" 
            size="lg" 
            className="h-auto p-6 flex flex-col items-center text-left glass-card hover:shadow-xl transition-all"
            onClick={() => navigate('/map')}
          >
            <Map className="h-8 w-8 mb-2 text-primary" />
            <div>
              <h3 className="font-bold text-lg">Mapa Interactivo</h3>
              <p className="font-normal text-sm text-muted-foreground">Encuentra residuos cerca de tu ubicación</p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="h-auto p-6 flex flex-col items-center text-left glass-card hover:shadow-xl transition-all"
            onClick={() => navigate('/publish')}
          >
            <Upload className="h-8 w-8 mb-2 text-primary" />
            <div>
              <h3 className="font-bold text-lg">Publicar Residuos</h3>
              <p className="font-normal text-sm text-muted-foreground">Comparte los materiales que quieres reciclar</p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="h-auto p-6 flex flex-col items-center text-left glass-card hover:shadow-xl transition-all"
            onClick={() => navigate('/profile/1')}
          >
            <UserIcon className="h-8 w-8 mb-2 text-primary" />
            <div>
              <h3 className="font-bold text-lg">Perfil de Usuario</h3>
              <p className="font-normal text-sm text-muted-foreground">Administra tus publicaciones y recolecciones</p>
            </div>
          </Button>
        </div>
        
        <Button 
          size="lg" 
          className="animate-pulse-light"
          onClick={() => navigate('/map')}
        >
          Comenzar ahora
        </Button>
      </div>
      
      <div className="w-full py-6 bg-muted/50 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2024 Recycle Realm - Conectando recicladores urbanos y publicadores de residuos</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
