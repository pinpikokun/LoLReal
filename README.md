# LoLReal

A community-driven player review platform for League of Legends. Search summoners and read/write honest reviews from fellow players.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Database / Auth:** Supabase (PostgreSQL + Auth)
- **i18n:** next-intl

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and optionally `GOOGLE_TRANSLATE_API_KEY`.

3. **Run database migrations**

   ```bash
   npx supabase db push
   ```

4. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── [locale]/      # i18n pages
│   └── api/           # Route handlers (auth, reviews, summoners, …)
├── components/        # UI & feature components
├── i18n/              # Translation files
├── lib/               # Supabase client, validators, utilities
├── middleware.ts       # Locale & auth middleware
└── types/             # Shared TypeScript types
supabase/
└── migrations/        # SQL migration files
```

## Legal

LoLReal isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
