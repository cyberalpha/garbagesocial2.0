
// Constantes para localStorage
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

// Guardar token de sesión
export const setSessionToken = (accessToken: string, refreshToken?: string, expiresIn: number = 3600) => {
  const expiryTime = Date.now() + expiresIn * 1000;
  
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    
    console.log('Token de sesión guardado, expira en:', new Date(expiryTime).toLocaleString());
  } catch (error) {
    console.error('Error al guardar token de sesión:', error);
  }
};

// Obtener token de sesión
export const getSessionToken = (): { accessToken: string | null; refreshToken: string | null; isExpired: boolean } => {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const expiryTimeStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (!accessToken || !expiryTimeStr) {
      return { accessToken: null, refreshToken: null, isExpired: true };
    }
    
    const expiryTime = parseInt(expiryTimeStr, 10);
    const isExpired = Date.now() > expiryTime;
    
    return { accessToken, refreshToken, isExpired };
  } catch (error) {
    console.error('Error al obtener token de sesión:', error);
    return { accessToken: null, refreshToken: null, isExpired: true };
  }
};

// Limpiar token de sesión
export const clearSessionToken = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    console.log('Token de sesión eliminado');
  } catch (error) {
    console.error('Error al eliminar token de sesión:', error);
  }
};

// Verificar si hay sesión activa
export const hasActiveSession = (): boolean => {
  const { accessToken, isExpired } = getSessionToken();
  return !!accessToken && !isExpired;
};
