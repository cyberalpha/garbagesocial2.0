
import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Cambiar idioma</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange('es')} className={language === 'es' ? 'font-bold' : ''}>
          Español
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('en')} className={language === 'en' ? 'font-bold' : ''}>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
