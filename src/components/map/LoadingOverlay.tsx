
import React from 'react';

const LoadingOverlay = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white p-4 rounded-md shadow-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm">Obteniendo ubicación...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
