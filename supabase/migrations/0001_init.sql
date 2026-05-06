-- supabase/migrations/0001_init.sql
-- D-4o Phase 5.2 (DB 스키마 + RLS, V1 단일 사용자)
-- Refs: .claude/rules/domain-model.md §1/§3/§7, packages/domain/src/*
-- 5종: projects / locations / trades / vendors / photos
-- RLS 단일 패턴: user_id = auth.uid() (to authenticated)
-- on delete cascade 일관

begin;

-- ============================================================
-- 1. projects
-- ============================================================
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "projects_user_full_access"
  on public.projects
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- 2. locations
-- ============================================================
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.locations enable row level security;

create policy "locations_user_full_access"
  on public.locations
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- 3. trades
-- ============================================================
create table public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.trades enable row level security;

create policy "trades_user_full_access"
  on public.trades
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- 4. vendors
-- ============================================================
create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.vendors enable row level security;

create policy "vendors_user_full_access"
  on public.vendors
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- 5. photos
-- ============================================================
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  trade_id uuid not null references public.trades(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  content_text text not null,
  taken_at timestamptz not null,
  storage_path text not null,
  gallery_album text,
  created_at timestamptz not null default now()
);

alter table public.photos enable row level security;

create policy "photos_user_full_access"
  on public.photos
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- 6. 인덱스 (domain-model.md §7 정합)
-- ============================================================
-- §7.1 Photo (3개)
create index photos_project_taken_at_desc_idx
  on public.photos (project_id, taken_at desc);

create index photos_project_vendor_taken_at_desc_idx
  on public.photos (project_id, vendor_id, taken_at desc);

create index photos_project_taken_at_idx
  on public.photos (project_id, taken_at);

-- §7.2 마스터: locations/trades/vendors (project_id, name) =
--   unique 제약 자동 인덱스 의존. V1 후반 (MF-06 H4) 별도 chunk.
--   본 chunk = 인덱스 미추가 (정합 보존).

commit;
