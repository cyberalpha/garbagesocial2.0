
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Idiomas soportados
export type Language = 'es' | 'en';

// Traducciones
export const translations = {
  es: {
    // Autenticación
    'auth.login': 'Iniciar Sesión',
    'auth.register': 'Crear Cuenta',
    'auth.logout': 'Cerrar Sesión',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.name': 'Nombre Completo',
    'auth.verificationPending': 'Verificación de correo pendiente',
    'auth.verificationSent': 'Te hemos enviado un correo electrónico con un enlace de verificación. Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.',
    'auth.resendVerification': 'Reenviar correo de verificación',
    'auth.continueWith': 'O continúa con',
    'auth.alreadyHaveAccount': '¿Ya tienes una cuenta?',
    'auth.registerWelcome': 'Únete a nuestra comunidad de reciclaje',
    'auth.registerIntro': '¡Bienvenido a GarbageSocial!',
    'auth.registerExplanation': 'Para formar parte de nuestra comunidad exclusiva de reciclaje, necesitas crear una cuenta. Completa el formulario a continuación para comenzar.',
    
    // Verificación de Email
    'email.verification.title': 'Verificación de Cuenta',
    'email.verification.verifying': 'Verificando tu cuenta...',
    'email.verification.success': '¡Cuenta verificada!',
    'email.verification.successText': 'Tu cuenta ha sido verificada correctamente. Ya puedes comenzar a utilizar GarbageSocial.',
    'email.verification.failed': 'Verificación fallida',
    'email.verification.failedText': 'No pudimos verificar tu cuenta. El enlace puede haber expirado o ser inválido.',
    'email.verification.goToHome': 'Ir al inicio',
    'email.verification.backToLogin': 'Volver al inicio de sesión',
    
    // Correos electrónicos
    'email.welcome.subject': 'Bienvenido a GarbageSocial - Verifica tu cuenta',
    'email.welcome.title': 'Bienvenido a GarbageSocial',
    'email.welcome.text': 'Gracias por registrarte en GarbageSocial, la comunidad de reciclaje. Para completar tu registro, por favor verifica tu correo electrónico haciendo clic en el enlace de abajo:',
    'email.welcome.button': 'Verificar mi cuenta',
    'email.welcome.footer': 'Si no has creado esta cuenta, puedes ignorar este correo.',
    
    // General
    'general.loading': 'Cargando...',
    'general.error': 'Error',
    'general.success': 'Éxito',
    'general.save': 'Guardar',
    'general.cancel': 'Cancelar',
    'general.language': 'Idioma',
  },
  en: {
    // Authentication
    'auth.login': 'Log In',
    'auth.register': 'Create Account',
    'auth.logout': 'Log Out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Full Name',
    'auth.verificationPending': 'Email verification pending',
    'auth.verificationSent': 'We have sent you an email with a verification link. Please check your inbox and click on the link to activate your account.',
    'auth.resendVerification': 'Resend verification email',
    'auth.continueWith': 'Or continue with',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.registerWelcome': 'Join our recycling community',
    'auth.registerIntro': 'Welcome to GarbageSocial!',
    'auth.registerExplanation': 'To be part of our exclusive recycling community, you need to create an account. Complete the form below to get started.',
    
    // Email Verification
    'email.verification.title': 'Account Verification',
    'email.verification.verifying': 'Verifying your account...',
    'email.verification.success': 'Account Verified!',
    'email.verification.successText': 'Your account has been successfully verified. You can now start using GarbageSocial.',
    'email.verification.failed': 'Verification Failed',
    'email.verification.failedText': 'We could not verify your account. The link may have expired or be invalid.',
    'email.verification.goToHome': 'Go to home',
    'email.verification.backToLogin': 'Back to login',
    
    // Emails
    'email.welcome.subject': 'Welcome to GarbageSocial - Verify your account',
    'email.welcome.title': 'Welcome to GarbageSocial',
    'email.welcome.text': 'Thank you for signing up to GarbageSocial, the recycling community. To complete your registration, please verify your email by clicking the link below:',
    'email.welcome.button': 'Verify my account',
    'email.welcome.footer': 'If you did not create this account, you can ignore this email.',
    
    // General
    'general.loading': 'Loading...',
    'general.error': 'Error',
    'general.success': 'Success',
    'general.save': 'Save',
    'general.cancel': 'Cancel',
    'general.language': 'Language',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe ser usado dentro de un LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Detectar idioma del navegador o usar el guardado en localStorage
  const detectBrowserLanguage = (): Language => {
    const savedLanguage = localStorage.getItem('preferredLanguage') as Language;
    if (savedLanguage && ['es', 'en'].includes(savedLanguage)) {
      return savedLanguage;
    }

    // Detectar idioma del navegador
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'es' ? 'es' : 'en';
  };

  const [language, setLanguageState] = useState<Language>(detectBrowserLanguage());

  // Función para traducir textos
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  // Guardar el idioma seleccionado en localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  // Efecto para actualizar cuando cambia el idioma
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
