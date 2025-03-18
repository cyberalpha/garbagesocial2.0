
import React from 'react';
import { Waste } from '@/types';
import WasteCard from '@/components/WasteCard';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { deleteWaste } from '@/services/wastes';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

interface WastesListProps {
  wastes: Waste[];
  isLoading?: boolean;
  emptyMessage?: string;
  onWastesChanged?: () => void;
}

const WastesList = ({ 
  wastes, 
  isLoading = false, 
  emptyMessage = "No hay residuos para mostrar",
  onWastesChanged
}: WastesListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wasteToDelete, setWasteToDelete] = useState<Waste | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleEditWaste = (waste: Waste) => {
    // Por implementar: Edición de residuos
    toast({
      title: "Función no implementada",
      description: "La edición de residuos será implementada próximamente",
    });
  };
  
  const handleDeleteClick = (waste: Waste) => {
    setWasteToDelete(waste);
    setIsDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!wasteToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteWaste(wasteToDelete.id);
      
      toast({
        title: "Residuo eliminado",
        description: "El residuo ha sido eliminado correctamente",
      });
      
      if (onWastesChanged) {
        onWastesChanged();
      }
    } catch (error) {
      console.error("Error al eliminar residuo:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el residuo",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
      setWasteToDelete(null);
    }
  };
  
  const handleShowLocation = (waste: Waste) => {
    navigate(`/map?wasteId=${waste.id}`);
  };
  
  // Mostrar loader mientras se cargan los datos
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Mostrar mensaje cuando no hay residuos
  if (wastes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wastes.map(waste => (
          <WasteCard
            key={waste.id}
            waste={waste}
            onEdit={() => handleEditWaste(waste)}
            onDelete={() => handleDeleteClick(waste)}
            onShowLocation={() => handleShowLocation(waste)}
          />
        ))}
      </div>
      
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el residuo
              de nuestros servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WastesList;
