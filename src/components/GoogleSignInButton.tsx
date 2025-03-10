
import React, { useEffect, useRef } from 'react';
import { useAuth } from './AuthProvider';
import { useToast } from '@/components/ui/use-toast';

interface GoogleSignInButtonProps {
  className?: string;
  disabled?: boolean; // Add the disabled prop
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ className, disabled }) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { loginWithSocialMedia } = useAuth();
  const { toast } = useToast();
  
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
        console.log('Google Identity Services script loaded successfully');
        initializeGoogleButton();
      };

      script.onerror = () => {
        console.error('Failed to load Google Identity Services script');
        toast({
          title: "Error de autenticación",
          description: "No se pudo cargar el servicio de autenticación de Google",
          variant: "destructive"
        });
      };
    };
    
    const initializeGoogleButton = () => {
      if (window.google && window.google.accounts && buttonRef.current) {
        try {
          // Este client_id es un ejemplo y necesita ser reemplazado con un ID válido
          // Debe ser configurado en Google Cloud Console
          const CLIENT_ID = '114112049135-72gbo65i96o08g9dhr1118n94bnkfn7q.apps.googleusercontent.com';
          
          console.log('Initializing Google button with client ID:', CLIENT_ID);
          
          window.google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: (response: any) => {
              console.log("Google Auth Response received");
              if (response.credential) {
                loginWithSocialMedia('google');
              } else {
                console.error("No credential in response", response);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          
          // Renderizar el botón de Google
          window.google.accounts.id.renderButton(
            buttonRef.current,
            { 
              theme: 'outline', 
              size: 'large', 
              width: '100%', 
              text: 'continue_with',
              // Add a disabled state if supported (though Google button doesn't support it directly)
            }
          );
          
          console.log('Google button rendered successfully');
        } catch (error) {
          console.error('Error initializing Google button:', error);
          toast({
            title: "Error de configuración",
            description: "Error al configurar el botón de Google. Verifica el Client ID.",
            variant: "destructive"
          });
        }
      } else {
        console.error('Google Identity Services not available or button reference not found');
      }
    };
    
    loadGoogleScript();
    
    return () => {
      // Cleanup si es necesario
    };
  }, [loginWithSocialMedia, toast]);
  
  return (
    <div 
      id="googleSignInButton" 
      ref={buttonRef} 
      className={`${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* El botón de Google se renderizará aquí */}
    </div>
  );
};

export default GoogleSignInButton;
