
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
}

const ErrorState = ({ message }: ErrorStateProps) => {
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>{message}</span>
      </div>
    </div>
  );
};

export default ErrorState;
