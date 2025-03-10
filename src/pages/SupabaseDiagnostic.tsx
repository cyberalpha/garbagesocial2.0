
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SUPABASE_CONFIG } from '@/integrations/supabase/client';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';

const SupabaseDiagnostic = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Diagnóstico de Supabase</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuración</h2>
          
          <div className="space-y-2">
            <div className="flex items-start">
              <span className="font-medium w-24">URL:</span>
              <span className="text-gray-600">{SUPABASE_CONFIG.url}</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium w-24">Project ID:</span>
              <span className="text-gray-600">{SUPABASE_CONFIG.url.split('https://')[1].split('.')[0]}</span>
            </div>
          </div>
        </div>
        
        <SupabaseConnectionTest />
      </div>
    </div>
  );
};

export default SupabaseDiagnostic;
