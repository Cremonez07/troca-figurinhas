create extension if not exists "pgcrypto";

create type public.sticker_status as enum ('missing', 'duplicate');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  whatsapp text,
  city text,
  neighborhood text,
  exchange_point text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stickers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  country text,
  player_name text,
  number integer,
  created_at timestamptz not null default now(),
  constraint stickers_code_not_empty check (length(trim(code)) > 0)
);

create table public.user_stickers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  sticker_id uuid not null references public.stickers(id) on delete cascade,
  status public.sticker_status not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, sticker_id)
);

create index user_stickers_user_status_idx on public.user_stickers (user_id, status);
create index user_stickers_sticker_status_idx on public.user_stickers (sticker_id, status);
create index profiles_location_idx on public.profiles (city, neighborhood);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger user_stickers_set_updated_at
before update on public.user_stickers
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.stickers enable row level security;
alter table public.user_stickers enable row level security;

create policy "Profiles are visible to authenticated users"
on public.profiles for select
to authenticated
using (true);

create policy "Users update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Stickers are visible to authenticated users"
on public.stickers for select
to authenticated
using (true);

create policy "Authenticated users can create sticker codes"
on public.stickers for insert
to authenticated
with check (true);

create policy "Users read own stickers and public matching inventory"
on public.user_stickers for select
to authenticated
using (true);

create policy "Users insert own stickers"
on public.user_stickers for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users update own stickers"
on public.user_stickers for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users delete own stickers"
on public.user_stickers for delete
to authenticated
using (auth.uid() = user_id);
