import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useLanguage } from './LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, Lock, LogIn, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login, currentUser, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { status: connectionStatus } = useSupabaseConnection();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (!email || !password) {
      setLoginError("Por favor, ingresa tu email y contraseña");
      return;
    }
    
    if (connectionStatus === 'disconnected') {
      setLoginError("No hay conexión a Internet. Por favor, verifica tu conexión e intenta nuevamente.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log(`Intentando iniciar sesión con: ${email}`);
      const response = await login(email, password);
      
      if (response.error) {
        console.error("Error de login:", response.error);
        
        if (response.error.message.includes('Invalid login credentials')) {
          setLoginError("Credenciales inválidas. Por favor verifica tu email y contraseña.");
        } else if (response.error.message.includes('Email not confirmed')) {
          setLoginError("Tu email no ha sido confirmado. Por favor revisa tu bandeja de entrada.");
        } else {
          setLoginError(response.error.message || "Error al iniciar sesión");
        }
        return;
      }
      
      toast({
        title: t('general.success'),
        description: "Has iniciado sesión correctamente.",
      });
      
    } catch (error: any) {
      console.error('Error durante el inicio de sesión:', error);
      setLoginError(error.message || "Error al iniciar sesión. Por favor verifica tus credenciales.");
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
          {loginError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}
          
          {connectionStatus === 'disconnected' && (
            <Alert variant="default" className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                No hay conexión a Supabase. Verifica tu conexión a Internet.
              </AlertDescription>
            </Alert>
          )}

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
                disabled={isSubmitting || isLoading}
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
                disabled={isSubmitting || isLoading}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || isLoading || connectionStatus === 'disconnected'}
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
            disabled={isSubmitting || isLoading}
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
