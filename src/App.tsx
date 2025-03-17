
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { LanguageProvider } from "@/components/LanguageContext";
import InternetConnectionAlert from './components/InternetConnectionAlert';
import SupabaseConnectionAlert from './components/SupabaseConnectionAlert';
import GeolocationAlert from './components/GeolocationAlert';
import StabilityManager from './components/StabilityManager';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import SupabaseDiagnostic from "./pages/SupabaseDiagnostic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000 // 5 minutos
    }
  }
});

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/supabase-diagnostic" element={<SupabaseDiagnostic />} />
      {/* Rutas de Perfil y Residuo eliminadas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <InternetConnectionAlert />
          <SupabaseConnectionAlert />
          <GeolocationAlert />
          <BrowserRouter>
            <StabilityManager>
              <Navbar />
              <main className="pt-16 min-h-[calc(100vh-64px)]">
                <AppRoutes />
              </main>
              <Footer />
            </StabilityManager>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
