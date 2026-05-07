-- supabase/migrations/0002_grant_projects_authenticated.sql
-- D-4o Phase 5.2 (Chunk 5) GRANT 누락 보충
-- 0001_init.sql 은 RLS policy 만 정의. authenticated role 의
-- table-level privilege 가 없어 INSERT/SELECT 가 권한 거부됨.
-- RLS policy `projects_user_full_access` (ALL with user_id = auth.uid())
-- 는 이미 활성. 본 migration 은 table-level GRANT 만 추가.

begin;

grant select, insert, update, delete on table public.projects to authenticated;

commit;
