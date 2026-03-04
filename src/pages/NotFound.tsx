import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { PageMeta } from "@/components/PageMeta";
import { Home, Mail } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <PageMeta
        title="404 — Physical Media Vault"
        description="Page not found."
        path={location.pathname}
      />

      {/* Icon — map-style illustration via emoji */}
      <div className="text-7xl mb-8 opacity-60 select-none">🗺️</div>

      {/* Headline */}
      <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
        Hic Sunt Dracones.
      </h1>

      {/* Subtitle */}
      <p className="text-lg md:text-xl text-muted-foreground max-w-lg text-center leading-relaxed mb-12">
        You have reached the edge of the map. It's not safe here. Turn back, before it's too late.
      </p>

      {/* Action cards */}
      <div className="bg-card border border-border rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-12">
        <Link
          to="/"
          className="flex items-center gap-3 text-foreground hover:text-gold transition-colors group"
        >
          <Home className="w-8 h-8 text-muted-foreground group-hover:text-gold transition-colors" />
          <span className="font-semibold">Head Back Home →</span>
        </Link>

        <a
          href="https://thamara.co.uk/contact/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-foreground hover:text-gold transition-colors group"
        >
          <Mail className="w-8 h-8 text-muted-foreground group-hover:text-gold transition-colors" />
          <span className="font-semibold">Light a Beacon →</span>
        </a>
      </div>
    </div>
  );
};

export default NotFound;
