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

-- Enable Row Level Security (RLS) & allow full access with public anon key for the couple app
alter table public.lablab_movies enable row level security;
alter table public.lablab_food_spots enable row level security;
alter table public.lablab_expenses enable row level security;
alter table public.lablab_memories enable row level security;

create policy "Allow couple read access on movies" on public.lablab_movies for select using (true);
create policy "Allow couple insert access on movies" on public.lablab_movies for insert with check (true);
create policy "Allow couple update access on movies" on public.lablab_movies for update using (true);
create policy "Allow couple delete access on movies" on public.lablab_movies for delete using (true);

create policy "Allow couple read access on food spots" on public.lablab_food_spots for select using (true);
create policy "Allow couple insert access on food spots" on public.lablab_food_spots for insert with check (true);
create policy "Allow couple update access on food spots" on public.lablab_food_spots for update using (true);
create policy "Allow couple delete access on food spots" on public.lablab_food_spots for delete using (true);

create policy "Allow couple read access on expenses" on public.lablab_expenses for select using (true);
create policy "Allow couple insert access on expenses" on public.lablab_expenses for insert with check (true);
create policy "Allow couple update access on expenses" on public.lablab_expenses for update using (true);
create policy "Allow couple delete access on expenses" on public.lablab_expenses for delete using (true);

create policy "Allow couple read access on memories" on public.lablab_memories for select using (true);
create policy "Allow couple insert access on memories" on public.lablab_memories for insert with check (true);
create policy "Allow couple update access on memories" on public.lablab_memories for update using (true);
create policy "Allow couple delete access on memories" on public.lablab_memories for delete using (true);

-- Enable Realtime replication for instant two-phone updates
alter publication supabase_realtime add table public.lablab_movies;
alter publication supabase_realtime add table public.lablab_food_spots;
alter publication supabase_realtime add table public.lablab_expenses;
alter publication supabase_realtime add table public.lablab_memories;
