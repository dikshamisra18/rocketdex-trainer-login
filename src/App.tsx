import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Auth from "./pages/Auth";
import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import HelpPage from "./pages/HelpPage";
import NotFound from "./pages/NotFound";
import SecretFeed from "./pages/SecretFeed";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen bg-gradient-to-b from-night-top to-night-bottom flex items-center justify-center"><p className="font-pixel text-[10px] text-primary-foreground animate-pulse">Loading...</p></div>;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/feed" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AuthRoute><Auth /></AuthRoute>} />
            <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
            <Route path="/pokedex-debug-v2" element={<SecretFeed />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
