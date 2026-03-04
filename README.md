# Physical Media Vault

A personal catalogue app for tracking physical media collections — Blu-ray, 4K UHD, DVD, and more. Built with React, TypeScript, and Supabase.

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)

## Screenshots

### Collection

| Main View | Nested Titles | Add New Title |
|---|---|---|
| ![Collection](docs/screenshots/collection.png) | ![Nested Titles](docs/screenshots/collection-nested.png) | ![Add Title](docs/screenshots/collection-add-title.png) |

### Stats

| Overview | Decade Breakdown | Top Directors |
|---|---|---|
| ![Stats Overview](docs/screenshots/stats-overview.png) | ![Decades](docs/screenshots/stats-decades.png) | ![Top Directors](docs/screenshots/stats-directors.png) |

| Audio, Video & HDR | Other |
|---|---|
| ![AV & HDR](docs/screenshots/stats-av-hdr.png) | ![Other Stats](docs/screenshots/stats-other.png) |

### Wishlist

| Wishlist | Add Item | Purchased |
|---|---|---|
| ![Wishlist](docs/screenshots/wishlist.png) | ![Add Wishlist Item](docs/screenshots/wishlist-add.png) | ![Purchased](docs/screenshots/wishlist-purchased.png) |

### Criterion

![Criterion Collection](docs/screenshots/criterion.png)

### Alphabetical

![Alphabetical View](docs/screenshots/alphabetical.png)

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

## Data Privacy

Your personal collection data is stored securely in the database and is **not** included in this repository. Only the source code, configuration, and database schema (table structure) are committed to version control.

## Contributing

This app was built for my own personal collection needs, so it may not cover every use case. You're welcome to fork it, adapt it to your own workflow, and submit improvements back via PR.

Please read **[CONTRIBUTING.md](CONTRIBUTING.md)** for detailed guidelines on setup, code style, and the PR process.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
