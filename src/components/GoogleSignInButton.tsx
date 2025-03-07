
import React, { useEffect, useRef } from 'react';
import { useAuth } from './AuthProvider';

interface GoogleSignInButtonProps {
  className?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ className }) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { loginWithSocialMedia } = useAuth();
  
  useEffect(() => {
    // Cargar el script de Google Identity Services
    const loadGoogleScript = () => {
      if (document.getElementById('google-identity-script')) {
        return; // Script ya cargado
      }
      
      const script = document.createElement('script');
      script.id = 'google-identity-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      script.onload = () => {
        initializeGoogleButton();
      };
    };
    
    const initializeGoogleButton = () => {
      if (window.google && window.google.accounts && buttonRef.current) {
        window.google.accounts.id.initialize({
          client_id: '114112049135-72gbo65i96o08g9dhr1118n94bnkfn7q.apps.googleusercontent.com', // Placeholder, client ID real debe ser configurado
          callback: (response: any) => {
            loginWithSocialMedia('google'); // Esto invocará nuestro método actualizado
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        
        // Renderizar el botón de Google
        window.google.accounts.id.renderButton(
          buttonRef.current,
          { theme: 'outline', size: 'large', width: '100%', text: 'continue_with' }
        );
      }
    };
    
    loadGoogleScript();
    
    return () => {
      // Cleanup si es necesario
      const scriptEl = document.getElementById('google-identity-script');
      if (scriptEl) {
        // Solo para cleanup en desarrollo, normalmente no removeríamos este script
        // scriptEl.remove();
      }
    };
  }, [loginWithSocialMedia]);
  
  return (
    <div id="googleSignInButton" ref={buttonRef} className={className}></div>
  );
};

export default GoogleSignInButton;
