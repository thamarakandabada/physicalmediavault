import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import tkLogo from "@/assets/tk-logo.png";

const NAV_ITEMS = [
  { path: "/", label: "Collection" },
  { path: "/alphabetical", label: "A–Z" },
  { path: "/criterion", label: "Criterion" },
  { path: "/stats", label: "Stats" },
  { path: "/wishlist", label: "Wishlist" },
  { path: "/oracle", label: "Oracle", icon: true },
];

export function AppHeader() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="px-3 sm:px-6 lg:container flex items-center justify-between h-14 sm:h-16">
        <div className="flex items-center gap-2 sm:gap-6 min-w-0">
          <Link to="/" className="flex items-center gap-1.5 shrink-0">
            <img src={tkLogo} alt="TK" className="w-5 h-5 sm:w-6 sm:h-6 rounded" />
            <span className="font-display text-base sm:text-xl font-bold hidden sm:inline">Physical Media Vault</span>
          </Link>
          <nav className="flex items-center gap-0.5 sm:gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                  location.pathname === item.path
                    ? "bg-secondary text-gold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {user && (
            <>
              <Link to="/manage">
                <Button variant="outline" size="sm" className="border-gold-dim text-gold hover:bg-gold/10 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
                  Manage
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground h-8 sm:h-9 w-8 sm:w-9 p-0">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
