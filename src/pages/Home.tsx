
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import { Separator } from "@/components/ui/separator";
import { 
  RecycleIcon, Globe, Users, ArrowRight,
  Upload, Map, Download, Star
} from 'lucide-react';

const Home = () => {
  // Efecto para scroll al iniciar la página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <Hero />
      
      {/* Cómo Funciona Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Cómo Funciona?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              GarbageSocial facilita el proceso de reciclaje conectando a quienes generan residuos con quienes los recolectan y reciclan.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Paso 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-float">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Publica tus Residuos</h3>
              <p className="text-gray-600">
                Toma una foto del residuo, selecciona su tipo y describe brevemente su contenido. Tu ubicación se detectará automáticamente.
              </p>
            </div>
            
            {/* Paso 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-float" style={{ animationDelay: '0.3s' }}>
                <Map className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Visualiza en el Mapa</h3>
              <p className="text-gray-600">
                Los recicladores pueden ver los residuos disponibles en el mapa y comprometerse a recogerlos en un tiempo determinado.
              </p>
            </div>
            
            {/* Paso 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-float" style={{ animationDelay: '0.6s' }}>
                <Star className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Califica la Experiencia</h3>
              <p className="text-gray-600">
                Después de la recolección, ambas partes se califican mutuamente, construyendo una comunidad confiable de reciclaje.
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link to="/publish">
                Comenzar Ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Beneficios Section con fondo de degradado */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Beneficios</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              GarbageSocial ofrece ventajas para todos los usuarios y para el medio ambiente.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Beneficio 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <RecycleIcon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Reducción de Residuos</h3>
                <p className="text-gray-600">
                  Menos residuos terminan en vertederos y más materiales se reincorporan al ciclo productivo.
                </p>
              </div>
            </div>
            
            {/* Beneficio 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Impacto Ambiental Positivo</h3>
                <p className="text-gray-600">
                  Reduce la huella de carbono y la contaminación asociada con la producción de nuevos materiales.
                </p>
              </div>
            </div>
            
            {/* Beneficio 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Comunidad Sostenible</h3>
                <p className="text-gray-600">
                  Forma parte de una red de usuarios comprometidos con prácticas sostenibles y economía circular.
                </p>
              </div>
            </div>
            
            {/* Beneficio 4 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Download className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Optimización de Recursos</h3>
                <p className="text-gray-600">
                  Los recicladores pueden planificar rutas eficientes, ahorrando tiempo y combustible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary/90 to-accent/90 rounded-2xl p-10 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¡Únete a la Revolución del Reciclaje!</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Forma parte de nuestra comunidad y contribuye a crear un mundo más limpio y sostenible para las futuras generaciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100" asChild>
                <Link to="/map">
                  Explorar Mapa
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link to="/publish">
                  Publicar Residuo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
