create table if not exists public.portfolio_content (
  id text primary key check (id = 'main'),
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content enable row level security;

revoke all on public.portfolio_content from anon, authenticated;

-- Access is intentionally server-only. Netlify functions use the Supabase service role key.
