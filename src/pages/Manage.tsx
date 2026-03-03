import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./Index";

const Manage = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Index />;
};

export default Manage;
