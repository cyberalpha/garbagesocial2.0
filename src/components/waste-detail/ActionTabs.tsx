
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from 'lucide-react';

const ActionTabs = () => {
  return (
    <Tabs defaultValue="actions">
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="actions">Acciones</TabsTrigger>
        <TabsTrigger value="ratings">Calificaciones</TabsTrigger>
      </TabsList>
      <TabsContent value="actions" className="p-2">
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start text-yellow-600"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Reportar publicación
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600"
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar publicación
          </Button>
        </div>
      </TabsContent>
      <TabsContent value="ratings" className="p-2">
        <p className="text-center text-gray-500 py-4">
          No hay calificaciones disponibles
        </p>
      </TabsContent>
    </Tabs>
  );
};

export default ActionTabs;
