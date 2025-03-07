
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DetailHeader = () => {
  const navigate = useNavigate();
  
  return (
    <Button 
      variant="ghost" 
      className="mb-4" 
      onClick={() => navigate(-1)}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Volver
    </Button>
  );
};

export default DetailHeader;
