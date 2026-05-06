-- =======================================================================================
-- MODULE 3: Supabase Database Schema & RLS Policies for Smart Bookmark App
-- =======================================================================================

-- 1. Create the `bookmarks` table
-- This table stores all the user's bookmarks.
create table if not exists public.bookmarks (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    url text not null,
    category text default 'Uncategorized',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Add a basic constraint to ensure the URL at least starts with http
    constraint valid_url check (url ~* '^https?://.*')
);

-- 2. Add Indexes for Query Optimization
-- These indexes optimize the most common queries: fetching a user's bookmarks, 
-- and sorting/filtering by category or date.
create index if not exists bookmarks_user_id_idx on public.bookmarks(user_id);
create index if not exists bookmarks_category_idx on public.bookmarks(category);
create index if not exists bookmarks_created_at_idx on public.bookmarks(created_at desc);

-- 3. Enable Row Level Security (RLS)
-- This is CRITICAL. It ensures that the database engine rejects any query that 
-- tries to access data belonging to another user, regardless of what the frontend sends.
alter table public.bookmarks enable row level security;

-- 4. Create RLS Policies
-- Security is enforced at the database level by tying `auth.uid()` to `user_id`.

-- Policy: Users can only VIEW their own bookmarks
create policy "Users can view their own bookmarks" 
on public.bookmarks for select 
to authenticated 
using (auth.uid() = user_id);

-- Policy: Users can only INSERT their own bookmarks
-- The `with check` block ensures a user cannot insert a row with someone else's user_id.
create policy "Users can insert their own bookmarks" 
on public.bookmarks for insert 
to authenticated 
with check (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own bookmarks
create policy "Users can update their own bookmarks" 
on public.bookmarks for update 
to authenticated 
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Policy: Users can only DELETE their own bookmarks
create policy "Users can delete their own bookmarks" 
on public.bookmarks for delete 
to authenticated 
using (auth.uid() = user_id);

-- 5. Realtime Setup
-- Enable Supabase Realtime for the bookmarks table so the frontend can listen to changes.
-- This publishes INSERT, UPDATE, and DELETE events to connected clients.
alter publication supabase_realtime add table public.bookmarks;

-- =======================================================================================
-- HOW TO USE THIS FILE:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to the SQL Editor on the left sidebar
-- 3. Click "New query"
-- 4. Copy and paste all the contents of this file
-- 5. Click "Run"
-- =======================================================================================
