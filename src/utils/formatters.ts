
import { useLanguage } from '@/components/LanguageContext';
import { Language } from '@/components/LanguageContext';

/**
 * Formats a date object into a localized string
 */
export const formatDate = (date: Date, language: Language = 'es') => {
  const locale = language === 'es' ? 'es-ES' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Custom hook to use formatDate with the current language
 */
export const useFormattedDate = () => {
  const { language } = useLanguage();
  
  return (date: Date) => formatDate(date, language);
};

/**
 * Hook to get translated waste type text
 */
export const useWasteTypeText = () => {
  const { t } = useLanguage();
  
  return (type: string) => {
    switch(type) {
      case 'organic': return t('waste.types.organic');
      case 'paper': return t('waste.types.paper');
      case 'glass': return t('waste.types.glass');
      case 'plastic': return t('waste.types.plastic');
      case 'metal': return t('waste.types.metal');
      case 'sanitary': return t('waste.types.sanitary');
      case 'dump': return t('waste.types.dump');
      default: return t('waste.types.various');
    }
  };
};

/**
 * Hook to get translated waste status text
 */
export const useStatusText = () => {
  const { t } = useLanguage();
  
  return (status: string) => {
    switch(status) {
      case 'pending': return t('waste.status.pending');
      case 'in_progress': return t('waste.status.in_progress');
      case 'collected': return t('waste.status.collected');
      case 'canceled': return t('waste.status.canceled');
      default: return t('waste.status.unknown');
    }
  };
};
