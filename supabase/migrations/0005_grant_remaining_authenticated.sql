-- supabase/migrations/0005_grant_remaining_authenticated.sql
-- Phase 5.5.1: KI-22 GRANT 보충 (locations / trades / vendors / photos).
-- 0002 (projects) 와 동일 패턴. RLS policy 는 0001 에서 이미 활성.
-- 본 migration 은 table-level GRANT 만 추가.

begin;

grant select, insert, update, delete on table public.locations to authenticated;
grant select, insert, update, delete on table public.trades to authenticated;
grant select, insert, update, delete on table public.vendors to authenticated;
grant select, insert, update, delete on table public.photos to authenticated;

commit;
