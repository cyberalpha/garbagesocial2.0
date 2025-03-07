
import { Waste, User } from "@/types";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  iconColor: string;
  backgroundColor: string;
  condition: (wastes: Waste[], user: User) => boolean;
}

// Define all possible achievements
export const allAchievements: Achievement[] = [
  {
    id: "publisher_star",
    name: "Publicador Estrella",
    description: "Has publicado más de 5 residuos",
    icon: "Star",
    iconColor: "text-yellow-500 fill-yellow-500",
    backgroundColor: "bg-yellow-100",
    condition: (wastes) => wastes.length >= 5
  },
  {
    id: "eco_friend",
    name: "Eco Amigo",
    description: "Has publicado residuos de diferentes tipos",
    icon: "Recycle",
    iconColor: "text-green-500",
    backgroundColor: "bg-green-100",
    condition: (wastes) => {
      const typeSet = new Set(wastes.map(w => w.type));
      return typeSet.size >= 3;
    }
  },
  {
    id: "top_publisher",
    name: "10 Publicaciones",
    description: "Has publicado 10 o más residuos",
    icon: "Upload",
    iconColor: "text-blue-500",
    backgroundColor: "bg-blue-100",
    condition: (wastes) => wastes.length >= 10
  },
  {
    id: "top_rated",
    name: "Top 10%",
    description: "Estás en el top 10% de usuarios mejor valorados",
    icon: "BarChart3",
    iconColor: "text-purple-500",
    backgroundColor: "bg-purple-100",
    condition: (_, user) => user.averageRating >= 4.5
  },
  {
    id: "efficient_recycler",
    name: "Reciclador Eficiente",
    description: "Más del 80% de tus residuos han sido recolectados",
    icon: "CheckCircle",
    iconColor: "text-teal-500",
    backgroundColor: "bg-teal-100",
    condition: (wastes) => {
      if (wastes.length === 0) return false;
      const collectedCount = wastes.filter(w => w.status === "collected").length;
      return collectedCount / wastes.length >= 0.8 && wastes.length >= 5;
    }
  },
  {
    id: "organization",
    name: "Organización",
    description: "Perfil verificado como organización",
    icon: "Building2",
    iconColor: "text-indigo-500",
    backgroundColor: "bg-indigo-100",
    condition: (_, user) => user.isOrganization
  }
];

/**
 * Calculate achievements for a user based on their waste publications
 */
export const calculateAchievements = (wastes: Waste[], user: User): Achievement[] => {
  return allAchievements.filter(achievement => achievement.condition(wastes, user));
};
