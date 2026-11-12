-- Run this in the Supabase SQL editor.
-- The service-role key is used only by server routes and must never be exposed to the browser.

create extension if not exists pgcrypto;

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  household_label text,
  rsvp_deadline date,
  created_at timestamptz not null default now()
);

create table if not exists public.invited_guests (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  can_rsvp boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists invited_guests_name_idx
  on public.invited_guests (lower(first_name), lower(last_name));
create index if not exists invited_guests_invitation_idx
  on public.invited_guests (invitation_id);

create table if not exists public.rsvp_submissions (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null unique references public.invitations(id) on delete cascade,
  submitted_by_guest_id uuid not null references public.invited_guests(id),
  responses jsonb not null,
  dietary_restrictions text not null default '',
  message text not null default '',
  submitted_at timestamptz not null default now()
);

alter table public.invitations enable row level security;
alter table public.invited_guests enable row level security;
alter table public.rsvp_submissions enable row level security;

-- No public policies are intentionally created. Browser clients cannot read guest
-- records or RSVP submissions. Server routes use the service-role key securely.
-- For production, add rate limiting / CAPTCHA at the hosting layer to reduce
-- automated name-guessing attempts.

-- Example: create an invitation and add the invited guests.
-- insert into public.invitations (household_label) values ('Farr Household') returning id;
-- insert into public.invited_guests (invitation_id, first_name, last_name)
-- values ('PASTE-INVITATION-UUID', 'Guest', 'Surname'),
--        ('PASTE-INVITATION-UUID', 'Another', 'Surname');
