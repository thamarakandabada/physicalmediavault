import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Alphabetical from "./pages/Alphabetical";
import Criterion from "./pages/Criterion";
import Stats from "./pages/Stats";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Manage from "./pages/Manage";
import NotFound from "./pages/NotFound";
import Colophon from "./pages/Colophon";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/alphabetical" element={<Alphabetical />} />
                <Route path="/criterion" element={<Criterion />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/manage" element={<Manage />} />
                <Route path="/colophon" element={<Colophon />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
