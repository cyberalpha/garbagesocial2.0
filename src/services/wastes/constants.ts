
import { WasteStatus, WasteType } from '@/types';

// Tipos de residuos disponibles
export const WASTE_TYPES: WasteType[] = [
  'organic',
  'paper',
  'glass',
  'plastic',
  'metal',
  'sanitary',
  'dump',
  'various'
];

// Estados de residuos disponibles
export const WASTE_STATUSES: WasteStatus[] = [
  'pending',
  'in_progress',
  'collected',
  'canceled'
];

// Traducciones de tipos de residuos
export const WASTE_TYPE_TRANSLATIONS: Record<WasteType, string> = {
  'organic': 'Orgánico',
  'paper': 'Papel',
  'glass': 'Vidrio',
  'plastic': 'Plástico',
  'metal': 'Metal',
  'sanitary': 'Control Sanitario',
  'dump': 'Basural',
  'various': 'Varios'
};

// Traducciones de estados de residuos
export const WASTE_STATUS_TRANSLATIONS: Record<WasteStatus, string> = {
  'pending': 'Pendiente',
  'in_progress': 'En Proceso',
  'collected': 'Recolectado',
  'canceled': 'Cancelado'
};

// Colores para los tipos de residuos
export const WASTE_TYPE_COLORS: Record<WasteType, string> = {
  'organic': 'bg-green-500',
  'paper': 'bg-yellow-500',
  'glass': 'bg-amber-100',
  'plastic': 'bg-blue-500',
  'metal': 'bg-gray-400',
  'sanitary': 'bg-red-500',
  'dump': 'bg-purple-500',
  'various': 'bg-gray-800'
};
