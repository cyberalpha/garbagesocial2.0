
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Award, Star, Recycle, Upload, BarChart3, CheckCircle, Building2 } from 'lucide-react';
import { Waste, User } from "@/types";
import { calculateAchievements } from "@/utils/achievementUtils";

interface ProfileAchievementsProps {
  user: User;
  wastes: Waste[];
}

const iconComponents: { [key: string]: React.FC<{ className?: string }> } = {
  Star,
  Recycle,
  Upload,
  BarChart3,
  CheckCircle,
  Building2
};

const ProfileAchievements: React.FC<ProfileAchievementsProps> = ({ user, wastes }) => {
  const achievements = calculateAchievements(wastes, user);
  
  if (achievements.length === 0) {
    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
          <Award className="h-4 w-4 text-primary" />
          Logros
        </h3>
        <p className="text-xs text-muted-foreground">Aún no tienes logros. ¡Continúa usando la plataforma para desbloquearlos!</p>
      </div>
    );
  }
  
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
        <Award className="h-4 w-4 text-primary" />
        Logros
      </h3>
      <div className="flex flex-wrap gap-2">
        {achievements.map((achievement) => {
          const IconComponent = iconComponents[achievement.icon];
          return (
            <Badge
              key={achievement.id}
              variant="outline"
              className={achievement.backgroundColor}
              title={achievement.description}
            >
              {IconComponent && (
                <IconComponent className={`h-3 w-3 mr-1 ${achievement.iconColor}`} />
              )}
              {achievement.name}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileAchievements;
