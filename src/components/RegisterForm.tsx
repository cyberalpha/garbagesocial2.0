
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useLanguage } from './LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Mail, Lock, LogIn, Building, Loader2 } from 'lucide-react';
import { User as UserType } from '@/types';
import { useToast } from '@/components/ui/use-toast';

const RegisterForm = () => {
  const [userData, setUserData] = useState<Partial<UserType> & { password?: string }>({
    name: '',
    email: '',
    isOrganization: false,
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/profile');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar datos
    if (!userData.name || !userData.email || !userData.password) {
      toast({
        title: t('general.error'),
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }
    
    if (userData.password && userData.password.length < 6) {
      toast({
        title: t('general.error'),
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Intentando registrar usuario:", {
        ...userData,
        password: userData.password ? "********" : undefined
      });
      
      const user = await register(userData);
      console.log("Resultado del registro:", user);
      
      if (user) {
        toast({
          title: t('general.success'),
          description: "Registro exitoso. ¡Bienvenido!",
        });
        // Redirigir explícitamente al perfil después del registro exitoso
        navigate('/profile');
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Error al registrar usuario",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{t('auth.register')}</CardTitle>
        <CardDescription>
          {t('auth.registerExplanation')}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('auth.name')}</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder={t('auth.name')}
                className="pl-10"
                value={userData.name || ''}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                className="pl-10"
                value={userData.email || ''}
                onChange={handleChange}
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
                name="password"
                type="password"
                placeholder="********"
                className="pl-10"
                value={userData.password || ''}
                onChange={handleChange}
                required
                minLength={6}
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isOrganization" 
              name="isOrganization"
              checked={userData.isOrganization || false}
              onCheckedChange={(checked) => 
                setUserData(prev => ({...prev, isOrganization: checked === true}))
              }
              disabled={isSubmitting}
            />
            <label 
              htmlFor="isOrganization" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('auth.isOrganization')}
            </label>
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
            {isSubmitting ? t('general.loading') : t('auth.register')}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center">
            {t('auth.alreadyHaveAccount')}{" "}
            <Link to="/login" className="text-primary hover:underline">
              {t('auth.login')}
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RegisterForm;
