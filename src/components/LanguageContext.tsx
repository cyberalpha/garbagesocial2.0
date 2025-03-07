
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
    'auth.verificationResent': 'Hemos reenviado el correo de verificación. Por favor, revisa tu bandeja de entrada.',
    'auth.resendVerification': 'Reenviar correo de verificación',
    'auth.continueWith': 'O continúa con',
    'auth.alreadyHaveAccount': '¿Ya tienes una cuenta?',
    'auth.registerWelcome': 'Únete a nuestra comunidad de reciclaje',
    'auth.registerIntro': '¡Bienvenido a GarbageSocial!',
    'auth.registerExplanation': 'Para formar parte de nuestra comunidad exclusiva de reciclaje, necesitas crear una cuenta. Completa el formulario a continuación para comenzar.',
    'auth.noAccount': 'Crear una cuenta',
    'auth.demoCredentials': 'Acceso de demostración:',
    'auth.demoUser': 'Usuario',
    'auth.demoPassword': 'Contraseña: password123',
    'auth.loginExplanation': 'Inicia sesión para acceder a todas las funciones de la plataforma.',
    
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
    
    // Residuos (Wastes)
    'waste.type': 'Tipo de Residuo',
    'waste.types.organic': 'Orgánico',
    'waste.types.paper': 'Papel',
    'waste.types.glass': 'Vidrio',
    'waste.types.plastic': 'Plástico',
    'waste.types.metal': 'Metal',
    'waste.types.sanitary': 'Control Sanitario',
    'waste.types.dump': 'Basural',
    'waste.types.various': 'Varios',
    'waste.status.pending': 'Pendiente',
    'waste.status.in_progress': 'En proceso',
    'waste.status.collected': 'Retirado',
    'waste.status.canceled': 'Cancelado',
    'waste.status.unknown': 'Desconocido',
    'waste.commit': 'Comprometerme a Retirar',
    'waste.committing': 'Registrando compromiso...',
    'waste.cancelCommitment': 'Cancelar Compromiso',
    'waste.confirmCollection': 'Confirmar Recolección',
    'waste.actions': 'Acciones',
    'waste.ratings': 'Calificaciones',
    'waste.reportPost': 'Reportar publicación',
    'waste.cancelPost': 'Cancelar publicación',
    'waste.noRatings': 'No hay calificaciones disponibles',
    'waste.selectType': 'Selecciona un tipo',
    'waste.typeGroups': 'Tipos de Residuos',
    'waste.location': 'Ubicación',
    'waste.gettingLocation': 'Obteniendo ubicación...',
    'waste.latitude': 'Latitud',
    'waste.longitude': 'Longitud',
    'waste.locationPermission': 'Utilizando tu ubicación actual. Para más precisión, confirma que has concedido permisos de ubicación a tu navegador.',
    'waste.locationFailed': 'No se pudo obtener tu ubicación. Intenta de nuevo o introduce la ubicación manualmente.',
    'waste.commitment': 'Compromiso de Retiro',
    'waste.date': 'Fecha',
    'waste.recycler': 'Reciclador',
    'waste.seeMore': 'Ver más',
    'waste.seeLess': 'Ver menos',
    'waste.publishedOn': 'Publicado el',
    'waste.image': 'Imagen (opcional)',
    'waste.dragImage': 'Arrastra una imagen o haz clic para seleccionar',
    'waste.imageTypes': 'PNG, JPG, GIF hasta 5MB',
    'waste.selectImage': 'Seleccionar Imagen',
    'waste.imageError': 'El archivo debe ser una imagen',
    'waste.imageSizeError': 'La imagen no debe exceder los 5MB',
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
    'auth.verificationResent': 'We have resent the verification email. Please check your inbox.',
    'auth.resendVerification': 'Resend verification email',
    'auth.continueWith': 'Or continue with',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.registerWelcome': 'Join our recycling community',
    'auth.registerIntro': 'Welcome to GarbageSocial!',
    'auth.registerExplanation': 'To be part of our exclusive recycling community, you need to create an account. Complete the form below to get started.',
    'auth.noAccount': 'Create an account',
    'auth.demoCredentials': 'Demo access:',
    'auth.demoUser': 'User',
    'auth.demoPassword': 'Password: password123',
    'auth.loginExplanation': 'Log in to access all platform features.',
    
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
    
    // Wastes
    'waste.type': 'Waste Type',
    'waste.types.organic': 'Organic',
    'waste.types.paper': 'Paper',
    'waste.types.glass': 'Glass',
    'waste.types.plastic': 'Plastic',
    'waste.types.metal': 'Metal',
    'waste.types.sanitary': 'Sanitary Control',
    'waste.types.dump': 'Dump',
    'waste.types.various': 'Various',
    'waste.status.pending': 'Pending',
    'waste.status.in_progress': 'In Progress',
    'waste.status.collected': 'Collected',
    'waste.status.canceled': 'Canceled',
    'waste.status.unknown': 'Unknown',
    'waste.commit': 'Commit to Collect',
    'waste.committing': 'Registering commitment...',
    'waste.cancelCommitment': 'Cancel Commitment',
    'waste.confirmCollection': 'Confirm Collection',
    'waste.actions': 'Actions',
    'waste.ratings': 'Ratings',
    'waste.reportPost': 'Report Post',
    'waste.cancelPost': 'Cancel Post',
    'waste.noRatings': 'No ratings available',
    'waste.selectType': 'Select a type',
    'waste.typeGroups': 'Waste Types',
    'waste.location': 'Location',
    'waste.gettingLocation': 'Getting location...',
    'waste.latitude': 'Latitude',
    'waste.longitude': 'Longitude',
    'waste.locationPermission': 'Using your current location. For better accuracy, make sure you have granted location permissions to your browser.',
    'waste.locationFailed': 'Could not get your location. Try again or enter location manually.',
    'waste.commitment': 'Pickup Commitment',
    'waste.date': 'Date',
    'waste.recycler': 'Recycler',
    'waste.seeMore': 'See more',
    'waste.seeLess': 'See less',
    'waste.publishedOn': 'Published on',
    'waste.image': 'Image (optional)',
    'waste.dragImage': 'Drag an image or click to select',
    'waste.imageTypes': 'PNG, JPG, GIF up to 5MB',
    'waste.selectImage': 'Select Image',
    'waste.imageError': 'File must be an image',
    'waste.imageSizeError': 'Image must not exceed 5MB',
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
