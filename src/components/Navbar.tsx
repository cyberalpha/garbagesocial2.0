import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/components/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { Menu, X, MapPin, PlusCircle, UserCircle, LogOut, Home, Trash2, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import ConnectionIndicator from './ConnectionIndicator';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      console.log("Intentando cerrar sesión...");
      await logout();
      toast({
        description: "Sesión cerrada exitosamente",
      });
      console.log("Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cerrar la sesión. Intente nuevamente."
      });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const renderNavLinks = () => {
    return (
      <>
        <Link 
          to="/" 
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors",
            location.pathname === "/" ? "font-medium text-primary" : "text-gray-700"
          )}
          onClick={closeMenu}
        >
          <Home size={18} />
          <span>{t('nav.home')}</span>
        </Link>
        <Link 
          to="/map" 
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors",
            location.pathname === "/map" ? "font-medium text-primary" : "text-gray-700"
          )}
          onClick={closeMenu}
        >
          <MapPin size={18} />
          <span>{t('nav.map')}</span>
        </Link>
        {currentUser && (
          <>
            <Link 
              to="/publish" 
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors",
                location.pathname === "/publish" ? "font-medium text-primary" : "text-gray-700"
              )}
              onClick={closeMenu}
            >
              <PlusCircle size={18} />
              <span>{t('nav.publish')}</span>
            </Link>
            <Link 
              to="/profile" 
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors",
                location.pathname === "/profile" ? "font-medium text-primary" : "text-gray-700"
              )}
              onClick={closeMenu}
            >
              <UserCircle size={18} />
              <span>{t('nav.profile')}</span>
            </Link>
          </>
        )}
        <Link 
          to="/supabase-diagnostic" 
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors",
            location.pathname === "/supabase-diagnostic" ? "font-medium text-primary" : "text-gray-700"
          )}
          onClick={closeMenu}
        >
          <Activity size={18} />
          <span>Diagnóstico</span>
        </Link>
      </>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <Trash2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-gray-900">EcoResiduos</span>
          </Link>
          
          <div className="ml-4">
            <ConnectionIndicator />
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          {renderNavLinks()}
        </div>
        
        <div className="flex items-center gap-2">
          <LanguageSelector />
          
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    {currentUser.profileImage ? (
                      <AvatarImage src={currentUser.profileImage} alt={currentUser.name} />
                    ) : (
                      <AvatarFallback>{currentUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>{t('nav.profile')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('auth.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button size="sm" variant="default">
                {t('auth.login')}
              </Button>
            </Link>
          )}
          
          <button 
            className="md:hidden"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      <div 
        className={cn(
          "fixed inset-0 bg-white z-40 transition-transform duration-300 pt-16",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-1">
          {renderNavLinks()}
          {currentUser && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-red-600"
            >
              <LogOut size={18} />
              <span>{t('auth.logout')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
