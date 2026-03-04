# Physical Media Vault

A personal catalogue app for tracking physical media collections — Blu-ray, 4K UHD, DVD, and more. Built with React, TypeScript, and Supabase.

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- 📀 Track your physical media collection with rich metadata (director, year, audio, HDR, region, etc.)
- 🔍 Search and browse by title, alphabetically, or by Criterion spine number
- 📊 Collection statistics and breakdowns
- 🎯 Wishlist management with URL scraping
- 🖼️ Cover art via Blu-ray.com API integration
- 🔐 Per-user authentication and row-level security

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Edge Functions, Storage)
- **State:** TanStack React Query

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- A [Supabase](https://supabase.com/) project (free tier works fine)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/physical-media-vault.git
cd physical-media-vault
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase project URL and anon key (both are safe to expose client-side).

### 4. Set up the database

Run the SQL migrations in `supabase/migrations/` against your Supabase project, either via the Supabase dashboard SQL editor or the Supabase CLI:

```bash
npx supabase db push
```

### 5. Configure secrets

The following secrets need to be set in your Supabase project's Edge Function secrets (via the dashboard or CLI):

| Secret              | Purpose                          |
| ------------------- | -------------------------------- |
| `FIRECRAWL_API_KEY` | URL scraping for wishlist items  |

### 6. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
src/
├── components/      # Reusable UI components
├── hooks/           # Custom React hooks (auth, data fetching)
├── integrations/    # Supabase client & generated types
├── lib/             # Utilities and API helpers
├── pages/           # Route-level page components
supabase/
├── functions/       # Edge Functions (bluray-search, scrape-wishlist-url)
├── migrations/      # Database schema migrations
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
