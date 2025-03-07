
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const EmailVerification = () => {
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const { verifyEmail } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const verifyAccount = async () => {
      try {
        // Obtener el token de verificación de los parámetros de la URL
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        
        if (token) {
          // Verificar el token con el servidor
          const success = await verifyEmail(token);
          setVerified(success);
        } else {
          setVerified(false);
        }
      } catch (error) {
        console.error('Error al verificar cuenta:', error);
        setVerified(false);
      } finally {
        setVerifying(false);
      }
    };
    
    verifyAccount();
  }, [location.search, verifyEmail]);
  
  const goToHome = () => {
    navigate('/');
  };
  
  const goToLogin = () => {
    navigate('/login');
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">{t('email.verification.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            {verifying ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p>{t('email.verification.verifying')}</p>
              </div>
            ) : verified ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('email.verification.success')}</h3>
                <p>{t('email.verification.successText')}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <XCircle className="h-16 w-16 text-red-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('email.verification.failed')}</h3>
                <p>{t('email.verification.failedText')}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            {verified ? (
              <Button onClick={goToHome}>{t('email.verification.goToHome')}</Button>
            ) : (
              <Button onClick={goToLogin}>{t('email.verification.backToLogin')}</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
