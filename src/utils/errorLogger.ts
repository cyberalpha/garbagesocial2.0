
/**
 * Utilidad para capturar y registrar errores en la aplicación
 */

// Clave para almacenar los errores en localStorage
const ERROR_LOG_KEY = 'app_error_log';

// Interfaz para los errores registrados
export interface ErrorLogEntry {
  id: string;
  timestamp: Date;
  message: string;
  stack?: string;
  componentName?: string;
  additionalInfo?: Record<string, any>;
}

// Número máximo de errores a almacenar
const MAX_ERROR_LOG_SIZE = 100;

/**
 * Registrar un nuevo error en el log
 */
export const logError = (
  error: Error | string,
  componentName?: string,
  additionalInfo?: Record<string, any>
): void => {
  try {
    // Crear el registro de error
    const errorEntry: ErrorLogEntry = {
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      message: typeof error === 'string' ? error : error.message,
      stack: error instanceof Error ? error.stack : undefined,
      componentName,
      additionalInfo
    };
    
    // Obtener el log existente
    const existingLog = getErrorLog();
    
    // Agregar el nuevo error al inicio
    existingLog.unshift(errorEntry);
    
    // Limitar el tamaño
    if (existingLog.length > MAX_ERROR_LOG_SIZE) {
      existingLog.splice(MAX_ERROR_LOG_SIZE);
    }
    
    // Guardar el log actualizado
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(existingLog));
    
    // También registrar en la consola
    console.error('Error registrado:', errorEntry);
  } catch (e) {
    // En caso de error al guardar, al menos mostrarlo en la consola
    console.error('Error al registrar error:', e);
    console.error('Error original:', error);
  }
};

/**
 * Obtener todos los errores registrados
 */
export const getErrorLog = (): ErrorLogEntry[] => {
  try {
    const logJson = localStorage.getItem(ERROR_LOG_KEY);
    
    if (!logJson) {
      return [];
    }
    
    const log = JSON.parse(logJson);
    
    // Convertir las fechas de string a Date
    return log.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    }));
  } catch (e) {
    console.error('Error al obtener el log de errores:', e);
    return [];
  }
};

/**
 * Limpiar todos los errores registrados
 */
export const clearErrorLog = (): void => {
  localStorage.removeItem(ERROR_LOG_KEY);
};

/**
 * Wrapper de error handler para componentes React
 */
export function withErrorLogging<P>(
  Component: React.ComponentType<P>,
  componentName: string
): React.FC<P> {
  return function WithErrorLogging(props: P) {
    try {
      return React.createElement(Component, props);
    } catch (error) {
      logError(error as Error, componentName);
      // Renderizar un fallback en caso de error
      return React.createElement(
        'div',
        { className: "p-4 border border-red-500 rounded-md" },
        [
          React.createElement(
            'h3',
            { className: "text-red-500 font-medium", key: 'title' },
            'Error inesperado'
          ),
          React.createElement(
            'p',
            { className: "text-sm", key: 'message' },
            (error as Error).message
          )
        ]
      );
    }
  };
}

/**
 * Configurar manejador global de errores
 */
export const setupGlobalErrorHandling = (): void => {
  // Capturar errores no controlados
  window.onerror = (message, source, lineno, colno, error) => {
    logError(
      error || String(message),
      'window.onerror',
      { source, lineno, colno }
    );
    return false; // Permitir que el error se propague
  };
  
  // Capturar promesas rechazadas no controladas
  window.addEventListener('unhandledrejection', (event) => {
    logError(
      event.reason instanceof Error ? event.reason : String(event.reason),
      'unhandledrejection'
    );
  });
};

/**
 * Exportar un componente para mostrar los errores registrados
 */
export const ErrorLogViewer: React.FC = () => {
  const errors = getErrorLog();
  
  return (
    <div className="border rounded-md p-4 bg-red-50">
      <h2 className="text-lg font-bold mb-4">Registro de errores ({errors.length})</h2>
      {errors.length === 0 ? (
        <p className="text-gray-500">No hay errores registrados</p>
      ) : (
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {errors.map((error) => (
            <div key={error.id} className="border-b pb-2">
              <p className="font-medium">{error.message}</p>
              <p className="text-xs text-gray-500">
                {error.componentName && `En: ${error.componentName} • `}
                {error.timestamp.toLocaleString()}
              </p>
              {error.stack && (
                <pre className="text-xs mt-1 bg-gray-100 p-1 rounded overflow-x-auto">
                  {error.stack}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
      <button 
        className="mt-4 px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
        onClick={clearErrorLog}
      >
        Limpiar registro
      </button>
    </div>
  );
};
