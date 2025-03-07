
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import LoginForm from '@/components/LoginForm';
import { Card } from '@/components/ui/card';

const Login = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Si ya hay un usuario autenticado, redirigir al inicio
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4">Garbage Social</h1>
        <p className="text-center text-muted-foreground mb-4">Tu basura es nuestro tesoro</p>
        <Card className="p-4 mb-4 bg-primary/5 border-primary/20">
          <p className="text-center text-sm">
            <strong>¡Bienvenido a GarbageSocial!</strong> Esta es una red exclusiva para compartir y reciclar residuos.
            Para continuar, debes iniciar sesión o crear una cuenta.
          </p>
        </Card>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
