
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Github, X, Facebook, Instagram, Mail, Heart 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="md:col-span-1">
            <Link to="/" className="flex flex-col items-center mb-4">
              <img 
                src="/lovable-uploads/7989feae-08a4-4881-a7f9-239a82906dd2.png" 
                alt="GarbageSocial Logo" 
                className="h-14 w-14 mb-2" 
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                GarbageSocial
              </span>
            </Link>
            <p className="text-gray-600 text-sm mb-4">
              Conectando residuos con recicladores para un mundo más limpio y sostenible.
            </p>
            <div className="flex space-x-3">
              <a 
                href="https://github.com/cyberalpha/GarbageSocial" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <Github className="h-4 w-4" />
                </Button>
              </a>
              <a 
                href="https://x.com/GarbageSocial" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </a>
              <a 
                href="https://www.facebook.com/GarbageSocial/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <Facebook className="h-4 w-4" />
                </Button>
              </a>
              <a 
                href="https://www.instagram.com/garbagesocial" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <Instagram className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
          
          {/* Links rápidos */}
          <div>
            <h3 className="font-medium text-sm mb-4 text-gray-900">Navegar</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-gray-600 hover:text-primary transition-colors">
                  Mapa de Residuos
                </Link>
              </li>
              <li>
                <Link to="/publish" className="text-gray-600 hover:text-primary transition-colors">
                  Publicar Residuo
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-600 hover:text-primary transition-colors">
                  Mi Perfil
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Recursos */}
          <div>
            <h3 className="font-medium text-sm mb-4 text-gray-900">Recursos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">
                  Guía de Reciclaje
                </a>
              </li>
              <li>
                <a href="https://garbagesocial.blogspot.com" className="text-gray-600 hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">
                  Términos y Condiciones
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contacto */}
          <div>
            <h3 className="font-medium text-sm mb-4 text-gray-900">Contacto</h3>
            <div className="space-y-3 text-sm">
              <a 
                href="mailto:socialgarbage3000@gmail.com" 
                className="flex items-center text-gray-600 hover:text-primary transition-colors"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Mail className="h-4 w-4 mr-2" />
                socialgarbage3000@gmail.com
              </a>
              <p className="text-gray-600">
                Buenos Aires, Argentina
              </p>
              <Button className="mt-2" variant="outline" size="sm">
                Contáctanos
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} GarbageSocial. Todos los derechos reservados.
          </p>
          <p className="text-gray-500 text-sm mt-2 md:mt-0 flex items-center">
            Hecho con 
            <Heart className="h-4 w-4 mx-1 text-red-500 animate-pulse" /> 
            para un mundo más limpio
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
