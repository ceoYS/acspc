-- supabase/migrations/0003_storage_photos_bucket.sql
-- Phase 5.4 Storage Chunk 5 sub-5.4.1
-- bucket `photos` (private) + storage.objects RLS policy "photos_own_files"
-- Refs: .claude/rules/domain-model.md §1.5 / §9.3
-- Codex v2 반영 v3: path-shape 방어 4중 + revoke + on conflict do update
--                   + bucket-scoped policy 이름 (V2 forward-compat)

begin;

insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do update
  set public = false,
      name = excluded.name;

revoke truncate, references, trigger on storage.objects from authenticated;

drop policy if exists "photos_own_files" on storage.objects;

create policy "photos_own_files"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and array_length(storage.foldername(name), 1) = 2
  and position(chr(92) in name) = 0
  and not ('..' = any(string_to_array(name, '/')))
)
with check (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and array_length(storage.foldername(name), 1) = 2
  and position(chr(92) in name) = 0
  and not ('..' = any(string_to_array(name, '/')))
);

commit;
