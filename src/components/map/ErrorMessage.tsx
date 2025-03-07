
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md">
      {message}
    </div>
  );
};

export default ErrorMessage;
