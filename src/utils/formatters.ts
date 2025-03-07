
/**
 * Formats a date object into a localized string
 */
export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Translates waste type to Spanish
 */
export const getWasteTypeText = (type: string) => {
  switch(type) {
    case 'organic': return 'Orgánico';
    case 'paper': return 'Papel';
    case 'glass': return 'Vidrio';
    case 'plastic': return 'Plástico';
    case 'metal': return 'Metal';
    case 'sanitary': return 'Control Sanitario';
    case 'dump': return 'Basural';
    default: return 'Varios';
  }
};

/**
 * Translates waste status to Spanish
 */
export const getStatusText = (status: string) => {
  switch(status) {
    case 'pending': return 'Pendiente';
    case 'in_progress': return 'En proceso';
    case 'collected': return 'Retirado';
    case 'canceled': return 'Cancelado';
    default: return 'Desconocido';
  }
};
