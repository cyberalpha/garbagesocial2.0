
import { User } from '@/types';

// Utilitaria para simular el envío de correo
export const sendVerificationEmail = (to: string, emailContent: any, userLanguage: string) => {
  console.log(`--------------------------------`);
  console.log(`📧 SIMULACIÓN DE ENVÍO DE CORREO`);
  console.log(`--------------------------------`);
  console.log(`Destinatario: ${to}`);
  console.log(`Idioma: ${userLanguage}`);
  console.log(`Asunto: ${emailContent.subject}`);
  console.log(`Título: ${emailContent.title || ''}`);
  console.log(`Contenido: ${emailContent.text}`);
  console.log(`Texto del botón: ${emailContent.buttonText || ''}`);
  console.log(`URL de verificación: ${emailContent.verificationUrl}`);
  console.log(`--------------------------------`);
  
  // En un entorno real, aquí llamaríamos a un servicio de correo
  console.log('✅ Correo enviado exitosamente (simulación)');
  
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 500); // Simular el tiempo de envío
  });
};

// Función para generar un token de verificación
export const generateVerificationToken = (email: string): string => {
  return `verify-${Date.now()}-${btoa(email)}`;
};

// Función para generar una URL de verificación
export const generateVerificationUrl = (token: string): string => {
  return `${window.location.origin}/verify-email?token=${token}`;
};

// Función para preparar el contenido del correo de verificación
export const prepareVerificationEmail = (t: Function, language: string) => {
  return {
    subject: t('email.welcome.subject'),
    title: t('email.welcome.title'),
    text: t('email.welcome.text'),
    buttonText: t('email.welcome.button'),
    footer: t('email.welcome.footer'),
    language: language
  };
};

// Función para decodificar el token JWT de Google
export const decodeJwtResponse = (token: string) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
};
