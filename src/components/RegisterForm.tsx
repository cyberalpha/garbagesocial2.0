import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useLanguage } from './LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, User, LogIn, Facebook, Instagram } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading, pendingVerification, resendVerificationEmail, loginWithSocialMedia } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(name, email, password);
  };

  const handleSocialLogin = (provider: string) => {
    loginWithSocialMedia(provider);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="relative">
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>
        <CardTitle className="text-2xl">{t('auth.register')}</CardTitle>
        <CardDescription>
          Regístrate para empezar a publicar tus residuos reciclables
        </CardDescription>
      </CardHeader>
      {pendingVerification ? (
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
            <h3 className="font-semibold mb-2">{t('auth.verificationPending')}</h3>
            <p className="text-sm mb-3">
              {t('auth.verificationSent')}
            </p>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => resendVerificationEmail(email)}
            >
              {t('auth.resendVerification')}
            </Button>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('auth.name')}</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder={t('auth.name')}
                  className="pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
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
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              {isLoading ? t('general.loading') : t('auth.register')}
            </Button>
            
            <div className="relative my-4">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-400">
                {t('auth.continueWith')}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleSocialLogin('google')} 
                className="flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleSocialLogin('facebook')} 
                className="flex items-center justify-center gap-2"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleSocialLogin('instagram')} 
                className="flex items-center justify-center gap-2"
              >
                <Instagram className="h-4 w-4 text-pink-600" />
                Instagram
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleSocialLogin('tiktok')} 
                className="flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.97 6.24 6.24 0 0 1-1.17-1.806h.003c-.19-.505-.287-1.025-.29-1.547h-3.765v13.334c0 .566-.055 1.122-.29 1.546-.903 1.633-2.723 1.734-3.22 1.663-.138-.019-.277-.043-.415-.07a3.241 3.241 0 0 1-.292-.071 3.17 3.17 0 0 1-1.278-.649c-.15-.123-.289-.26-.417-.407a3.242 3.242 0 0 1 .963-5.233c.135-.058.275-.11.42-.149v-3.829a6.42 6.42 0 0 0-.922.199 6.729 6.729 0 0 0-1.587.755 6.888 6.888 0 0 0-2.19 2.191 6.72 6.72 0 0 0-.754 1.586c-.255.733-.376 1.501-.357 2.271.018.77.178 1.53.472 2.243.301.726.728 1.397 1.254 1.98a6.785 6.785 0 0 0 1.941 1.438 6.71 6.71 0 0 0 2.297.702c.799.073 1.607.04 2.392-.106.787-.146 1.548-.407 2.258-.769a6.813 6.813 0 0 0 1.877-1.402c.276-.301.523-.626.739-.97.216-.345.395-.71.527-1.087.395-1.128.424-2.354.088-3.327V9.652c.111.047 1.924.798 3.902.961v-3.747c-.423.038-1.091.027-1.889-.23a8.92 8.92 0 0 1-.287-.086c-.42-.127-1.072-.361-1.818-.741z" />
                </svg>
                TikTok
              </Button>
            </div>
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
      )}
    </Card>
  );
};

export default RegisterForm;
