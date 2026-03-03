import tkLogo from "@/assets/tk-logo.png";

const SITE_LINKS = [
  { label: "Resume", href: "https://thamara.co.uk/resume/" },
  { label: "Notebook", href: "https://thamara.co.uk/notebook/" },
  { label: "Now", href: "https://thamara.co.uk/now/" },
  { label: "Uses", href: "https://thamara.co.uk/uses/" },
  { label: "Contact", href: "https://thamara.co.uk/contact/" },
];

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="container py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={tkLogo} alt="TK" className="w-6 h-6 rounded" />
          <div className="text-sm">
            <span className="font-display font-bold text-foreground">Thamara Kandabada</span>
            <span className="text-muted-foreground ml-2">Generalist. Tinkerer.</span>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          {SITE_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
