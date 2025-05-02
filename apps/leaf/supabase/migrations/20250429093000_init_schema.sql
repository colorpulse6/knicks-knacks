-- Enable pgcrypto extension for gen_random_uuid
create extension if not exists "pgcrypto";

-- 1. Users table
create table users (
  id uuid primary key,
  created_at timestamptz default timezone('utc', now())
);

-- 2. Books table (future-proofed)
create table books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text,
  subtitle text,
  author text,
  author_key text,
  description text,
  cover_url text,
  open_library_id text,
  isbn_10 text,
  isbn_13 text,
  publish_date text,
  publisher text,
  page_count int,
  subjects text[],
  language text,
  series text,
  goodreads_id text,
  created_at timestamptz default timezone('utc', now())
);

-- 3. Progress table
create table progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  book_id uuid references books(id) on delete cascade,
  pages_read int,
  chapters_read int,
  percent_complete float,
  updated_at timestamptz default timezone('utc', now())
);
