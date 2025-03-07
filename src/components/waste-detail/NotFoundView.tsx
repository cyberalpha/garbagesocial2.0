
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFoundView = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-8 px-4 text-center">
      <p>Residuo no encontrado</p>
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
};

export default NotFoundView;
