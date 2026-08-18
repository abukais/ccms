-- ============================================================
-- Storage bucket fix — run in Supabase SQL Editor
-- ============================================================

-- 1. Create or update the bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'submission-images',
  'submission-images',
  true,
  5242880,
  array['image/jpeg','image/jpg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public             = true,
  file_size_limit    = 5242880,
  allowed_mime_types = array['image/jpeg','image/jpg','image/png','image/webp','image/gif'];

-- 2. Drop existing policies if they exist (correct syntax)
drop policy if exists "public_upload" on storage.objects;
drop policy if exists "public_read"   on storage.objects;

-- 3. Recreate policies
create policy "public_upload"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'submission-images');

create policy "public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'submission-images');

-- 4. Verify — should show public = true
select id, name, public, file_size_limit
from storage.buckets
where id = 'submission-images';
