
/**
 * Utilidad para limpiar completamente el estado de autenticación
 * para garantizar que no queden residuos en el almacenamiento local
 */
export const cleanupAuthSession = () => {
  // Limpiar tokens y estado de autenticación
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('sb-onlpsmjdqqcqyqmhyfay-auth-token');
  
  // También limpiar cualquier otra clave que pueda estar relacionada
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('supabase') || key.includes('auth') || key.includes('session')) {
      localStorage.removeItem(key);
    }
  });
  
  console.log('Limpieza completa de sesión ejecutada');
  
  // Registrar el logout en el registro de errores para análisis
  const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
  errors.push({
    message: 'Cierre de sesión manual ejecutado',
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('app_errors', JSON.stringify(errors));
};
