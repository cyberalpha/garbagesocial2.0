
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

const ActionTabs = () => {
  const { t } = useLanguage();
  
  return (
    <Tabs defaultValue="actions">
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="actions">{t('waste.actions')}</TabsTrigger>
        <TabsTrigger value="ratings">{t('waste.ratings')}</TabsTrigger>
      </TabsList>
      <TabsContent value="actions" className="p-2">
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start text-yellow-600"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            {t('waste.reportPost')}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600"
          >
            <X className="mr-2 h-4 w-4" />
            {t('waste.cancelPost')}
          </Button>
        </div>
      </TabsContent>
      <TabsContent value="ratings" className="p-2">
        <p className="text-center text-gray-500 py-4">
          {t('waste.noRatings')}
        </p>
      </TabsContent>
    </Tabs>
  );
};

export default ActionTabs;
