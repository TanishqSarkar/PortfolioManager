-- NSE Portfolio Manager — Phase 2 database schema
-- Run this once in your Supabase project's SQL Editor.
-- Safe to re-run: every statement uses IF NOT EXISTS / OR REPLACE / DROP-then-CREATE.

create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────────────────────────────────────
-- Tables
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists holdings (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references portfolios(id) on delete cascade,
  ticker_symbol text not null,
  company_name text not null,
  quantity numeric not null check (quantity >= 0),
  average_purchase_price numeric not null check (average_purchase_price >= 0),
  purchase_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- Indexes
-- ──────────────────────────────────────────────────────────────────────────

create index if not exists idx_portfolios_user_id on portfolios(user_id);
create index if not exists idx_holdings_portfolio_id on holdings(portfolio_id);

-- ──────────────────────────────────────────────────────────────────────────
-- Keep updated_at fresh on every row update
-- ──────────────────────────────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_portfolios_updated_at on portfolios;
create trigger trg_portfolios_updated_at
before update on portfolios
for each row execute function set_updated_at();

drop trigger if exists trg_holdings_updated_at on holdings;
create trigger trg_holdings_updated_at
before update on holdings
for each row execute function set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────
-- Row Level Security — every user can only see/change their own data
-- ──────────────────────────────────────────────────────────────────────────

alter table portfolios enable row level security;
alter table holdings enable row level security;

drop policy if exists "Users can view their own portfolios" on portfolios;
create policy "Users can view their own portfolios"
  on portfolios for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own portfolios" on portfolios;
create policy "Users can insert their own portfolios"
  on portfolios for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own portfolios" on portfolios;
create policy "Users can update their own portfolios"
  on portfolios for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own portfolios" on portfolios;
create policy "Users can delete their own portfolios"
  on portfolios for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can view holdings in their own portfolios" on holdings;
create policy "Users can view holdings in their own portfolios"
  on holdings for select
  using (
    exists (
      select 1 from portfolios
      where portfolios.id = holdings.portfolio_id
      and portfolios.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert holdings into their own portfolios" on holdings;
create policy "Users can insert holdings into their own portfolios"
  on holdings for insert
  with check (
    exists (
      select 1 from portfolios
      where portfolios.id = holdings.portfolio_id
      and portfolios.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update holdings in their own portfolios" on holdings;
create policy "Users can update holdings in their own portfolios"
  on holdings for update
  using (
    exists (
      select 1 from portfolios
      where portfolios.id = holdings.portfolio_id
      and portfolios.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete holdings in their own portfolios" on holdings;
create policy "Users can delete holdings in their own portfolios"
  on holdings for delete
  using (
    exists (
      select 1 from portfolios
      where portfolios.id = holdings.portfolio_id
      and portfolios.user_id = auth.uid()
    )
  );
