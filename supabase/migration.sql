-- ============================================================
-- CSC Complain & Suggest Portal — Supabase Migration
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

create extension if not exists "pgcrypto";

-- ── Main table ───────────────────────────────────────────────
create table if not exists public.submissions (
  id            uuid primary key default gen_random_uuid(),
  ticket_id     text not null unique,
  type          text not null check (type in ('complaint','suggestion')),
  category      text not null check (category in (
    'Infrastructure','Academics','Hostel',
    'Cafeteria','Faculty','Events','Other'
  )),
  subject       text not null,
  description   text not null,
  name          text,
  roll_number   text,
  department    text,
  is_anonymous  boolean not null default false,
  status        text not null default 'submitted' check (status in (
    'submitted','under_review','forwarded','resolved'
  )),
  status_history jsonb not null default '[]'::jsonb,
  upvotes       integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists submissions_updated_at on public.submissions;
create trigger submissions_updated_at
  before update on public.submissions
  for each row execute function public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
alter table public.submissions enable row level security;

create policy "anon_insert" on public.submissions
  for insert to anon with check (true);

create policy "anon_select" on public.submissions
  for select to anon using (true);

-- Only upvotes can be incremented by anon users
create policy "anon_upvote" on public.submissions
  for update to anon using (true)
  with check (
    status       = (select status       from public.submissions s where s.id = submissions.id) and
    type         = (select type         from public.submissions s where s.id = submissions.id) and
    category     = (select category     from public.submissions s where s.id = submissions.id) and
    subject      = (select subject      from public.submissions s where s.id = submissions.id) and
    description  = (select description  from public.submissions s where s.id = submissions.id)
  );

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists idx_sub_ticket   on public.submissions (ticket_id);
create index if not exists idx_sub_type     on public.submissions (type);
create index if not exists idx_sub_status   on public.submissions (status);
create index if not exists idx_sub_category on public.submissions (category);
create index if not exists idx_sub_created  on public.submissions (created_at desc);

-- ── Seed data ────────────────────────────────────────────────
insert into public.submissions
  (ticket_id,type,category,subject,description,is_anonymous,status,status_history,upvotes)
values
  ('CSC-2026-100001','suggestion','Cafeteria','Add more vegetarian options',
   'The cafeteria menu lacks variety for vegetarians. A dedicated veg counter would help.',
   true,'under_review',
   '[{"status":"submitted","timestamp":"2026-07-01T09:00:00Z"},{"status":"under_review","timestamp":"2026-07-03T11:00:00Z"}]',
   14),
  ('CSC-2026-100002','suggestion','Infrastructure','Fix broken benches in Block B',
   'Several benches in Block B corridor are damaged. Students are sitting on the floor.',
   true,'forwarded',
   '[{"status":"submitted","timestamp":"2026-07-05T10:00:00Z"},{"status":"under_review","timestamp":"2026-07-06T09:00:00Z"},{"status":"forwarded","timestamp":"2026-07-08T14:00:00Z"}]',
   22),
  ('CSC-2026-100003','suggestion','Academics','Extend library hours to 9 PM',
   'Library closes at 6 PM. Extending to 9 PM would help students study before exams.',
   true,'submitted',
   '[{"status":"submitted","timestamp":"2026-07-10T08:00:00Z"}]',
   31),
  ('CSC-2026-100004','complaint','Infrastructure','Leaking roof in Lab 3',
   'The roof in Computer Lab 3 leaks during rain causing equipment hazard.',
   true,'resolved',
   '[{"status":"submitted","timestamp":"2026-06-20T08:00:00Z"},{"status":"under_review","timestamp":"2026-06-21T10:00:00Z"},{"status":"forwarded","timestamp":"2026-06-22T12:00:00Z"},{"status":"resolved","timestamp":"2026-06-25T16:00:00Z"}]',
   5),
  ('CSC-2026-100005','suggestion','Events','More cultural fest activities',
   'Adding more inter-department events would boost student engagement at the annual fest.',
   false,'submitted',
   '[{"status":"submitted","timestamp":"2026-07-12T11:00:00Z"}]',
   9)
on conflict (ticket_id) do nothing;

-- ── Contact messages table ───────────────────────────────────
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "anon_insert_contact" on public.contact_messages
  for insert to anon with check (true);
