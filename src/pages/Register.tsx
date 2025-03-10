
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageContext';
import RegisterForm from '@/components/RegisterForm';
import { Card } from '@/components/ui/card';
import LanguageSelector from '@/components/LanguageSelector';

const Register = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Si ya hay un usuario autenticado, redirigir al perfil
    if (currentUser) {
      navigate('/profile');
    }
  }, [currentUser, navigate]);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Garbage Social</h1>
          <LanguageSelector showLabel={true} />
        </div>
        <p className="text-center text-muted-foreground mb-4">{t('auth.registerWelcome')}</p>
        <Card className="p-4 mb-4 bg-primary/5 border-primary/20">
          <p className="text-center text-sm">
            <strong>{t('auth.registerIntro')}</strong> {t('auth.registerExplanation')}
          </p>
        </Card>
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
