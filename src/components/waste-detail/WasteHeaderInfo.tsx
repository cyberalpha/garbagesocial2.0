
import { Clock } from 'lucide-react';
import { Waste } from '@/types';
import { CardDescription } from "@/components/ui/card";
import WasteTypeBadge from './WasteTypeBadge';
import { useLanguage } from '@/components/LanguageContext';

interface WasteHeaderInfoProps {
  waste: Waste;
  formatDate: (date: Date) => string;
}

const WasteHeaderInfo = ({ waste, formatDate }: WasteHeaderInfoProps) => {
  const { t } = useLanguage();
  
  return (
    <CardDescription>
      <div className="flex items-center mt-1">
        <WasteTypeBadge type={waste.type} />
        <div className="ml-2 flex items-center">
          <Clock className="h-4 w-4 text-gray-500 mr-1" />
          <span className="text-gray-500 text-sm">
            {t('waste.publishedOn')} {formatDate(waste.publicationDate)}
          </span>
        </div>
      </div>
    </CardDescription>
  );
};

export default WasteHeaderInfo;
