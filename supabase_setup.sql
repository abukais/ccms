-- ============================================================
-- CSC Portal — Complete Supabase Setup
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- 1. Submissions table
create table if not exists public.submissions (
  id              uuid primary key default gen_random_uuid(),
  ticket_id       text not null unique,
  type            text not null check (type in ('complaint','suggestion')),
  category        text not null check (category in ('Infrastructure','Academics','Hostel','Cafeteria','Faculty','Events','Other')),
  subject         text not null,
  description     text not null,
  name            text,
  roll_number     text,
  department      text,
  is_anonymous    boolean not null default false,
  status          text not null default 'submitted' check (status in ('submitted','under_review','forwarded','resolved')),
  status_history  jsonb not null default '[]'::jsonb,
  admin_notes     jsonb not null default '[]'::jsonb,
  image_urls      jsonb not null default '[]'::jsonb,
  upvotes         integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 2. Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists trg_submissions_updated_at on public.submissions;
create trigger trg_submissions_updated_at
  before update on public.submissions
  for each row execute procedure public.set_updated_at();

-- 3. Contact messages
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  created_at timestamptz not null default now()
);

-- 4. RLS
alter table public.submissions      enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "anon_insert_submissions" on public.submissions;
create policy "anon_insert_submissions" on public.submissions for insert to anon, authenticated with check (true);

drop policy if exists "anon_select_submissions" on public.submissions;
create policy "anon_select_submissions" on public.submissions for select to anon, authenticated using (true);

drop policy if exists "anon_update_submissions" on public.submissions;
create policy "anon_update_submissions" on public.submissions for update to anon, authenticated using (true) with check (true);

drop policy if exists "anon_insert_contact" on public.contact_messages;
create policy "anon_insert_contact" on public.contact_messages for insert to anon, authenticated with check (true);

-- 5. Indexes
create index if not exists idx_submissions_ticket_id on public.submissions (ticket_id);
create index if not exists idx_submissions_type      on public.submissions (type);
create index if not exists idx_submissions_status    on public.submissions (status);
create index if not exists idx_submissions_created   on public.submissions (created_at desc);

-- 6. Storage bucket for images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('submission-images', 'submission-images', true, 5242880, array['image/jpeg','image/jpg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/jpg','image/png','image/webp','image/gif'];

drop policy if exists "public_upload" on storage.objects;
create policy "public_upload" on storage.objects for insert to anon, authenticated with check (bucket_id = 'submission-images');

drop policy if exists "public_read" on storage.objects;
create policy "public_read" on storage.objects for select to anon, authenticated using (bucket_id = 'submission-images');

-- 7. Sample data
insert into public.submissions (ticket_id, type, category, subject, description, is_anonymous, status, status_history, admin_notes, image_urls, upvotes)
values
  ('CSC-2026-100001','suggestion','Infrastructure','Fix the broken water cooler on 3rd floor',
   'The water cooler near Room 302 has been out of order for two weeks.',
   true,'under_review',
   '[{"status":"submitted","timestamp":"2026-07-01T09:00:00Z"},{"status":"under_review","timestamp":"2026-07-02T10:30:00Z","note":"Logged with maintenance."}]',
   '[{"text":"Work order raised. Parts expected in 3 days.","timestamp":"2026-07-03T11:00:00Z"}]',
   '[]',12),
  ('CSC-2026-100002','suggestion','Cafeteria','Add more vegetarian options',
   'The lunch menu has very few vegetarian choices. A dedicated veg counter would help.',
   true,'submitted','[{"status":"submitted","timestamp":"2026-07-15T11:00:00Z"}]','[]','[]',8),
  ('CSC-2026-100003','complaint','Academics','Projector not working in Room 201',
   'The projector flickers during morning lectures making slides unreadable.',
   false,'resolved',
   '[{"status":"submitted","timestamp":"2026-06-20T08:00:00Z"},{"status":"under_review","timestamp":"2026-06-21T09:00:00Z"},{"status":"forwarded","timestamp":"2026-06-23T11:00:00Z"},{"status":"resolved","timestamp":"2026-06-28T10:00:00Z","note":"Projector replaced."}]',
   '[{"text":"New projector has been installed in Room 201.","timestamp":"2026-06-28T10:00:00Z"}]',
   '[]',0),
  ('CSC-2026-100004','suggestion','Events','Organise an inter-college hackathon',
   'CSC should host a 24-hour hackathon open to other colleges.',
   true,'resolved',
   '[{"status":"submitted","timestamp":"2026-05-10T07:00:00Z"},{"status":"under_review","timestamp":"2026-05-11T08:00:00Z"},{"status":"resolved","timestamp":"2026-06-01T12:00:00Z","note":"Hackathon approved for August 2026!"}]',
   '[{"text":"Great idea! Principal approved. Announcement coming soon.","timestamp":"2026-05-14T09:00:00Z"}]',
   '[]',24),
  ('CSC-2026-100005','complaint','Hostel','Hot water not available before 7AM',
   'Hot water supply in the hostel shuts off before 7AM. Most students have early morning classes.',
   true,'under_review',
   '[{"status":"submitted","timestamp":"2026-07-20T06:30:00Z"},{"status":"under_review","timestamp":"2026-07-21T09:00:00Z"}]',
   '[]','[]',5)
on conflict (ticket_id) do nothing;

select count(*) as total_submissions from public.submissions;
