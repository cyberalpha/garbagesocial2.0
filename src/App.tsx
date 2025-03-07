
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { LanguageProvider } from "@/components/LanguageContext";
import Home from "./pages/Home";
import MapView from "./pages/MapView";
import PublishWaste from "./pages/PublishWaste";
import WasteDetail from "./pages/WasteDetail";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

// Componente para rutas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    // Cuando isLoading cambia a false, sabemos que la verificación de autenticación ha terminado
    if (!isLoading) {
      setAuthChecked(true);
    }
  }, [isLoading]);

  // Si aún estamos verificando la autenticación, mostrar pantalla de carga
  if (!authChecked) {
    return (
      <div className="pt-20 container mx-auto text-center">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigir a login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario autenticado, mostrar el contenido protegido
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/map" element={
        <ProtectedRoute>
          <MapView />
        </ProtectedRoute>
      } />
      <Route path="/publish" element={
        <ProtectedRoute>
          <PublishWaste />
        </ProtectedRoute>
      } />
      <Route path="/waste/:id" element={
        <ProtectedRoute>
          <WasteDetail />
        </ProtectedRoute>
      } />
      <Route path="/profile/:id" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
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
          <BrowserRouter>
            <Navbar />
            <main className="pt-16"> {/* Adjust for navbar height */}
              <AppRoutes />
            </main>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
