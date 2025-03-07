
import React from 'react';

interface InfoWindowContentProps {
  title: string;
  subtitle: string;
}

const InfoWindowContent = ({ title, subtitle }: InfoWindowContentProps) => {
  return (
    <div className="p-2">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm capitalize">{subtitle}</p>
    </div>
  );
};

export default InfoWindowContent;
