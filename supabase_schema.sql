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

-- Enable Row Level Security (RLS) & allow full access with public anon key for the couple app
alter table public.lablab_movies enable row level security;
alter table public.lablab_food_spots enable row level security;
alter table public.lablab_expenses enable row level security;
alter table public.lablab_memories enable row level security;
alter table public.lablab_budget enable row level security;

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

