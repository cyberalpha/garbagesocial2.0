
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthProvider from "@/components/AuthProvider";
import { useSupabaseConnection } from "@/hooks/useSupabaseConnection";
import SupabaseConnectionAlert from "@/components/SupabaseConnectionAlert";
import ErrorBoundary from "@/components/ErrorBoundary";
import StabilityManager from "@/components/StabilityManager";
import { LanguageProvider } from "@/components/LanguageContext";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import SupabaseDiagnostic from "@/pages/SupabaseDiagnostic";
import MapView from "@/pages/MapView";
import PublishWaste from "@/pages/PublishWaste";
import GeolocationAlert from "@/components/GeolocationAlert";

function App() {
  const { checkConnection } = useSupabaseConnection();

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <StabilityManager>
                <Toaster />
                <SupabaseConnectionAlert />
                <GeolocationAlert />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/:id" element={<Profile />} />
                  <Route path="/admin/diagnostics" element={<SupabaseDiagnostic />} />
                  <Route path="/map" element={<MapView />} />
                  <Route path="/publish" element={<PublishWaste />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </StabilityManager>
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
