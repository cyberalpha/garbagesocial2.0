
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoadingViewProps {
  message?: string;
}

const LoadingView = ({ message = "Cargando detalles..." }: LoadingViewProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-8 px-4 text-center">
      <p>{message}</p>
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

export default LoadingView;
