-- supabase/migrations/0004_relax_photos_fk.sql
-- Phase 5.5.1: photos FK 3개 nullable.
-- project_id 만 NOT NULL 유지. location/trade/vendor → nullable.
-- 결정 §a v2 옵션 B (D-4u, phase-5.5-decomposition.md v2 = 0cf629c).

begin;

alter table public.photos alter column location_id drop not null;
alter table public.photos alter column trade_id drop not null;
alter table public.photos alter column vendor_id drop not null;

commit;
