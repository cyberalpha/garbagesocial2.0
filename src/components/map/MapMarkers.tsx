
import React from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { Waste, GeoLocation } from '@/types';
import InfoWindowContent from './InfoWindowContent';

interface MapMarkersProps {
  wastes: Waste[];
  selectedWastes: Waste[];
  optimizedRoute: Waste[];
  location: GeoLocation | null;
  selectedWaste: Waste | null;
  showInfoWindow: boolean;
  isRoutingMode: boolean;
  onMarkerClick: (waste: Waste) => void;
  onInfoWindowClose: () => void;
}

const MapMarkers = ({
  wastes,
  selectedWastes,
  optimizedRoute,
  location,
  selectedWaste,
  showInfoWindow,
  isRoutingMode,
  onMarkerClick,
  onInfoWindowClose
}: MapMarkersProps) => {
  // Get marker icon based on waste type
  const getMarkerIcon = (type: string) => {
    let pinColor = "";
    switch(type) {
      case 'organic': pinColor = "#22c55e"; break; // green-500
      case 'paper': pinColor = "#eab308"; break; // yellow-500
      case 'glass': pinColor = "#f59e0b"; break; // amber-500
      case 'plastic': pinColor = "#3b82f6"; break; // blue-500
      case 'metal': pinColor = "#9ca3af"; break; // gray-400
      case 'sanitary': pinColor = "#ef4444"; break; // red-500
      case 'dump': pinColor = "#a855f7"; break; // purple-500
      default: pinColor = "#1e293b"; break; // slate-800
    }
    
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: pinColor,
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
      scale: 10
    };
  };

  console.log("Wastes en mapa:", wastes.length, "Location:", location ? "disponible" : "no disponible");

  return (
    <>
      {/* Waste markers */}
      {wastes.map(waste => {
        const isSelected = selectedWastes.some(w => w.id === waste.id);
        const routeIndex = optimizedRoute.findIndex(w => w.id === waste.id);
        
        return (
          <Marker
            key={waste.id}
            position={{
              lat: waste.location.coordinates[1],
              lng: waste.location.coordinates[0]
            }}
            onClick={() => onMarkerClick(waste)}
            icon={getMarkerIcon(waste.type)}
            label={routeIndex !== -1 ? (routeIndex + 1).toString() : undefined}
            animation={isSelected ? google.maps.Animation.BOUNCE : undefined}
            zIndex={isSelected ? 100 : undefined}
          />
        );
      })}
      
      {/* User location marker - Mejorado con un estilo más visible */}
      {location && (
        <Marker
          position={{
            lat: location.coordinates[1],
            lng: location.coordinates[0]
          }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#0ea5e9", // sky-500 - color azul más brillante
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
            scale: 12, // Tamaño ligeramente más grande
          }}
          zIndex={1000}
          title="Mi ubicación actual"
          animation={google.maps.Animation.DROP} // Añadir animación para hacerlo más visible
        />
      )}
      
      {/* Info window for selected waste */}
      {selectedWaste && showInfoWindow && (
        <InfoWindow
          position={{
            lat: selectedWaste.location.coordinates[1],
            lng: selectedWaste.location.coordinates[0]
          }}
          onCloseClick={onInfoWindowClose}
        >
          <InfoWindowContent 
            title={selectedWaste.description} 
            subtitle={selectedWaste.type} 
          />
        </InfoWindow>
      )}
    </>
  );
};

export default MapMarkers;
