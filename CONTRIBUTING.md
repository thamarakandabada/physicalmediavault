# Contributing to Physical Media Vault

Thanks for your interest in contributing! This app was built for my own physical media collection, but improvements, bug fixes, and new features are welcome via Pull Request.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A [Supabase](https://supabase.com/) project (free tier works)

### Local Setup

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/physical-media-vault.git
cd physical-media-vault

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Fill in your Supabase project URL and anon key

# 4. Run database migrations
npx supabase db push

# 5. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Code Style

- **Language:** TypeScript — strict mode, no `any` types unless absolutely necessary
- **Framework:** React 18 with functional components and hooks
- **Styling:** Tailwind CSS with semantic design tokens defined in `src/index.css` and `tailwind.config.ts`
  - Use design system tokens (`bg-primary`, `text-foreground`, etc.) — do **not** hardcode colors
  - All color values should be HSL
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) — extend existing components rather than creating new primitives
- **State Management:** [TanStack React Query](https://tanstack.com/query) for server state
- **Formatting:** Keep files clean and consistent with the existing codebase

### File Structure

```
src/
├── components/      # Reusable UI components
├── hooks/           # Custom React hooks (auth, data fetching)
├── integrations/    # Supabase client & generated types (do not edit)
├── lib/             # Utilities and API helpers
├── pages/           # Route-level page components
supabase/
├── functions/       # Edge Functions
├── migrations/      # Database schema migrations
```

### Naming Conventions

- **Components:** PascalCase (`TitleCard.tsx`)
- **Hooks:** camelCase with `use` prefix (`useTitles.ts`)
- **Utilities:** camelCase (`bluray-api.ts`)
- **CSS classes:** Use Tailwind utilities and semantic tokens

## Pull Request Guidelines

1. **Fork** the repository and create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Keep PRs focused** — one feature or fix per PR. Small, reviewable changes are preferred.

3. **Write clear commit messages:**
   ```
   feat: add director filtering to stats page
   fix: correct region badge alignment on mobile
   docs: update README with new screenshots
   ```
   Use [Conventional Commits](https://www.conventionalcommits.org/) format when possible.

4. **Test your changes** locally before submitting.

5. **Don't modify auto-generated files:**
   - `src/integrations/supabase/client.ts`
   - `src/integrations/supabase/types.ts`
   - `.env`
   - `supabase/config.toml`

6. **Open the PR** against `main` with a clear description of what changed and why.

## Reporting Issues

If you find a bug or have a feature idea, please [open an issue](https://github.com/YOUR_USERNAME/physical-media-vault/issues) with:

- A clear title and description
- Steps to reproduce (for bugs)
- Expected vs. actual behavior
- Screenshots if applicable

## Important Notes

- This app is tailored to a specific personal workflow. Not every feature request will be accepted, but all are appreciated.
- PRs are reviewed and merged manually by the maintainer.
- The live app only redeploys when the owner triggers a publish — your PR won't affect the live site until explicitly deployed.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
