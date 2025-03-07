
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import LoginForm from '@/components/LoginForm';

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
        <h1 className="text-3xl font-bold text-center mb-8">Garbage Social</h1>
        <p className="text-center text-muted-foreground mb-8">Tu basura es nuestro tesoro</p>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
