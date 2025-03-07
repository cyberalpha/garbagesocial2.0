
import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message = "Cargando..." }: LoadingStateProps) => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-gray-100 rounded-lg">
      <div className="flex flex-col items-center space-y-4 text-center p-6 bg-white rounded-lg shadow-md">
        <Loader className="h-8 w-8 text-primary animate-spin" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;
