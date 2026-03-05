import { PageMeta } from "@/components/PageMeta";
import { Separator } from "@/components/ui/separator";
import { ExternalLink } from "lucide-react";

const STACK_ITEMS = [
  { name: "React 18", url: "https://react.dev", desc: "UI library" },
  { name: "TypeScript", url: "https://www.typescriptlang.org", desc: "Type-safe JavaScript" },
  { name: "Vite", url: "https://vite.dev", desc: "Build tool & dev server" },
  { name: "Tailwind CSS", url: "https://tailwindcss.com", desc: "Utility-first CSS framework" },
  { name: "shadcn/ui", url: "https://ui.shadcn.com", desc: "Accessible component primitives" },
  { name: "TanStack Query", url: "https://tanstack.com/query", desc: "Async state management" },
  { name: "Recharts", url: "https://recharts.org", desc: "Charting library for stats" },
  { name: "Lovable Cloud", url: "https://lovable.dev", desc: "Backend, auth, storage & edge functions" },
];

const COLOURS = [
  { name: "Background", swatch: "bg-background", hex: "#101519" },
  { name: "Card", swatch: "bg-card", hex: "#181D23" },
  { name: "Surface", swatch: "bg-surface-elevated", hex: "#1C2129" },
  { name: "Border", swatch: "bg-border", hex: "#262C33" },
  { name: "Primary", swatch: "bg-primary", hex: "#00E054" },
  { name: "Orange", swatch: "bg-lb-orange", hex: "#FF8000" },
  { name: "Destructive", swatch: "bg-destructive", hex: "#E03E3E" },
  { name: "Foreground", swatch: "bg-foreground", hex: "#D8DCE0" },
  { name: "Muted", swatch: "bg-muted-foreground", hex: "#737A80" },
];

const BADGE_COLOURS = [
  { name: "Film", className: "badge-film" },
  { name: "Collection", className: "badge-film-collection" },
  { name: "Documentary", className: "badge-documentary" },
  { name: "Concert", className: "badge-concert" },
  { name: "TV", className: "badge-tv" },
];

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
    >
      {children}
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

const Colophon = () => {
  return (
    <>
      <PageMeta
        title="Colophon — Physical Media Vault"
        description="Design notes, typography, colour palette, and tech stack behind Physical Media Vault."
        path="/colophon"
      />

      <div className="max-w-3xl mx-auto space-y-12 animate-fade-in">
        <header>
          <h1 className="text-3xl font-display mb-2">Colophon</h1>
          <p className="text-muted-foreground leading-relaxed">
            Design and implementation notes for Physical Media Vault — a personal catalogue
            for tracking physical media collections.
          </p>
        </header>

        <Separator />

        {/* Design Philosophy */}
        <section className="space-y-4">
          <h2 className="text-xl font-display">Design Philosophy</h2>
          <p className="text-muted-foreground leading-relaxed">
            The interface takes heavy inspiration from{" "}
            <ExtLink href="https://letterboxd.com">Letterboxd</ExtLink> — a dark, cinematic
            aesthetic designed for browsing media. The palette is intentionally muted and cool-toned,
            letting cover art provide the visual interest while the chrome stays out of the way.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            A single green accent (<span className="text-primary font-mono text-sm">#00E054</span>)
            is used sparingly for primary actions and active states, ensuring clear hierarchy without
            visual clutter.
          </p>
        </section>

        <Separator />

        {/* Typography */}
        <section className="space-y-4">
          <h2 className="text-xl font-display">Typography</h2>
          <p className="text-muted-foreground leading-relaxed">
            The entire interface is set in{" "}
            <ExtLink href="https://fonts.adobe.com/fonts/rig-sans">Rig Sans</ExtLink>,
            a geometric sans-serif from{" "}
            <ExtLink href="https://fonts.adobe.com">Adobe Fonts</ExtLink>.
            Headings use weight 700; body text uses the regular weight. The font's clean geometry
            complements the grid-based card layouts without competing with cover imagery.
          </p>
          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <p className="font-display text-2xl">The quick brown fox — 700</p>
            <p className="text-lg">The quick brown fox jumps over the lazy dog — 400</p>
            <p className="text-sm text-muted-foreground font-mono">font-family: 'rig-sans', system-ui, sans-serif</p>
          </div>
        </section>

        <Separator />

        {/* Colour Palette */}
        <section className="space-y-4">
          <h2 className="text-xl font-display">Colour Palette</h2>
          <p className="text-muted-foreground leading-relaxed">
            All colours are defined as HSL CSS custom properties and mapped to Tailwind utility classes
            via semantic design tokens. Components never use hardcoded colour values.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {COLOURS.map((c) => (
              <div key={c.name} className="space-y-1.5">
                <div className={`${c.swatch} w-full aspect-square rounded-md border border-border`} />
                <p className="text-xs font-display">{c.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{c.hex}</p>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-display text-muted-foreground pt-2">Media Type Badges</h3>
          <div className="flex flex-wrap gap-2">
            {BADGE_COLOURS.map((b) => (
              <span
                key={b.name}
                className={`${b.className} px-3 py-1 rounded-full text-xs font-semibold`}
              >
                {b.name}
              </span>
            ))}
          </div>
        </section>

        <Separator />

        {/* Video Quality Accents */}
        <section className="space-y-4">
          <h2 className="text-xl font-display">Visual Indicators</h2>
          <p className="text-muted-foreground leading-relaxed">
            Collection cards use a subtle 2px left-border to convey video quality at a glance:
          </p>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-8 rounded-full bg-primary" />
              <span className="text-sm">4K UHD</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-8 rounded-full bg-film" />
              <span className="text-sm">1080p Blu-ray</span>
            </div>
          </div>
        </section>

        <Separator />

        {/* Tech Stack */}
        <section className="space-y-4">
          <h2 className="text-xl font-display">Tech Stack</h2>
          <div className="grid gap-2">
            {STACK_ITEMS.map((item) => (
              <div
                key={item.name}
                className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-4 bg-card border border-border rounded-md px-4 py-3"
              >
                <ExtLink href={item.url}>{item.name}</ExtLink>
                <span className="text-xs text-muted-foreground">{item.desc}</span>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Source */}
        <section className="space-y-4">
          <h2 className="text-xl font-display">Blog Post</h2>
          <p className="text-muted-foreground leading-relaxed">
            Read about how this project was built:{" "}
            <ExtLink href="https://thamara.co.uk/building-a-physical-media-showcase-with-lovable/">
              Building a Physical Media Showcase with Lovable
            </ExtLink>
          </p>
        </section>

        <Separator />

        <section className="space-y-4 pb-4">
          <h2 className="text-xl font-display">Source Code</h2>
          <p className="text-muted-foreground leading-relaxed">
            This project is open source under the MIT licence.{" "}
            <ExtLink href="https://github.com/thamarakandabada/physicalmediavault">
              View on GitHub
            </ExtLink>
          </p>
        </section>
      </div>
    </>
  );
};

export default Colophon;
