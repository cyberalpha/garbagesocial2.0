
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/AuthProvider";
import { 
  Menu, X, Map, User, Upload, Home, 
  LogIn, LogOut 
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { currentUser, logout } = useAuth();

  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const handleAuthAction = () => {
    if (currentUser) {
      logout();
    } else {
      navigate('/login');
    }
  };
  
  const handleNavLinkClick = (path: string) => {
    // Si el usuario no está autenticado y la ruta requiere autenticación,
    // redirigir a la página de inicio de sesión
    if (!currentUser && (path === '/map' || path === '/publish' || path === '/profile')) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  // Navigation links
  const navLinks = [
    { name: 'Inicio', path: '/', icon: <Home className="mr-2 h-4 w-4" /> },
    { name: 'Mapa', path: '/map', icon: <Map className="mr-2 h-4 w-4" /> },
    { name: 'Publicar', path: '/publish', icon: <Upload className="mr-2 h-4 w-4" /> },
    { name: 'Perfil', path: '/profile', icon: <User className="mr-2 h-4 w-4" /> },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 transition-transform duration-300 hover:scale-105"
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              GarbageSocial
            </span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Button 
                  key={link.path} 
                  variant="ghost"
                  onClick={() => handleNavLinkClick(link.path)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center ${
                    location.pathname === link.path 
                      ? 'text-primary bg-primary/10' 
                      : 'text-gray-700 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Button>
              ))}
            </nav>
          )}

          {/* Auth Button - Desktop */}
          <div className="hidden md:block">
            <Button 
              variant={currentUser ? "outline" : "default"} 
              size="sm"
              className="flex items-center"
              onClick={handleAuthAction}
            >
              {currentUser ? (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Salir
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Ingresar
                </>
              )}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleMenu}
              className="md:hidden"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobile && isMenuOpen && (
        <div className="md:hidden animate-fade-in">
          <div className="bg-white/95 backdrop-blur-sm shadow-lg border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  variant="ghost"
                  onClick={() => handleNavLinkClick(link.path)}
                  className={`w-full justify-start px-3 py-2 rounded-md text-base font-medium flex items-center ${
                    location.pathname === link.path 
                      ? 'text-primary bg-primary/10' 
                      : 'text-gray-700 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Button>
              ))}

              {/* Auth Button - Mobile */}
              <Button 
                variant={currentUser ? "outline" : "default"} 
                className="w-full justify-start mt-4 flex items-center"
                onClick={handleAuthAction}
              >
                {currentUser ? (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Salir
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Ingresar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
