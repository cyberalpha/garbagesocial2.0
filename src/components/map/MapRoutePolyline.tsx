
import React from 'react';
import { Polyline } from '@react-google-maps/api';
import { Waste, GeoLocation } from '@/types';

interface MapRoutePolylineProps {
  isRoutingMode: boolean;
  optimizedRoute: Waste[];
  location: GeoLocation | null;
}

const MapRoutePolyline = ({ 
  isRoutingMode, 
  optimizedRoute, 
  location 
}: MapRoutePolylineProps) => {
  // Get route path for optimized route
  const getRoutePath = () => {
    if (optimizedRoute.length < 2) return [];

    const path = [];
    
    // Add user location as starting point
    if (location) {
      path.push({
        lat: location.coordinates[1],
        lng: location.coordinates[0]
      });
    }
    
    // Add waste locations to path
    for (const waste of optimizedRoute) {
      path.push({
        lat: waste.location.coordinates[1],
        lng: waste.location.coordinates[0]
      });
    }
    
    return path;
  };

  if (!isRoutingMode || optimizedRoute.length <= 1) {
    return null;
  }

  return (
    <Polyline
      path={getRoutePath()}
      options={{
        strokeColor: "#3b82f6",
        strokeWeight: 3,
        strokeOpacity: 0.8,
      }}
    />
  );
};

export default MapRoutePolyline;
