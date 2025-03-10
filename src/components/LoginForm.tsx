
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useLanguage } from './LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, Lock, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: t('general.error'),
        description: "Por favor, ingresa tu email y contraseña",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await login(email, password);
      console.log("Login result:", response);
      
      // Si hay un error en la respuesta, mostrar toast de error
      if (response.error) {
        toast({
          title: t('general.error'),
          description: response.error.message || "Error al iniciar sesión. Por favor verifica tus credenciales.",
          variant: "destructive"
        });
        return; // Retornar temprano en caso de error
      }
      
      // Si no hay usuario después de iniciar sesión, también mostrar error
      if (!response.data || !response.data.user) {
        toast({
          title: t('general.error'),
          description: "No se pudo obtener la información del usuario. Por favor intenta nuevamente.",
          variant: "destructive"
        });
        return; // Retornar temprano en caso de error
      }
      
      // El useEffect que observa currentUser manejará la redirección
      toast({
        title: t('general.success'),
        description: "Has iniciado sesión correctamente.",
      });
      
    } catch (error: any) {
      console.error('Error durante el inicio de sesión:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Error al iniciar sesión. Por favor verifica tus credenciales.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{t('auth.login')}</CardTitle>
        <CardDescription>
          {t('auth.loginExplanation')}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="********"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? t('general.loading') : t('auth.login')}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full bg-primary/5" 
            onClick={goToRegister}
            disabled={isSubmitting}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {t('auth.noAccount')}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
};

export default LoginForm;
