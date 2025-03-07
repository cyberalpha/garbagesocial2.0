
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  ArrowDownCircle, 
  RecycleIcon, 
  Globe, 
  Users
} from 'lucide-react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Pequeño retraso para permitir la animación de entrada
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-white pointer-events-none" />
      
      {/* Animated circles */}
      <div className="absolute top-1/3 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-light" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse-light" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 pt-20 pb-16 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 
            className={`text-4xl md:text-6xl font-bold text-gray-900 mb-6 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <span className="text-primary">Conectamos</span> residuos con sus{' '}
            <span className="text-primary">recicladores</span>
          </h1>
          
          {/* Subtitle */}
          <p 
            className={`text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl transition-all duration-700 delay-100 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            Una plataforma que optimiza la economía circular conectando a quienes 
            desechan residuos con quienes los reciclan y reutilizan
          </p>
          
          {/* CTA buttons */}
          <div 
            className={`flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-16 transition-all duration-700 delay-200 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <Button 
              size="lg" 
              className="rounded-full px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              asChild
            >
              <Link to="/map">Ver Residuos en el Mapa</Link>
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="rounded-full px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              asChild
            >
              <Link to="/publish">Publicar un Residuo</Link>
            </Button>
          </div>
          
          {/* Features */}
          <div 
            className={`grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 transition-all duration-700 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 border border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <RecycleIcon className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Reduce, Reutiliza, Recicla</h3>
              <p className="text-gray-600">Optimiza el ciclo de vida de los materiales y reduce el impacto ambiental.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 border border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Impacto Ambiental</h3>
              <p className="text-gray-600">Colabora con la reducción de la contaminación y la conservación de recursos naturales.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 border border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Comunidad Activa</h3>
              <p className="text-gray-600">Forma parte de una red de usuarios comprometidos con el medio ambiente.</p>
            </div>
          </div>
        </div>
        
        {/* Scroll down indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ArrowDownCircle className="w-10 h-10 text-primary opacity-70" />
        </div>
      </div>
    </div>
  );
};

export default Hero;
