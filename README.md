# NSE Portfolio Manager — Phase 2 (Supabase Auth + Database)

This is **Phase 2** of the NSE Stock Portfolio Management web app. It builds on
Phase 1's frontend and now talks to a **real Supabase backend**: real sign-up/sign-in,
a real Postgres database for portfolios and holdings, and Row Level Security so
each user only ever sees their own data.

**Stock prices are still DEMO/mock data** — a real market data provider is Phase 5.

## What's included

- Real Supabase Auth: sign up, sign in, sign out, forgot-password email flow,
  session persistence across page reloads
- Each signed-in user's portfolios and holdings are private to their account
  (enforced server-side by Postgres Row Level Security, not just app code)
- Portfolio selection page with cards (invested capital, current value, P&L, return %)
- Create / rename / delete portfolios — all persisted to Supabase
- Full dashboard per portfolio:
  - Summary cards (invested capital, market value, total P&L, today's change)
  - Interactive doughnut allocation chart (by stock or by sector), with
    click-to-highlight linking to the holdings list
  - Scrollable, searchable, sortable holdings list (10 sort options)
  - Add / edit / remove holdings — persisted to Supabase, with automatic recalculation
  - Top Gainer / Top Loser cards based on today's price change
  - "Refresh" button that simulates a price tick (prices are still demo data)
- Dark, Bloomberg-Terminal-inspired UI, responsive for desktop and mobile
- A banner clarifying what's live (auth/database) vs. still demo (prices)

## One-time setup: connect your Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. In your project's **SQL Editor**, paste and run the contents of
   `supabase/schema.sql` (included in this project). This creates the
   `portfolios` and `holdings` tables, indexes, and Row Level Security policies.
3. In **Project Settings → API**, copy your **Project URL** and **anon public** key.
4. In this project's root folder, copy `.env.example` to a new file named `.env`,
   and paste in your URL and key:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. Restart `npm run dev` if it was already running (environment variables are
   only read when the dev server starts).

If `.env` is missing or incomplete, the app shows a setup notice instead of
the login screen, so it's always obvious when this step still needs doing.

**Note on email confirmation:** by default, a new Supabase project requires
users to confirm their email before they can sign in. For quick local testing,
you can turn this off in **Authentication → Providers → Email → "Confirm email"**.
Leave it on if you want the app to behave like a real production app would.


## Getting the code into VS Code

1. Unzip `nse-portfolio.zip` anywhere on your computer, e.g. `C:\Users\you\Projects\nse-portfolio`.
2. Open VS Code.
3. Go to **File → Open Folder…** and select the unzipped `nse-portfolio` folder.
4. Open a terminal inside VS Code: **Terminal → New Terminal** (or `` Ctrl+` ``).

## Installing and running

In the VS Code terminal, inside the project folder:

```
npm install
```

This downloads the project's dependencies into a `node_modules` folder (this
can take a minute or two the first time).

Then start the local dev server:

```
npm run dev
```

You'll see output like:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

Open that `http://localhost:5173/` link in your browser. You should land on
the sign-in page. Sign in with **any** email and password (e.g.
`you@example.com` / `password123`) — it's a demo login, so nothing is
verified against a server.

Leave the terminal running while you work; it auto-reloads the page whenever
you edit a file. Press `Ctrl+C` in the terminal to stop it.

## Project structure

```
nse-portfolio/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json / tsconfig.node.json
├── .env.example           copy to .env and fill in your Supabase values
└── supabase/
│   └── schema.sql          run this once in Supabase's SQL Editor
└── src/
    ├── main.tsx              entry point
    ├── App.tsx                routes + Supabase-not-configured guard
    ├── index.css              Tailwind + global styles
    ├── vite-env.d.ts          env var typings
    ├── types/index.ts         shared TypeScript types
    ├── lib/supabaseClient.ts  Supabase client setup
    ├── services/
    │   └── marketDataService.ts   DEMO price catalog — swap for a real
    │                               provider in Phase 5; nothing else changes
    ├── utils/
    │   ├── calculations.ts    P&L / allocation / sorting logic
    │   └── format.ts          ₹ currency & percentage formatting
    ├── context/
    │   ├── AuthContext.tsx        real Supabase Auth
    │   └── PortfolioContext.tsx   portfolios/holdings via Supabase
    ├── pages/
    │   ├── LoginPage.tsx
    │   ├── PortfolioSelectionPage.tsx
    │   ├── DashboardPage.tsx
    │   └── SupabaseSetupNotice.tsx
    └── components/
        ├── DemoModeBanner.tsx
        ├── PortfolioCard.tsx
        ├── SummaryCards.tsx
        ├── AllocationChart.tsx
        ├── HoldingsList.tsx
        ├── GainerLoserCard.tsx
        └── AddStockModal.tsx
```

## What's deliberately NOT here yet (future phases)

- A real NSE-compatible market data API integration (currently mock prices
  in `src/services/marketDataService.ts`)
- Server-side functions (Supabase Edge Functions) for secure API key handling
- Deployment configuration
