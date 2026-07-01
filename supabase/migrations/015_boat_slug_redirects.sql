-- 015 — Pretty, stable listing slugs + 301 redirect map.
--
-- Boats move from `slugify(name)-<random>` (e.g. ruby-mqw3g8il) to
-- keyword-rich `<city>-<builder>-<name>` slugs. To keep already-shared /
-- indexed URLs alive forever, every old slug is recorded here and the listing
-- route 301s old → current.

-- Guarantee slugs never collide at the DB level.
create unique index if not exists boats_slug_key on public.boats (slug);

create table if not exists public.boat_slug_redirects (
  old_slug   text primary key,
  boat_id    uuid not null references public.boats(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists boat_slug_redirects_boat_id_idx
  on public.boat_slug_redirects (boat_id);

-- Public read (the listing route resolves redirects anonymously); writes are
-- service-role only (backfill script + create/rename paths).
alter table public.boat_slug_redirects enable row level security;

drop policy if exists "redirects readable by anyone" on public.boat_slug_redirects;
create policy "redirects readable by anyone"
  on public.boat_slug_redirects for select using (true);
