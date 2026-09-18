-- ========================================================
-- LABLAB COUPLE WEB APP - SUPABASE DATABASE SCHEMA
-- ========================================================
-- Run this in your Supabase SQL Editor to set up cloud sync!

-- 1. Movies Table
create table if not exists public.lablab_movies (
  id text primary key,
  title text not null,
  genre text not null,
  duration text,
  rating numeric default 0,
  watched boolean default false,
  notes text,
  streaming text,
  added_by text default 'Migz & Nekol',
  reactions jsonb default '{}'::jsonb,
  poster_url text,
  tmdb_id text,
  is_filipino boolean default false,
  watched_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Food Spots Table
create table if not exists public.lablab_food_spots (
  id text primary key,
  name text not null,
  cuisine text not null,
  area text not null,
  budget text not null,
  gutom_level text not null,
  pagod_level text not null,
  rating numeric default 4.5,
  review_count integer default 100,
  top_dish text,
  google_maps_query text,
  notes text,
  is_custom boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Expenses Table
create table if not exists public.lablab_expenses (
  id text primary key,
  title text not null,
  amount numeric not null,
  category text not null,
  paid_by text not null,
  date text not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Calendar Memories & Photos Table
create table if not exists public.lablab_memories (
  id text primary key,
  date text not null,
  title text not null,
  notes text,
  mood text,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Budget Targets Table (for Gastos Tracker syncing)
create table if not exists public.lablab_budget (
  id text primary key default 'main-budget',
  monthly numeric not null default 10000,
  weekly numeric not null default 2500,
  daily numeric not null default 500,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Couple Live Status & Moods Table
create table if not exists public.lablab_couple_status (
  id text primary key, -- 'migz' or 'nekol'
  partner_name text not null, -- 'Migz' or 'Nekol'
  mood text not null default 'Missing you 💕',
  custom_status text default '',
  battery_level integer default 100,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed initial status if empty
insert into public.lablab_couple_status (id, partner_name, mood, custom_status, battery_level)
values 
  ('migz', 'Migz', 'Craving Ramen 🍜', 'Missing my bebe Nekol! 💕', 100),
  ('nekol', 'Nekol', 'Craving Boba 🧋', 'Thinking of Migz 🖤', 100)
on conflict (id) do nothing;

-- 7. Love Coupons & Date Vouchers Table
create table if not exists public.lablab_coupons (
  id text primary key,
  title text not null,
  category text default 'Sweet Treat',
  emoji text default '🎟️',
  for_user text not null default 'Both', -- 'Migz', 'Nekol', or 'Both'
  is_redeemed boolean default false,
  redeemed_by text,
  redeemed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed default coupons if table is empty
insert into public.lablab_coupons (id, title, category, emoji, for_user, is_redeemed)
values
  ('coup-1', '1 Free Full-Body / Back Massage 💆', 'Relaxation 💆', '💆', 'Both', false),
  ('coup-2', 'Nekol Picks Dinner (Migz Pays, Zero Reklamo!) 🍽️', 'Food Trip 🍽️', '🍽️', 'Nekol', false),
  ('coup-3', 'Late Night McDo / Ice Cream Drive-Thru Run 🍦', 'Midnight Craving 🍦', '🍦', 'Both', false),
  ('coup-4', 'Movie Night Veto Pass (Can Change Movie Anytime) 🎬', 'Entertainment 🎬', '🎬', 'Both', false),
  ('coup-5', 'Migz Does All the Dishes & Kitchen Chores Today 🧹', 'House Helper 🧹', '🧹', 'Nekol', false),
  ('coup-6', 'Breakfast in Bed with Favorite Boba / Coffee 🧋', 'Sweet Morning ☕', '☕', 'Both', false)
on conflict (id) do nothing;

-- Seamless Column Additions for Existing Tables (Attribution, TMDB Posters & Real-time Reactions)
alter table public.lablab_movies add column if not exists added_by text default 'Migz & Nekol';
alter table public.lablab_movies add column if not exists reactions jsonb default '{}'::jsonb;
alter table public.lablab_movies add column if not exists poster_url text;
alter table public.lablab_movies add column if not exists tmdb_id text;
alter table public.lablab_movies add column if not exists is_filipino boolean default false;
alter table public.lablab_movies add column if not exists watched_at timestamp with time zone;

alter table public.lablab_food_spots add column if not exists added_by text default 'Migz & Nekol';
alter table public.lablab_food_spots add column if not exists reactions jsonb default '{}'::jsonb;

alter table public.lablab_expenses add column if not exists logged_by text default 'Migz';

alter table public.lablab_memories add column if not exists captured_by text default 'Migz & Nekol';
alter table public.lablab_memories add column if not exists reactions jsonb default '{}'::jsonb;

-- Enable Row Level Security (RLS) & allow full access with public anon key for the couple app
alter table public.lablab_movies enable row level security;
alter table public.lablab_food_spots enable row level security;
alter table public.lablab_expenses enable row level security;
alter table public.lablab_memories enable row level security;
alter table public.lablab_budget enable row level security;
alter table public.lablab_couple_status enable row level security;
alter table public.lablab_coupons enable row level security;

-- Policies for Movies
drop policy if exists "Allow couple read access on movies" on public.lablab_movies;
create policy "Allow couple read access on movies" on public.lablab_movies for select using (true);
drop policy if exists "Allow couple insert access on movies" on public.lablab_movies;
create policy "Allow couple insert access on movies" on public.lablab_movies for insert with check (true);
drop policy if exists "Allow couple update access on movies" on public.lablab_movies;
create policy "Allow couple update access on movies" on public.lablab_movies for update using (true);
drop policy if exists "Allow couple delete access on movies" on public.lablab_movies;
create policy "Allow couple delete access on movies" on public.lablab_movies for delete using (true);

-- Policies for Food Spots
drop policy if exists "Allow couple read access on food spots" on public.lablab_food_spots;
create policy "Allow couple read access on food spots" on public.lablab_food_spots for select using (true);
drop policy if exists "Allow couple insert access on food spots" on public.lablab_food_spots;
create policy "Allow couple insert access on food spots" on public.lablab_food_spots for insert with check (true);
drop policy if exists "Allow couple update access on food spots" on public.lablab_food_spots;
create policy "Allow couple update access on food spots" on public.lablab_food_spots for update using (true);
drop policy if exists "Allow couple delete access on food spots" on public.lablab_food_spots;
create policy "Allow couple delete access on food spots" on public.lablab_food_spots for delete using (true);

-- Policies for Expenses
drop policy if exists "Allow couple read access on expenses" on public.lablab_expenses;
create policy "Allow couple read access on expenses" on public.lablab_expenses for select using (true);
drop policy if exists "Allow couple insert access on expenses" on public.lablab_expenses;
create policy "Allow couple insert access on expenses" on public.lablab_expenses for insert with check (true);
drop policy if exists "Allow couple update access on expenses" on public.lablab_expenses;
create policy "Allow couple update access on expenses" on public.lablab_expenses for update using (true);
drop policy if exists "Allow couple delete access on expenses" on public.lablab_expenses;
create policy "Allow couple delete access on expenses" on public.lablab_expenses for delete using (true);

-- Policies for Memories
drop policy if exists "Allow couple read access on memories" on public.lablab_memories;
create policy "Allow couple read access on memories" on public.lablab_memories for select using (true);
drop policy if exists "Allow couple insert access on memories" on public.lablab_memories;
create policy "Allow couple insert access on memories" on public.lablab_memories for insert with check (true);
drop policy if exists "Allow couple update access on memories" on public.lablab_memories;
create policy "Allow couple update access on memories" on public.lablab_memories for update using (true);
drop policy if exists "Allow couple delete access on memories" on public.lablab_memories;
create policy "Allow couple delete access on memories" on public.lablab_memories for delete using (true);

-- Policies for Budget
drop policy if exists "Allow couple read access on budget" on public.lablab_budget;
create policy "Allow couple read access on budget" on public.lablab_budget for select using (true);
drop policy if exists "Allow couple insert access on budget" on public.lablab_budget;
create policy "Allow couple insert access on budget" on public.lablab_budget for insert with check (true);
drop policy if exists "Allow couple update access on budget" on public.lablab_budget;
create policy "Allow couple update access on budget" on public.lablab_budget for update using (true);
drop policy if exists "Allow couple delete access on budget" on public.lablab_budget;
create policy "Allow couple delete access on budget" on public.lablab_budget for delete using (true);

-- Policies for Couple Status
drop policy if exists "Allow couple read access on couple_status" on public.lablab_couple_status;
create policy "Allow couple read access on couple_status" on public.lablab_couple_status for select using (true);
drop policy if exists "Allow couple insert access on couple_status" on public.lablab_couple_status;
create policy "Allow couple insert access on couple_status" on public.lablab_couple_status for insert with check (true);
drop policy if exists "Allow couple update access on couple_status" on public.lablab_couple_status;
create policy "Allow couple update access on couple_status" on public.lablab_couple_status for update using (true);
drop policy if exists "Allow couple delete access on couple_status" on public.lablab_couple_status;
create policy "Allow couple delete access on couple_status" on public.lablab_couple_status for delete using (true);

-- Policies for Coupons
drop policy if exists "Allow couple read access on coupons" on public.lablab_coupons;
create policy "Allow couple read access on coupons" on public.lablab_coupons for select using (true);
drop policy if exists "Allow couple insert access on coupons" on public.lablab_coupons;
create policy "Allow couple insert access on coupons" on public.lablab_coupons for insert with check (true);
drop policy if exists "Allow couple update access on coupons" on public.lablab_coupons;
create policy "Allow couple update access on coupons" on public.lablab_coupons for update using (true);
drop policy if exists "Allow couple delete access on coupons" on public.lablab_coupons;
create policy "Allow couple delete access on coupons" on public.lablab_coupons for delete using (true);

-- Enable Realtime replication for instant two-phone updates
do $$
begin
  alter publication supabase_realtime add table public.lablab_movies;
exception when others then null; end $$;

do $$
begin
  alter publication supabase_realtime add table public.lablab_food_spots;
exception when others then null; end $$;

do $$
begin
  alter publication supabase_realtime add table public.lablab_expenses;
exception when others then null; end $$;

do $$
begin
  alter publication supabase_realtime add table public.lablab_memories;
exception when others then null; end $$;

do $$
begin
  alter publication supabase_realtime add table public.lablab_budget;
exception when others then null; end $$;

do $$
begin
  alter publication supabase_realtime add table public.lablab_couple_status;
exception when others then null; end $$;

do $$
begin
  alter publication supabase_realtime add table public.lablab_coupons;
exception when others then null; end $$;

