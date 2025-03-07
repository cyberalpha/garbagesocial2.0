
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useLanguage } from './LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, LogIn, Facebook, Instagram, UserPlus } from 'lucide-react';
import GoogleSignInButton from './GoogleSignInButton';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, pendingVerification, resendVerificationEmail, loginWithSocialMedia } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleSocialLogin = (provider: string) => {
    loginWithSocialMedia(provider);
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
              {isLoading ? t('general.loading') : t('auth.login')}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full bg-primary/5" 
              onClick={goToRegister}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {t('auth.noAccount')}
            </Button>
            
            <div className="relative my-4">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-400">
                {t('auth.continueWith')}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-3 mb-3">
              <GoogleSignInButton className="w-full h-10" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleSocialLogin('facebook')} 
                className="flex items-center justify-center gap-2"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleSocialLogin('instagram')} 
                className="flex items-center justify-center gap-2"
              >
                <Instagram className="h-4 w-4 text-pink-600" />
                Instagram
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
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
            <div className="text-sm text-center mt-4">
              <p>{t('auth.demoCredentials')}</p>
              <p className="text-muted-foreground">{t('auth.demoUser')}: juan@example.com</p>
              <p className="text-muted-foreground">{t('auth.demoPassword')}</p>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  );
};

export default LoginForm;
