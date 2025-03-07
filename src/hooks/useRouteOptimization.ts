
import { useState } from 'react';
import { Waste, GeoLocation } from '@/types';

// Algoritmo simple para optimizar rutas (problema del viajante)
// Esta es una implementación básica del algoritmo "vecino más cercano"
const optimizeRoute = (
  startPoint: GeoLocation,
  waypoints: Waste[]
): Waste[] => {
  if (waypoints.length <= 1) return waypoints;

  const result: Waste[] = [];
  const unvisited = [...waypoints];
  let currentPoint = startPoint;

  while (unvisited.length > 0) {
    // Encontrar el punto más cercano al actual
    let nearestIndex = 0;
    let minDistance = getDistance(
      currentPoint.coordinates,
      unvisited[0].location.coordinates
    );

    for (let i = 1; i < unvisited.length; i++) {
      const distance = getDistance(
        currentPoint.coordinates,
        unvisited[i].location.coordinates
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    // Agregar el punto más cercano a la ruta
    const nearest = unvisited.splice(nearestIndex, 1)[0];
    result.push(nearest);
    currentPoint = nearest.location;
  }

  return result;
};

// Función para calcular la distancia entre dos puntos (Haversine formula)
const getDistance = (
  point1: [number, number],
  point2: [number, number]
): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = deg2rad(point2[1] - point1[1]);
  const dLon = deg2rad(point2[0] - point1[0]);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1[1])) *
      Math.cos(deg2rad(point2[1])) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en km
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

interface UseRouteOptimizationResult {
  selectedWastes: Waste[];
  optimizedRoute: Waste[];
  isOptimizing: boolean;
  selectWaste: (waste: Waste) => void;
  deselectWaste: (wasteId: string) => void;
  optimizeRoute: (startLocation: GeoLocation) => void;
  clearRoute: () => void;
}

const useRouteOptimization = (): UseRouteOptimizationResult => {
  const [selectedWastes, setSelectedWastes] = useState<Waste[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<Waste[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const selectWaste = (waste: Waste) => {
    if (!selectedWastes.some((w) => w.id === waste.id)) {
      setSelectedWastes((prev) => [...prev, waste]);
    }
  };

  const deselectWaste = (wasteId: string) => {
    setSelectedWastes((prev) => prev.filter((w) => w.id !== wasteId));
  };

  const calculateRoute = (startLocation: GeoLocation) => {
    setIsOptimizing(true);
    // Simulamos un delay para representar el cálculo
    setTimeout(() => {
      const optimized = optimizeRoute(startLocation, selectedWastes);
      setOptimizedRoute(optimized);
      setIsOptimizing(false);
    }, 1000);
  };

  const clearRoute = () => {
    setSelectedWastes([]);
    setOptimizedRoute([]);
  };

  return {
    selectedWastes,
    optimizedRoute,
    isOptimizing,
    selectWaste,
    deselectWaste,
    optimizeRoute: calculateRoute,
    clearRoute,
  };
};

export default useRouteOptimization;
