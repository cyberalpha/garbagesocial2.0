
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import RegisterForm from '@/components/RegisterForm';

const Register = () => {
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
        <p className="text-center text-muted-foreground mb-8">Únete a nuestra comunidad de reciclaje</p>
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
